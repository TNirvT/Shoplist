from datetime import timedelta, datetime, timezone

from flask import Flask
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

def today(): # return the timestamp at today(UTC) 0:00:00.000
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return today.timestamp()

def create_app():
    print("running create_app ...")
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
    for shop in SHOPS.values():
    # for shop in SHOPS.values():
        cur.execute("SELECT id, shop FROM shops WHERE shop = %s", (shop,))
        shop_id = cur.fetchone()
        if not shop_id:
            cur.execute("INSERT INTO shops (shop) VALUES (%s)", (shop,))
            cnx.commit()
    cur.close()
    from .views import views
    app.register_blueprint(views, url_prefix="/")

    print("... successful")
    return app
