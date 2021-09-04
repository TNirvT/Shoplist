from flask import Blueprint, render_template, request, redirect, url_for

views = Blueprint("views", __name__)

@views.route("/", methods=["GET"])
def index():
    return "index"