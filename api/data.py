from . import cnx

def check_existing_source(url):
    cur = cnx.cursor()
    cur.execute(
        """SELECT p.id, p.user_id, p.item_name, s.id
        FROM products p
        JOIN product_source_links l ON p.id = l.product_id
        JOIN sources s ON l.source_id = s.id
        WHERE s.url = %s""",
        (url,)
    )
    result = cur.fetchone()
    cur.close()
    return result

def get_db_product(product_id):
    cur = cnx.cursor()
    cur.execute("SELECT item_name, user_id FROM products WHERE id = %s", (product_id,))
    result = cur.fetchone()[0]
    cur.close()
    return result

def get_db_latest_price(source_id):
    cur = cnx.cursor()
    cur.execute(
        """SELECT price, date, shop_id FROM price_history WHERE source_id = %s
        ORDER BY date DESC LIMIT 1""",
        (source_id,)
    )
    result = cur.fetchone()
    cur.close()
    return result

def get_db_shop(shop_id: int):
    cur = cnx.cursor()
    cur.execute("SELECT shop FROM SHOPS WHERE id = %s", (shop_id))
    shop = cur.fetchone()[0]
    cur.close()
    return shop

def get_db_shopid(shop: str):
    cur = cnx.cursor()
    cur.execute("SELECT id FROM SHOPS WHERE shop = %s", (shop))
    shop_id = cur.fetchone()[0]
    cur.close()
    return shop_id

def get_db_user_items(user_id):
    cur = cnx.cursor()
    cur.execute("SELECT FROM WHERE", (user_id,))
    cur.close()
    return

def add_product(url, user_id, item_name, alias, date_now, price):
    cur = cnx.cursor()
    cur.execute(
        """INSERT INTO sources (url)
        VALUES (%s)""",
        (url,)
    )
    source_id = cur.lastrowid
    cur.execute(
        """INSERT INTO products (user_id, item_name, user_alias, brand, type)
        VALUES (%s, %s, %s, DEFAULT, DEFAULT)""",
        (user_id, item_name, alias,)
    )
    cur.execute(
        """INSERT INTO product_source_links (product_id, source_id)
        VALUES (LAST_INSERT_ID(), %s)""",
        (source_id,)
    )
    cur.execute(
        """INSERT INTO price_history (source_id, date, price)
        VALUES (%s, %s, %s)""",
        (source_id, date_now, price,)
    )
    cnx.commit()
    cur.close()

def add_product_w_existing_source(user_id, item_name, alias, source_id):
    cur = cnx.cursor()
    cur.execute(
        """INSERT INTO products (user_id, item_name, user_alias, brand, type)
        VALUES (%s, %s, %s, DEFAULT, DEFAULT)""",
        (user_id, item_name, alias,)
    )
    cur.execute(
        """INSERT INTO product_source_links (product_id, source_id)
        VALUES (LAST_INSERT_ID(), %s)""",
        (source_id,)
    )
    cur.close()

def add_price_data(source_id, date_today, price):
    cur = cnx.cursor()
    cur.execute()
    cur.close()
