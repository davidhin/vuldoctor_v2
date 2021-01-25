import firebase_admin
from firebase_admin import auth, db

firebase_admin.initialize_app(
    options={"databaseURL": "https://solid-mantra-301604-default-rtdb.firebaseio.com/"}
)


def authenticateToken(request):
    """Use to authenticate and decode Firebase Auth token.

    Args:
        request ([flask request obj]): Req. with Authorization header

    Returns:
        [obj]: decoded Firebase token
    """
    auth_token = request.headers.get("Authorization").split("Bearer ")[1]
    decoded_token = auth.verify_id_token(auth_token)
    return decoded_token


def setDB(uid, key):
    """Use to set projectID state to Loading using Firebase Realtime DB.

    Args:
        key ([str]): projectID string
    """
    db.reference("/" + uid).child(key).set(1)


def deleteDB(uid, key):
    """Use to delete projectID from Realtime DB when processing finished.

    Args:
        key ([str]): projectID string
    """
    db.reference("/" + uid).child(key).delete()
