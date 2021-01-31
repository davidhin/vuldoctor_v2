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
        uid, projectid, github_token, reponame, bucket, client, True
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


@routes.route("/auto_repo", methods=["POST"])
def auto_repo():
    """Use to automatically perform github scanning given only project id.

    SECURITY: MAKE ROUTE AUTHENTICATED

    Returns:
        [response]: 200 if success, 400/204 if failure
    """
    request_data = request.get_json(force=True)
    projectid = request_data["pid"]
    project = client.main.projects.find_one(
        {"projects": {"$elemMatch": {"pid": projectid}}},
        {"projects.name.$": 1, "uid": 1, "_id": 0},
    )
    uid = project["uid"]
    reponame = project["projects"][0]["name"]
    github_token = get_github_token(uid, client)

    return handlers.analyse_github(
        uid, projectid, github_token, reponame, bucket, client, True
    )
