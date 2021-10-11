from datetime import datetime
from . import cnx
from .config import db_name
from .shoplist import scrap_product_data
from .data import get_db_latest_price, get_db_shop

def update_one():
    return

def update_all():
    cur = cnx.cursor()
    cur.execute(f"USE {db_name}")
    cur.execute("SELECT id, url, shop_id FROM sources")
    sources = cur.fetchall() # sources arr=[(int, str, int), (int, str, int), ...]
    print(*sources, sep="\n") #debug
    for source in sources:
        shop = get_db_shop(source[2])
        (item, price, date_today) = scrap_product_data(source[1], shop)
        latest_price = get_db_latest_price(source[0])
        if latest_price[1] == date_today:
            cur.execute(
                """UPDATE price_history
                SET price = %s
                WHERE source_id = %s  AND date = %s""",
                (price, source[0], date_today,)
            )
        else:
            cur.execute(
                """INSERT INTO price_history (source_id, date, price)
                VALUES (%s, %s, %s, %s)""",
                (source[0], date_today, price,)
            )
    cur.close()
