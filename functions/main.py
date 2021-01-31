import os
from threading import Thread

import pymongo
import requests

client = pymongo.MongoClient(os.getenv("MONGODB_TOKEN"))


def async_request(method, *args, **kwargs):
    """Make request on a different thread."""
    thread = Thread(target=method, args=args, kwargs=kwargs)
    thread.start()


def send_auto_repo_requests(request):
    """HTTP Cloud Function."""
    # Get database auto-repo updates
    auto_repos = client.main.projects.aggregate(
        [
            {"$unwind": "$projects"},
            {"$match": {"projects.autorepo": True}},
            {"$project": {"projects.pid": 1, "_id": 0}},
        ]
    )
    projects = [i["projects"]["pid"] for i in auto_repos]

    # Run processing for autorepos
    # TODO(Make this authenticated)
    for p in projects:
        async_request(
            requests.post,
            "http://localhost:5001/auto_repo",
            json={"pid": p},
        )

    return "Updated MongoDB NVD Collection"
