import firebase_admin
from firebase_admin import auth

firebase_admin.initialize_app()

def authenticateToken(request):
    auth_token = request.headers.get("Authorization").split("Bearer ")[1]
    decoded_token = auth.verify_id_token(auth_token)
    return decoded_token;
