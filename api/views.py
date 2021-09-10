from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from . import cnx, cur

views = Blueprint("views", __name__)

@views.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@views.route("/login", methods=["POST"])
def login():
    email = request.get_json()['email']
    password = request.get_json()['password']
    cur.execute(f"SELECT password_hash FROM Users WHERE email = '{email}'")
    hash_fr_db = cur.fetchone()
    if check_password_hash(hash_fr_db[0], password):
        # debug only:
        print(f"logged in: {email, password}")
        # return redirect(url_for("views.content"))
        return jsonify({"redirect": "logged in successfully, redirecting to content...",
            "location": url_for("views.content")}), 302
    else:
        print("log in failed")
        return ""

@views.route("/existing_email", methods=["GET"])
def existing_email():
    new_email = request.args.get("new_email")
    cur.execute(f"SELECT email FROM Users WHERE email = '{new_email}'")
    result = bool(cur.fetchone())
    return {"email_exists": result}

@views.route("/user_creation", methods=["PUT"])
def user_creation():
    user_name = request.get_json()["user_name"]
    user_email = request.get_json()["user_email"]
    password = request.get_json()["password"]
    password_hash = generate_password_hash(password) # in a format of "method$salt$hash"
    print(f"creating new user: {user_name}, {user_email}, {password_hash}")
    cur.execute(f"""INSERT INTO Users(email, user_name, password_hash)
        VALUES ('{user_email}', '{user_name}', '{password_hash}')""")
    cnx.commit()
    return "created"

@views.route("/user_chg_pw", methods=["PUT"])
def user_chg_pw():
    return

@views.route("/user_deletion", methods=["DELETE"])
def user_deletion():
    return

@views.route("/content", methods=["GET"])
def content():
    return "content"
