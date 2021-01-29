import glob
import json
import os
import shutil
from datetime import datetime

from parsers import checkFile


def allowed_file(filename):
    """Check whether filetype should be accepted.

    Args:
        filename ([str]): string representation of filename, e.g. test.py

    Returns:
        [bool]: true or false
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {
        "py",
        "java",
        "js",
        "json",
        "xml",
        "lock",
        "gradle",
        "kts",
        "sbt",
        "txt",
        "sum",
        "csproj",
    }


def serialise_request_files(request, filedir):
    """Save files from request (multipart/form-data) to specified directory.

    Args:
        request ([flask request object]): request object that contains files.
        filedir ([str]): directory to save files

    Returns:
        [array<str>]: array of filenames based on save directory, or None if error.
    """
    files = []
    if "file" not in request.files:
        return None
    for file in request.files.getlist("file"):
        if file.filename == "":
            return None
        if file and allowed_file(file.filename):
            file.save(filedir + file.filename)
            files.append(filedir + file.filename)
    return files


def count_vulns(data):
    """Count number of vulnerabilities in depscan output.

    Args:
        data (str): String representation of depscan "json" output

    Returns:
        [high, med, low]: Number of high/med/low severity vulnerabilities
    """
    high = data.count('"severity": "HIGH"')
    high += data.count('"severity": "CRITICAL"')
    med = data.count('"severity": "MEDIUM"')
    low = data.count('"severity": "LOW"')
    return high, med, low


def get_id(data):
    """Use json parsing to get IDs from depscan output.

    Args:
        data (str): String representation of depscan "json" output
    """
    return json.loads(data)["id"]


def depscan(files, filedir, bucket, uid, projectid, client, notify):
    """Run depscan tool on extracted files.

    Args:
        files ([array]): filenames of saved files
        filedir ([str]): directory of saved files
        bucket ([gcs bucket]): Google cloud services bucket
        uid ([str]): user id (from firebase auth)
        projectid ([str]): project id (generated on server)
        notify (bool): Whether or not to send an email to user if the
        vulnerability status of the project has changed.

    Returns:
        [bool]: True if completed, None if error
    """
    # Extracted import data
    extracted_imports = []
    for file in files:
        extracted_imports.append(checkFile(file))

    # Save extracted dependencies
    blob = bucket.blob(uid + "/" + projectid + "/" + "extracted_deps.json")
    blob.upload_from_string(
        data=json.dumps(extracted_imports), content_type="application/json"
    )

    # Download old depscan
    if notify:
        filename = uid + "/" + projectid + "/" + "depscan.json"
        blob = bucket.get_blob(filename)
        old_depscan = blob.download_as_string().decode()

    # Run dep-scan
    src = filedir
    rpt = filedir + "reports/depscan.json"
    os.system("scan --src {} --report_file {} --sync".format(src, rpt))

    # Get project type and upload results
    results_files = glob.glob(filedir + "reports/*")
    if len(results_files) == 0:
        shutil.rmtree(filedir)
        return None

    depscan_file = [i for i in results_files if "depscan" in i]
    if len(depscan_file) == 0:
        print("No vulnerabilities detected.")
        bom_file = [i for i in results_files if "bom" in i][0]
        project_type = bom_file.split("-")[1].split(".")[0]
        blob = bucket.blob(uid + "/" + projectid + "/" + "bom.json")
        blob.upload_from_filename(filedir + "reports/bom-{}.json".format(project_type))
        blob = bucket.blob(uid + "/" + projectid + "/" + "depscan.json")
        blob.upload_from_string(data=json.dumps({}), content_type="application/json")
    else:
        depscan_file = depscan_file[0]
        project_type = depscan_file.split("-")[1].split(".")[0]
        blob = bucket.blob(uid + "/" + projectid + "/" + "bom.json")
        blob.upload_from_filename(filedir + "reports/bom-{}.json".format(project_type))
        blob = bucket.blob(uid + "/" + projectid + "/" + "depscan.json")
        blob.upload_from_filename(
            filedir + "reports/depscan-{}.json".format(project_type)
        )
        # Calculate high/med/low
        with open(filedir + "reports/depscan-{}.json".format(project_type)) as file:
            data = file.read()
            high, med, low = count_vulns(data)
            client.main.projects.update_one(
                {"uid": uid, "projects": {"$elemMatch": {"pid": projectid}}},
                {
                    "$set": {
                        "projects.$.high_sev": high,
                        "projects.$.med_sev": med,
                        "projects.$.low_sev": low,
                        "projects.$.reqOnly": False,
                    }
                },
            )
            if notify:
                new_vulns = []
                # TODO: ARRAY SLICING IS FOR TESTING
                old_ids = set([get_id(i) for i in old_depscan.splitlines()][2:])
                for new_vuln in data.splitlines():
                    if get_id(new_vuln) not in old_ids:
                        new_vulns.append(json.loads(new_vuln))
                if len(new_vulns) > 0:
                    # Upload to history
                    nowtime = datetime.now()
                    date = nowtime.strftime("%d%m%Y")
                    longtime = nowtime.strftime("%d/%m/%Y, %I:%M:%S %P").replace(
                        " 0", " "
                    )

                    client.main.projects.update_one(
                        {"uid": uid, "projects": {"$elemMatch": {"pid": projectid}}},
                        {
                            "$addToSet": {
                                "projects.$.history": date,
                            }
                        },
                    )
                    blob = bucket.blob(
                        uid + "/" + projectid + "/" + "depscan_{}.json".format(date)
                    )
                    blob.upload_from_string(
                        data=json.dumps(
                            {
                                "date": longtime,
                                "vulns": new_vulns,
                            }
                        ),
                        content_type="application/json",
                    )
                    # TODO(SEND EMAIL HERE)

    # Remove files from container
    shutil.rmtree(filedir)
    return True
