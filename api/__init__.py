from flask import Flask
import mysql.connector as connector
from mysql.connector import errorcode

from .config import secret_phrase, db_credential, db_name
from .models import TABLES

cnx = connector.connect(**db_credential)
cur = cnx.cursor()

def create_app():
    app = Flask(__name__)
    app.config.from_mapping({
        "SECRET_KEY": secret_phrase,
    })
    cur.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} DEFAULT CHARACTER SET 'utf8'")
    cur.execute(f"USE {db_name}")
    for table_name in TABLES:
        table = TABLES[table_name]
        try:
            cur.execute(table)
        except connector.Error as err:
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                print(f"Database Alert: {table_name} already exists")
            else:
                print(err.msg)
    from .views import views
    app.register_blueprint(views, url_prefix="/")

    return app
