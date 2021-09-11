from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from . import cnx, cur

views = Blueprint("views", __name__)

@views.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@views.route("/login", methods=["POST"])
def login():
    # email = request.get_json()["email"]
    # password = request.get_json()["password"]
    email = request.form.get("email")
    password = request.form.get("password")
    cur.execute(f"SELECT password_hash, user_name FROM Users WHERE email = '{email}'")
    data_fr_db = cur.fetchone()
    if data_fr_db and check_password_hash(data_fr_db[0], password):
        session["user_email"] = email
        session["user_name"] = data_fr_db[1]
        session.permanent = True
        # debug only:
        print(f"logged in: {email, password}")
        return redirect(url_for("views.content"))
        # return jsonify({
        #     "redirect": "logged in successfully, redirecting to content...",
        #     "location": url_for("views.content")}), 302
    else:
        # debug only:
        print("incorrect credentials")
        return "incorrect credentials", 403

@views.route("/logout")
def logout():
    return

@views.route("/existing_email", methods=["GET"])
def existing_email():
    new_email = request.args.get("new_email")
    cur.execute(f"SELECT email FROM Users WHERE email = '{new_email}'")
    result = bool(cur.fetchone())
    return {"email_exists": result}

@views.route("/user_creation", methods=["PUT"])
def user_creation():
    # user_name = request.get_json()["user_name"].strip()
    # user_email = request.get_json()["user_email"].strip()
    user_name = request.form.get("user_name").strip()
    user_email = request.form.get("user_email").strip()

    cur.execute(f"SELECT email FROM Users WHERE email = '{user_email}'")
    if cur.fetchone():
        return "User email already registered", 403

    # password = request.get_json()["password"].strip()
    password = request.form.get("password").strip()
    if len(password) < 6 or len(password) > 30:
        return "Password length error", 403

    password_hash = generate_password_hash(password) # in a format of "method$salt$hash"
    print(f"creating new user: {user_name}, {user_email}, {password_hash}")
    cur.execute(f"""INSERT INTO Users(email, user_name, password_hash)
        VALUES ('{user_email}', '{user_name}', '{password_hash}')""")
    cnx.commit()

    cur.execute(f"SELECT password_hash, user_name FROM Users WHERE email = '{user_email}'")
    data_fr_db = cur.fetchone()
    if data_fr_db and check_password_hash(data_fr_db[0], password):
        session["user_email"] = user_email
        session["user_name"] = data_fr_db[1]
        session.permanent = True
        # debug only:
        print(f"logged in: {user_email, password}")
    return redirect(url_for("views.content"))

@views.route("/user_chg_pw", methods=["PUT"])
def user_chg_pw():
    return

@views.route("/user_deletion", methods=["DELETE"])
def user_deletion():
    return

@views.route("/content", methods=["GET"])
def content():
    if not session["user_email"]:
        print(session["user_email"], "is the current user")
        return redirect(url_for("views.index"))
    
    return render_template("content.html")
