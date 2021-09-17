import re
from datetime import datetime

from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from . import cnx
from .data import *
from .shoplist import scrap_product_data

views = Blueprint("views", __name__)

def validate_user():
    if session.get("user_id"): return True
    else: return False

@views.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@views.route("/login", methods=["POST"])
def login():
    email = request.get_json()["email"]
    password = request.get_json()["password"]

    cur = cnx.cursor()
    cur.execute(
        "SELECT password_hash, id FROM users WHERE email = (%s)",
        (email,)
    )
    data_fr_db = cur.fetchone()
    cur.close()

    if data_fr_db and check_password_hash(data_fr_db[0], password):
        session["user_id"] = data_fr_db[1]
        session.permanent = True
        return jsonify({
            "redirect": "logged in successfully, redirecting to content...",
            "location": url_for("views.content")
        })
    else:
        return "incorrect credentials", 403

@views.route("/logout", methods=["POST"])
def user_logout():
    session.clear()
    return redirect(url_for("views.index"))

@views.route("/existing_email", methods=["GET"])
def check_existing_email():
    new_email = request.args.get("new_email")

    cur = cnx.cursor()
    cur.execute(
        "SELECT email FROM users WHERE email = %s",
        (new_email,)
    )
    result = bool(cur.fetchone())
    cur.close()
    return jsonify({"email_exists": result})

@views.route("/user_creation", methods=["PUT"])
def user_creation():
    user_name = request.get_json()["user_name"].strip()
    if len(user_name) < 1:
        return "Invalid user name", 403

    user_email = request.get_json()["user_email"].strip()
    p = re.compile(r"^[\w\.]+@\w+\.\w+$")
    if not p.match(user_email):
        return "Invalid user email", 403

    cur = cnx.cursor()
    cur.execute(
        "SELECT email FROM users WHERE email = %s",
        (user_email,)
    )
    if cur.fetchone():
        cur.close()
        return "User email already registered", 403

    password = request.get_json()["password"].strip()
    if len(password) < 6 or len(password) > 30 or " " in password:
        cur.close()
        return "Invalid password", 403

    password_hash = generate_password_hash(password) # in format "method$salt$hash"
    print(f"creating new user: {user_name}, {user_email}, {password_hash}")
    cur.execute(
        """INSERT INTO users(email, user_name, password_hash)
        VALUES (%s, %s, %s)""",
        (user_email, user_name, password_hash,)
    )
    cnx.commit()

    cur.execute(
        "SELECT password_hash, id, user_name FROM users WHERE email = %s",
        (user_email,)
    )
    result = cur.fetchone()
    cur.close()

    if result and check_password_hash(result[0], password):
        session["user_id"] = result[1]
        session.permanent = True
        return jsonify({
            "redirect": f"new account created for {user_email}, redirecting to content...",
            "location": url_for("views.content")
        })
    return "wrong password", 403

@views.route("/user_chg_pw", methods=["PUT"])
def user_chg_pw():
    return

@views.route("/user_deletion", methods=["DELETE"])
def user_deletion():
    return

@views.route("/content", methods=["GET"])
def content():
    if not validate_user(): return redirect(url_for("views.index"))
    return render_template("content.html")

@views.route("/get_name", methods=["GET"])
def get_name():
    if not validate_user(): return redirect(url_for("views.index"))
    cur = cnx.cursor()
    cur.execute(
        "SELECT user_name FROM users WHERE id = %s",
        (session["user_id"],)
    )
    user_name = cur.fetchone()[0]
    cur.close()
    return jsonify({"user_name": user_name})

@views.route("/get_product", methods=["GET"])
def get_product():
    if not validate_user(): return redirect(url_for("views.index"))
    id_found = check_existing_source(request.args.get("url"))
    if id_found:
        print("provided url alrdy in record") #debug
        return jsonify({
            "item": get_db_product(id_found),
            "price": get_db_latest_price(id_found),
        })
    result = scrap_product_data(request.args.get("url"))
    return jsonify({
        "item": result[0],
        "price": result[1],
    })

@views.route("/add_item", methods=["PUT"])
def add_item():
    if not validate_user(): return redirect(url_for("views.index"))
    r = request.get_json()
    id_found_by_url = check_existing_source(r.url)
    if id_found_by_url:
        return jsonify({ "added_item": False })
        # if product id found bleongs to another user
    cur = cnx.cursor()
    cur.execute(
        """INSERT INTO sources (url)
        VALUES (%s)""",
        (r.url,)
    )
    source_id = cur.lastrowid
    cur.execute(
        """INSERT INTO products (user_id, item_name, user_alias, brand, type)
        VALUES (%s, %s, DEFAULT, DEFAULT, DEFAULT);
        INSERT INTO product_source_links (product_id, source_id)
        VALUES (LAST_INSERT_ID(), %s)""",
        (session["user_id"], r.item, source_id,)
    )
    # if want to link new source to existing product
    cur.execute(
        """INSERT INTO price_history (source_id, date, price)
        VALUES (%s, %s, %s)""",
        (source_id, datetime.now().strftime("%Y-%m-%d"), r.price,)
    )
    cnx.commit()
    cur.close()
    print("new row added") #debug
    return jsonify({ "added_item": True })

@views.route("/add_source", methods=["PUT"])
def add_source_url():
    return
