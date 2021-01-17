import os

from flask import (Blueprint, Flask, flash, redirect, render_template, request,
                   url_for)
from flask_cors import CORS
from routes import routes

# :TRICKY Need to import flask_cors to automatically handle all CORS headers
CORS(routes)

app = Flask(__name__)
app.secret_key = b"\xa6<\xcff\xde\xf5\x1b\xf5\x1c\x8cx\x1byS\x00\x16"

# Register routes from functions file
app.register_blueprint(routes)

if __name__ == "__main__":
    app.config["SESSION_TYPE"] = "filesystem"
    sess.init_app(app)
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
