from flask import Blueprint, render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

views = Blueprint("views", __name__)

@views.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@views.route("/", methods=["PUT"])
def create_user():
    pass