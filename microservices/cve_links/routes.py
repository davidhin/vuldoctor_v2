import json

from flask import Blueprint
from flask_cors import CORS

from cve_links import get_links_by_cve
from mongo_db import VulDoctorDB

# Registering routes to 'routes' so they can be accessed in other files
routes = Blueprint(
    "urls",
    __name__,
)
CORS(routes)

vul_db = VulDoctorDB()


@routes.route("/<cve>", methods=["GET"])
def cve_links(cve):
    """Return extern links of CVE."""
    return json.dumps(get_links_by_cve(cve, vul_db))
