from flask import Blueprint, render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from . import cnx, cur

views = Blueprint("views", __name__)

@views.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@views.route("/existing_email", methods=["GET"])
def existing_email():
    new_email = request.args.get('new_email')
    print(new_email)
    cur.execute(f"SELECT email FROM Users WHERE email = '{new_email}'")
    result = bool(cur.fetchone())
    return {"email_exists": result}

@views.route("/create_user", methods=["PUT"])
def create_user():
    user_name = request.get_json()["user_name"]
    user_email = request.get_json()["user_email"]
    password = request.get_json()["password"]
    password_hash = generate_password_hash(password) # in a format of method$salt$hash
    print(f"creating new user: {user_name}, {user_email}, {password_hash}")
    cur.execute(f"""INSERT INTO Users(email, user_name, password_hash)
        VALUES ('{user_email}', '{user_name}', '{password_hash}')""")
    cnx.commit()
    return "created"