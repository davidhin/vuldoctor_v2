import json
import os
import shutil

import pymongo
import requests
from flask import Blueprint, Response, request
from flask_cors import CORS

import nvd

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint(
    "urls",
    __name__,
)
CORS(routes)

# Connect to mongodb
client = pymongo.MongoClient(os.getenv("MONGODB_TOKEN"))


@routes.route("/", methods=["GET"])
def nvd_refresh():
    """Download NVD data and import to mongodb."""
    # Get modified metadata from NVD website
    nvdmeta = requests.get(
        "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-modified.meta"
    ).text
    nvdmeta = dict([i.split(":", 1) for i in nvdmeta.splitlines()])
    force = request.args.get("force", default=1, type=str)

    # Get database last update metadata
    mongo_nvdmeta = client.main.nvdmeta
    dbnvdmeta = mongo_nvdmeta.find_one(sort=[("_id", -1)])
    if not dbnvdmeta:
        mongo_nvdmeta.insert_one(nvdmeta)

    # If not updated since last time
    if dbnvdmeta and force != "true":
        if dbnvdmeta["sha256"] == nvdmeta["sha256"]:
            return "Unchanged"

    fileDirectory = "downloads/"

    # Download Data
    nvd.nvdRefresh(fileDirectory)

    # Parse data
    cves = nvd.parseJSON(fileDirectory)

    # Save data
    with open("cve.json", "w", encoding="utf-8") as f:
        json.dump(cves, f, ensure_ascii=False, indent=4)

    # Matched CVEs in database
    old_cves = nvd.get_cves_mongodb([i["cve_id"] for i in cves], client)
    old_cves = list(old_cves)
    old_cve_dict = dict([[i["cve_id"], i["modified"]] for i in old_cves])

    # Get added / modified CVEs
    added = []
    modified = []
    for cve in cves:
        if cve["cve_id"] in old_cve_dict:
            if cve["modified"] != old_cve_dict[cve["cve_id"]]:
                modified.append(cve["cve_id"])
        else:
            added.append(cve["cve_id"])

    if len(added) + len(modified) == 0:
        nvdmeta["message"] = "NOCHANGES"
        mongo_nvdmeta.insert_one(nvdmeta)
        return "No changes!"

    # Affected CPEs
    cpes = [i for j in [i["cpes"] for i in cves] for i in j]
    print(len(cpes))

    # Upload to mongodb
    os.system("bash import_update.sh")
    nvdmeta["message"] = "UPDATEDNVD"
    mongo_nvdmeta.insert_one(nvdmeta)

    # Remove data
    shutil.rmtree(fileDirectory)
    os.remove("cve.json")

    return "Updated NVD Database"


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
        json.dump(cves, f, ensure_ascii=False, indent=4)

    # Upload to mongodb
    os.system("bash import_drop.sh")

    # Remove data
    shutil.rmtree(fileDirectory)
    os.remove("cve.json")

    return Response(status=200)
