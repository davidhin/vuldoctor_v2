import os
from glob import glob
from pathlib import Path

import pymongo
from flask import Blueprint, Response, request
from flask_cors import CORS
from google.cloud import storage

from depscan import allowed_file, depscan, serialise_request_files
from fire import authenticateToken, deleteDB, setDB
from mongoatlas import get_github_token, update_last_checked_date

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint("urls", __name__,)
CORS(routes)

# Create a Cloud Storage client.
gcs = storage.Client()

# Get the bucket that the file will be uploaded to.
bucket = gcs.get_bucket("vuldoctor2")

# Connect to mongodb
client = pymongo.MongoClient(os.getenv("MONGODB_TOKEN"))


@routes.route("/run_github", methods=["POST"])
def run_github():
    """Perform depscan through web interface GitHub reload.

    Returns:
        [response]: 200 if success, 400/204 if failure
    """
    # Authenticate User
    try:
        decoded_token = authenticateToken(request)
        uid = decoded_token["uid"]
        request_data = request.get_json(force=True)
        github_token = get_github_token(uid, client)
        reponame = request_data["name"]
        projectid = request_data["pid"]
    except Exception as e:
        print(e)
        resp = Response(status=403)
        return resp

    # Set Processing
    setDB(uid, projectid)

    # Create working directory
    filedir = "upload/" + uid + "/" + projectid + "/"
    Path(filedir).mkdir(parents=True, exist_ok=True)

    # Clone GitHub to working directory
    os.system(
        "git clone https://{}@github.com/{}.git {}".format(
            github_token, reponame, filedir
        )
    )

    # Get files
    files = glob(filedir + "**", recursive=True)
    files = [i for i in files if allowed_file(i)]

    # Perform dep scanning
    depscan_result = depscan(files, filedir, bucket, uid, projectid)

    if not depscan_result:
        deleteDB(uid, projectid)
        return Response(status=400)

    # Set mongodb lastcheckeddate
    update_last_checked_date(uid, projectid, client)

    # Unset processing
    deleteDB(uid, projectid)
    return Response(status=200)


@routes.route("/", methods=["POST"])
def upload_file():
    """Perform depscan through web interface file upload.

    Returns:
        [reponse]: 200 if success, 400/204 if failure
    """
    # Authenticate User
    try:
        decoded_token = authenticateToken(request)
        uid = decoded_token["uid"]
        projectid = request.args.get("projectID")
    except Exception as e:
        print(e)
        resp = Response(status=403)
        return resp

    # Set Processing
    setDB(uid, projectid)

    # Create working directory
    filedir = "upload/" + uid + "/" + projectid + "/"
    Path(filedir).mkdir(parents=True, exist_ok=True)

    # Serialise files from request
    files = serialise_request_files(request, filedir)
    if not files:
        return Response(status=204)

    # Perform dep scanning
    depscan_result = depscan(files, filedir, bucket, uid, projectid)

    if not depscan_result:
        deleteDB(uid, projectid)
        return Response(status=400)

    # Unset processing
    deleteDB(uid, projectid)
    return Response(status=200)
