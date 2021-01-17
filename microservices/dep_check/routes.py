import glob
import json
import os
import shutil
import uuid
from pathlib import Path

from flask import Blueprint, Response, flash, request
from flask_cors import CORS
from google.cloud import storage

from authenticateToken import authenticateToken
from parsers import checkFile

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint("urls", __name__,)
CORS(routes)

# Create a Cloud Storage client.
gcs = storage.Client()

# Get the bucket that the file will be uploaded to.
bucket = gcs.get_bucket("vuldoctor2")


def allowed_file(filename):
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


@routes.route("/", methods=["POST"])
def upload_file():

    # Authenticate User
    try:
        decoded_token = authenticateToken(request)
        uid = decoded_token["uid"]
    except:
        resp = Response(status=403)
        return resp

    # Serialise files onto disk
    projectid = str(uuid.uuid4().hex)
    filedir = "upload/" + uid + "/" + projectid + "/"
    Path(filedir).mkdir(parents=True, exist_ok=True)
    files = []
    if "file" not in request.files:
        flash("No file part")
        return Response(status=204)
    n_files = 0
    n_allowed = 0
    for file in request.files.getlist("file"):
        if file.filename == "":
            flash("No selected file")
            return Response(status=204)
        if file:
            n_files += 1
        if file and allowed_file(file.filename):
            file.save(filedir + file.filename)
            files.append(filedir + file.filename)
            n_allowed += 1

    # Extracted import data
    extracted_imports = []
    for file in files:
        extracted_imports.append(checkFile(file))
    # print(extracted_imports);

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
    return Response(status=200)
