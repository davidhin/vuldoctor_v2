import json
import os
import shutil

import pymongo
from flask import Blueprint, Response
from flask_cors import CORS

import nvd

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint("urls", __name__,)
CORS(routes)

# Connect to mongodb
client = pymongo.MongoClient(os.getenv("MONGODB_TOKEN"))


@routes.route("/", methods=["GET"])
def nvd_refresh():
    """Download NVD data and import to mongodb."""
    fileDirectory = "downloads/"

    # Download Data
    nvd.nvdRefresh(fileDirectory)

    # Parse data
    cves = nvd.parseJSON(fileDirectory)

    # Save data
    with open("cve.json", "w", encoding="utf-8") as f:
        json.dump(cves.tolist(), f, ensure_ascii=False, indent=4)

    # Matched CVEs in database
    old_cves = nvd.get_cves_mongodb([i["cve_id"] for i in cves], client)
    old_cves = list(old_cves)
    old_cve_set = set([i["cve_id"] for i in old_cves])

    # Get added / modified CVEs
    added = []
    modified = []
    for cve in cves:
        if cve["cve_id"] in old_cve_set:
            modified.append(cve["cve_id"])
        else:
            added.append(cve["cve_id"])

    # Affected CPEs
    cpes = [i for j in [i["cpes"] for i in cves] for i in j]
    print(len(cpes))

    # Upload to mongodb
    os.system("bash import_update.sh")

    # Remove data
    shutil.rmtree(fileDirectory)
    os.remove("cve.json")

    return Response(status=200)


@routes.route("/dropupdate", methods=["GET"])
def nvd_drop_update():
    """Download NVD data and import to mongodb."""
    fileDirectory = "downloads_all/"

    # Download Data
    nvd.nvdFeed(fileDirectory)

    # Parse data
    cves = nvd.parseJSON(fileDirectory)

    # Save data
    with open("cve.json", "w", encoding="utf-8") as f:
        json.dump(cves.tolist(), f, ensure_ascii=False, indent=4)

    # Upload to mongodb
    os.system("bash import_drop.sh")

    # Remove data
    shutil.rmtree(fileDirectory)
    os.remove("cve.json")

    return Response(status=200)
