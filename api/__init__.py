from datetime import timedelta

from flask import Flask
import mysql.connector as connector
from mysql.connector import errorcode

from .config import secret_phrase, db_credential, db_name
from .models import TABLES

cnx = connector.connect(**db_credential)
cnx.autocommit = False

def create_app():
    app = Flask(__name__)
    app.config.from_mapping({
        "SECRET_KEY": secret_phrase,
        "PERMANENT_SESSION_LIFETIME": timedelta(days=30),
    })
    cur = cnx.cursor()
    cur.execute(
        """CREATE DATABASE IF NOT EXISTS %s DEFAULT CHARACTER SET 'utf8';
        USE %s""",
        (db_name, db_name,)
    )
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
    cur.close()
    from .views import views
    app.register_blueprint(views, url_prefix="/")

    return app
