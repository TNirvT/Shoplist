import re
from datetime import datetime, timezone
# import decimal

from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from . import cnx
from .data import *
from .shoplist import url_parser, scrap_product_data

views = Blueprint("views", __name__)

def validate_user():
    if session.get("user_id"): return session["user_id"]
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
    # add code
    return

@views.route("/user_deletion", methods=["DELETE"])
def user_deletion():
    # add code
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

@views.route("/get_product_data", methods=["GET"])
def get_product():
    if not validate_user(): return redirect(url_for("views.index"))

    url_norm, shop = url_parser(request.args.get("url"))
    if not url_norm:
        return jsonify({
            "error": "Invalid URL",
        })
    source_id = check_existing_source(url_norm)
    if source_id:
        result_db = get_db_latest_price(source_id)
        return jsonify({
            "url_norm": url_norm,
            "item": get_db_product(source_id),
            "price": result_db[0],
            "date": result_db[1],
            "shop": shop,
        })
    result = scrap_product_data(url_norm, shop)
    return jsonify({
        "url_norm": url_norm,
        "item": result[0],
        "price": result[1],
        "date": result[2],
        "shop": shop,
    })

@views.route("/add_item", methods=["PUT"])
def add_item():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))
    r = request.get_json()
    if r["item"] == "Can't reach the url":
        return jsonify({
            "error": f"Error when reaching the url({r['url']})",
        })
    product_linked_to_url = check_existing_source(r["url"])
    if product_linked_to_url:
        pid, uid, item, sid = product_linked_to_url
        if uid == current_user:
            return jsonify({
                "error": f"{item} already in record ({pid})",
            })
        else:
            add_product_w_existing_source(current_user, r["item"], r["alias"], sid)
            return jsonify({ "added_item": True })
    add_product(r["url"], get_db_shopid(r["shop"]), current_user, r["item"], r["alias"], r["timestamp"], r["price"])
    return jsonify({ "added_item": True })

@views.route("/remove_item", methods=["DELETE"])
def remove_item():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))

    product_id = request.args.get("productID")
    print(f"pid= {product_id}") #debug
    try:
        remove_product_from_user(product_id, current_user)
    except Exception as err:
        return jsonify({"error": str(err)})
    return jsonify()

@views.route("/user_price_history_update", methods=["PUT"])
def user_price_history_update():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))

    sources = get_db_user_items(current_user)
    for source in sources:
        print(f"source id: {source[0]}") #debug
        shop = get_db_shop(source[2])
        item, price, stamp_today = scrap_product_data(source[1], shop)
        if item == "Can't reach the url":
            print(f"update skipped, source_id: {source[0]}")
            continue
        elif get_db_latest_price(source[0])[1] == stamp_today:
            update_today_price(price, source[0], stamp_today)
        else:
            add_today_price(price, source[0], stamp_today)
    return jsonify({ "update_sucess": True })

@views.route("/list_user_items", methods=["GET"])
def list_user_items():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))

    results = get_db_user_items_detailed(current_user)
    return jsonify(results)

@views.route("/get_user_items_history", methods=["GET"])
def get_user_items_history():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))

    result = get_db_user_items_history(current_user)
    return jsonify(result)

@views.route("/settings", methods=["PUT"])
def user_settings():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.index"))

    r = request.get_json() # e.g. r = {"userName": "my name", "password": "321abc"}
    user_name = r.get("userName")
    password = r.get("password")
    if password:
        password_hash = generate_password_hash(password) # in format "method$salt$hash"
    else:
        password_hash = None
    update_user_data(user_name, password_hash, current_user)
    return jsonify()
