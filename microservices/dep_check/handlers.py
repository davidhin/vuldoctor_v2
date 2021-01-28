import os
from glob import glob
from pathlib import Path

from flask import Response, request

from fire import deleteDB, setDB
from mongoatlas import update_last_checked_date
from scan import allowed_file, depscan, serialise_request_files


def analyse_github(uid, projectid, github_token, reponame, bucket, client):
    """Use dep-scan on a GitHub repository

    Args:
        uid (str): User ID
        projectid (str): Project ID
        github_token (str): Github personal access token
        reponame (str): name of repo e.g. username/reponame
        bucket (GCS bucket object): Google Cloud Storage "vuldoctor2" bucket
        client (Mongodb client): Mongodb "vulcluster" client

    Returns:
        [response]: 200 if success, 400/204 if failure
    """
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
    depscan_result = depscan(files, filedir, bucket, uid, projectid, client)

    if not depscan_result:
        deleteDB(uid, projectid)
        return Response(status=400)

    # Set mongodb lastcheckeddate
    update_last_checked_date(uid, projectid, client)

    # Unset processing
    deleteDB(uid, projectid)
    return Response(status=200)


def analyse_uploaded_files(uid, projectid, bucket, client):
    """Perform analysis on uploaded files.

    Args:
        uid (str): User ID
        projectid (str): Project ID
        bucket (GCS bucket object): Google Cloud Storage "vuldoctor2" bucket
        client (Mongodb client): Mongodb "vulcluster" client

    Returns:
        [response]: 200 if success, 400/204 if failure
    """
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
    depscan_result = depscan(files, filedir, bucket, uid, projectid, client)

    if not depscan_result:
        deleteDB(uid, projectid)
        return Response(status=400)

    # Unset processing
    deleteDB(uid, projectid)
    return Response(status=200)
