import os

import pymongo


def get_github_token(uid):
    """Connect to MongoDB and obtain GitHub personal access token from uid.

    Args:
        uid ([str]): user id (firebase auth)

    Returns:
        [str]: UID's personal access token for GitHub
    """
    # Connect to MongoDB
    client = pymongo.MongoClient(os.getenv("MONGODB_TOKEN"))
    db = client.main.users
    return db.find_one({"uid": uid})["ghtoken"]
