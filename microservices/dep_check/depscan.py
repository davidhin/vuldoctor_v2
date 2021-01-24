import glob
import json
import os
import shutil

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


def depscan(files, filedir, bucket, uid, projectid):

    # Extracted import data
    extracted_imports = []
    for file in files:
        extracted_imports.append(checkFile(file))

    # Save extracted dependencies
    blob = bucket.blob(uid + "/" + projectid + "/" + "extracted_deps.json")
    blob.upload_from_string(
        data=json.dumps(extracted_imports), content_type="application/json"
    )

    # Run dep-scan
    src = filedir
    rpt = filedir + "reports/depscan.json"
    os.system("scan --src {} --report_file {} --sync".format(src, rpt))

    # Get project type and upload results
    results_files = glob.glob(filedir + "reports/*")
    if len(results_files) == 0:
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

    # Remove files from container
    shutil.rmtree(filedir)
    return True
