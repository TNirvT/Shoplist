import re

from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from . import today
from . import data
from .shoplist import normalize_url, fetch_product_data

views = Blueprint("views", __name__)

def validate_user():
    if session.get("user_id"):
        return session["user_id"]
    else:
        return False

@views.route("/login-req", methods=["POST"])
def login():
    email = request.get_json()["email"]
    password = request.get_json()["password"]

    hash_from_db, user_id = data.login(email)

    if hash_from_db and check_password_hash(hash_from_db, password):
        session["user_id"] = user_id
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
    return redirect(url_for("views.catch_all"))

@views.route("/existing_email", methods=["GET"])
def check_existing_email():
    new_email = request.args.get("new_email")

    result = data.check_existing_email(new_email)
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

    email_is_registered = data.check_existing_email()
    if email_is_registered:
        return "User email already registered", 403

    password = request.get_json()["password"].strip()
    if len(password) < 6 or len(password) > 30 or " " in password:
        return "Invalid password", 403

    password_hash = generate_password_hash(password) # in format "method$salt$hash"
    hash_from_db, id_from_db = data.user_creation(user_email, user_name, password_hash)

    if hash_from_db and check_password_hash(hash_from_db, password):
        session["user_id"] = id_from_db
        session.permanent = True
        return jsonify({
            "redirect": f"new account created for {user_email}, redirecting to content...",
            "location": url_for("views.content")
        })
    return "wrong password", 403

@views.route("/user_deletion", methods=["DELETE"])
def user_deletion():
    # add code
    return

@views.route("/content", defaults={"path":""}, methods=["GET"])
@views.route("/content/<path:path>")
def content(path):
    if not validate_user(): return redirect(url_for("views.catch_all"))
    
    return render_template("content.html")

@views.route("/get_name", methods=["GET"])
def get_name():
    if not validate_user(): return redirect(url_for("views.catch_all"))

    user_name = data.get_user_name(session["user_id"])
    return jsonify({"user_name": user_name})

@views.route("/get_product_data", methods=["GET"])
def get_product_data():
    if not validate_user(): return redirect(url_for("views.catch_all"))

    url = request.args.get("url")
    url = normalize_url(url)
    exist_data = data.check_existing_source(url)
    if exist_data:
        result_db = data.get_latest_price(exist_data[3])
        item_name, shop = data.get_product(exist_data[3])
        return jsonify({
            "url_norm": url,
            "item": item_name,
            "price": result_db[0],
            "date": result_db[1],
            "shop": shop,
        })

    product_data = fetch_product_data(url)
    if product_data is None:
        return jsonify({
            "error": "Invalid URL",
        })
    else:
        return jsonify({
            "url_norm": product_data.url,
            "item": product_data.name,
            "price": product_data.price,
            "date": today(),
            "shop": product_data.shop,
        })

@views.route("/add_item", methods=["PUT"])
def add_item():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    r = request.get_json()
    if r["item"] == "Can't reach the url":
        return jsonify({
            "error": f"Error when reaching the url({r['url']})",
        })
    product_linked_to_url = data.check_existing_source(r["url"])
    if product_linked_to_url:
        pid, uid, item, sid = product_linked_to_url
        if uid == current_user:
            return jsonify({
                "error": f"{item} already in record ({pid})",
            })
        else:
            data.add_product_w_existing_source(current_user, r["item"], r["alias"], sid)
            return jsonify({ "added_item": True })
    data.add_product(r["url"], data.get_shopid(r["shop"]), current_user, r["item"], r["alias"], r["timestamp"], r["price"])
    return jsonify({ "added_item": True })

@views.route("/remove_item", methods=["DELETE"])
def remove_item():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    product_id = request.args.get("productID")
    print(f"pid= {product_id}") #debug
    try:
        data.remove_product_from_user(product_id, current_user)
    except Exception as err:
        return jsonify({"error": str(err)})
    return jsonify()

@views.route("/user_price_history_update", methods=["PUT"])
def user_price_history_update():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    sources = data.get_user_items(current_user)
    for source in sources:
        print(f"source id: {source[0]}") #debug
        product_data = fetch_product_data(source[1])
        name, price = product_data.name, product_data.price
        today_stamp = today()
        if name is None:
            print(f"update skipped, source_id: {source[0]}")
            continue
        elif data.get_latest_price(source[0])[1] == today_stamp:
            data.update_today_price(price, source[0], today_stamp)
        else:
            data.add_today_price(price, source[0], today_stamp)
    return jsonify({ "update_sucess": True })

@views.route("/list_user_items", methods=["GET"])
def list_user_items():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    results = data.get_user_items_detailed(current_user)
    return jsonify(results)

@views.route("/get_this_history", methods=["GET"])
def get_this_history():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    product_id = request.args.get("productID")
    result = data.get_this_history(product_id)
    return jsonify(result)

@views.route("/get_user_items_history", methods=["GET"])
def get_user_items_history():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    result = data.get_user_items_history(current_user)
    return jsonify(result)

@views.route("/settings", methods=["PUT"])
def user_settings():
    current_user = validate_user()
    if not current_user: return redirect(url_for("views.catch_all"))

    r = request.get_json() # e.g. r = {"userName": "my name", "password": "321abc"}
    user_name = r.get("userName")
    password = r.get("password")
    if password:
        password_hash = generate_password_hash(password) # in format "method$salt$hash"
    else:
        password_hash = None
    data.update_user_data(user_name, password_hash, current_user)
    return jsonify()

@views.route("/", defaults={"path":""})
@views.route("/<path:path>")
def catch_all(path):
    if validate_user(): return redirect(url_for("views.content"))
    return render_template("home.html")
