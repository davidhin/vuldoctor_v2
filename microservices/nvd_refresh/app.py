import os

from flask import Flask
from flask_cors import CORS
from routes import routes

CORS(routes)

app = Flask(__name__)

# Register routes from functions file
app.register_blueprint(routes)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
