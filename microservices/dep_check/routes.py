import os

import pymongo
from flask import Blueprint, Response, request
from flask_cors import CORS
from google.cloud import storage

import handlers
from fire import authenticateToken
from mongoatlas import get_github_token

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint(
    "urls",
    __name__,
)
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

    return handlers.analyse_github(
        uid, projectid, github_token, reponame, bucket, client
    )


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

    return handlers.analyse_uploaded_files(uid, projectid, bucket, client)
