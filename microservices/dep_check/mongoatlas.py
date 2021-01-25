from datetime import datetime


def get_github_token(uid, client):
    """Connect to MongoDB and obtain GitHub personal access token from uid.

    Args:
        uid ([str]): user id (firebase auth)
        client ([mongodbclient]): mongodb client

    Returns:
        [str]: UID's personal access token for GitHub
    """
    db = client.main.users
    return db.find_one({"uid": uid})["ghtoken"]


def update_last_checked_date(uid, projectid, client):
    """Connect to MongoDB and updaate last_checked_date given projectid.

    Args:
        projectid ([str]): string representation of projectid
        client ([mongodbclient]): mongodb client

    """
    today = datetime.now()
    d1 = today.strftime("%d/%m/%Y, %I:%M:%S %P").replace(" 0", " ")
    client.main.projects.update_one(
        {"uid": uid, "projects": {"$elemMatch": {"pid": projectid}}},
        {"$set": {"projects.$.date": d1}},
    )
