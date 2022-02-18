from datetime import timedelta

from flask import Flask, render_template
import mysql.connector as connector
from mysql.connector import errorcode
from mysql.connector import MySQLConnection

from .config import secret_phrase, db_credential, db_name
from .models import TABLES
from .shoplist import SHOPS

cnx = connector.connect(**db_credential)
cnx.autocommit = False  # default: False

def cursor(cnx: MySQLConnection):
    try:
        cnx.ping(reconnect=True, attempts=3, delay=1)
    except connector.Error:
        cnx.reconnect(attempts=3, delay=1)
    return cnx.cursor()

def create_app():
    app = Flask(__name__)
    app.config.from_mapping({
        "SECRET_KEY": secret_phrase,
        "PERMANENT_SESSION_LIFETIME": timedelta(days=30),
    })
    cur = cursor(cnx)
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} DEFAULT CHARACTER SET 'utf8'")
    cur.execute(f"USE {db_name}")
    for table_name in TABLES:
        table = TABLES[table_name]
        try:
            cur.execute(table)
        except connector.Error as err:
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                # print(f"Database Alert: {table_name} already exists")
                pass
            else:
                print(err.msg)
    for shop in SHOPS:
        cur.execute("SELECT id, shop FROM shops WHERE shop = %s", (shop,))
        shop_id = cur.fetchone()
        if not shop_id:
            cur.execute("INSERT INTO shops (shop) VALUES (%s)", (shop,))
            cnx.commit()
    cur.close()
    from .views import views
    app.register_blueprint(views, url_prefix="/")

    return app
