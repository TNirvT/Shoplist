from datetime import datetime
# from pathlib import Path
# import json
import time
import mysql.connector as connector

from api.shoplist import scrap_product_data
from api.data import get_db_latest_price, get_db_shop
from api.config import db_credential, db_name

# db_credential_path = Path.cwd() / ".secret" / "db_credential.json"
# with open(db_credential_path) as f:
#     db_credential = json.load(f)
# db_name = "shoplist_db"

cnx_updater = connector.connect(**db_credential)
cnx_updater.autocommit = False

def update_all():
    cur = cnx_updater.cursor()
    cur.execute(f"USE {db_name}")
    cur.execute("SELECT id, url, shop_id FROM sources")
    sources = cur.fetchall() # sources arr=[(int, str, int), (int, str, int), ...]
    print(*sources, sep="\n") #debug
    for source in sources:
        shop = get_db_shop(source[2])
        (item, price, date_today) = scrap_product_data(source[1], shop)
        latest_price_date = datetime.strftime(get_db_latest_price(source[0])[1], "%Y-%m-%d")
        print(source, "||", latest_price_date, "||", date_today) #debug
        if latest_price_date == date_today:
            print("running ==") #debug
            cur.execute(
                """UPDATE price_history
                SET price = %s
                WHERE source_id = %s  AND date = %s""",
                (price, source[0], date_today,)
            )
        else:
            print("running else") #debug
            cur.execute(
                """INSERT INTO price_history (source_id, date, price)
                VALUES (%s, %s, %s)""",
                (source[0], date_today, price,)
            )
        cnx_updater.commit()
        print("committed") #debug
    cur.close()

while True:
    update_all()
    print(f"Update sleeps: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
    time.sleep(6*60*60)
