# the database store dates(YYYY-MM-DD) in UTC timezone
from datetime import datetime, timezone, date
from decimal import Decimal
from collections import namedtuple
from . import cnx, cursor, db_name

Price_Date = namedtuple("PriceOfDate", "price date")

def login(email):
    cur = cursor(cnx)
    cur.execute(
        "SELECT password_hash, id FROM users WHERE email = (%s)",
        (email,)
    )
    hash_from_db, user_id = cur.fetchone()
    cur.close()
    return hash_from_db, user_id

def check_existing_email(email) -> bool:
    cur = cursor(cnx)
    cur.execute(
        "SELECT email FROM users WHERE email = %s",
        (email,)
    )
    result = bool(cur.fetchone())
    cur.close()
    return result

def user_creation(user_email, user_name, password_hash) -> tuple[str, str]:
    cur = cursor(cnx)
    cur.execute(
        """INSERT INTO users(email, user_name, password_hash)
        VALUES (%s, %s, %s)""",
        (user_email, user_name, password_hash,)
    )
    cnx.commit()

    cur.execute(
        "SELECT password_hash, id, user_name FROM users WHERE email = %s",
        (user_email,)
    )
    hash_from_db, id_from_db, name_from_db = cur.fetchone()
    cur.close()
    return hash_from_db, id_from_db

def get_user_name(user_id) -> str:
    cur = cursor(cnx)
    cur.execute(
        "SELECT user_name FROM users WHERE id = %s",
        (user_id,)
    )
    user_name = cur.fetchone()[0]
    cur.close()
    return user_name

def check_existing_source(url):
    cur = cursor(cnx)
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

def get_product(product_id):
    cur = cursor(cnx)
    cur.execute("SELECT item_name FROM products WHERE id = %s", (product_id,))
    item_name = cur.fetchone()[0]
    cur.execute(
        """SELECT shop.shop
        FROM products p
        JOIN product_source_links l ON p.id = l.product_id
        JOIN sources s ON l.sources_id = s.id
        JOIN shops ON s.shop_id = shops.id
        WHERE p.id = %s""", (product_id,)
    )
    shop = cur.fetchone()[0]
    cur.close()
    return item_name, shop

def get_latest_price(source_id) -> tuple[float, float]:
    cur = cursor(cnx)
    cur.execute(
        """SELECT price, date FROM price_history WHERE source_id = %s
        ORDER BY date DESC LIMIT 1""",
        (source_id,)
    )

    price_fetch, date_fetch = cur.fetchone()
    # fetchone() gives a tuple : (decimal.Decimal, datetime.date)
    result = Price_Date(price_fetch, date_fetch)
    price = result.price and float(result.price)
    latest_utc = datetime(
        result.date.year,
        result.date.month,
        result.date.day,
        tzinfo=timezone.utc
    ).timestamp()
    cur.close()
    return price, latest_utc

def get_shop(shop_id: int) -> str:
    cur = cursor(cnx)
    cur.execute("SELECT shop FROM shops WHERE id = %s", (shop_id,))
    shop = cur.fetchone()[0]
    cur.close()
    return shop

def get_shopid(shop: str) -> int:
    cur = cursor(cnx)
    cur.execute("SELECT id FROM shops WHERE shop = %s", (shop,))
    shop_id = cur.fetchone()[0]
    cur.close()
    return shop_id

def get_user_items(user_id) -> list[tuple[int, str, int]]:
    cur = cursor(cnx)
    cur.execute(
        """SELECT s.id, s.url, s.shop_id
        FROM sources s
        JOIN product_source_links l ON s.id = l.source_id
        JOIN products p ON l.product_id = p.id
        WHERE p.user_id = %s""",
        (user_id,)
    )
    sources = cur.fetchall() # sources arr=[(source_id, url, shop_id), ...]
    cur.close()
    return sources

def get_user_items_detailed(user_id) -> list[dict]:
    cur = cnx.cursor(dictionary=True)
    cur.execute(
        """SELECT p.id product_id, p.item_name, p.user_alias, l.source_id, s.url, sh.shop, ph.latest_on, ph_.price
        FROM sources s
        JOIN product_source_links l ON s.id = l.source_id
        JOIN products p ON l.product_id = p.id
        JOIN (
            SELECT source_id, MAX(date) latest_on
            FROM price_history
            GROUP BY source_id
        ) ph ON ph.source_id = s.id
        JOIN price_history ph_ ON ph_.source_id = ph.source_id AND ph_.date = ph.latest_on
        JOIN shops sh ON sh.id = s.shop_id
        WHERE p.user_id = %s""",
        (user_id,)
    )
    sources = cur.fetchall()
    # returns a list of dictionaries
    # sources = [
    #     {'product_id':int, 'item_name':str, 'user_alias':str,
    #     'source_id':int, 'url':str, 'shop':str,
    #     'latest_on':datetime.date, 'price':decimal.Decimal},
    # ...]
    for source in sources:
        source["latest_on"] = datetime(
            source["latest_on"].year,
            source["latest_on"].month,
            source["latest_on"].day,
            tzinfo=timezone.utc
        ).timestamp()
        source["price"] = source["price"] and float(source["price"])
    cur.close()
    return sources

def get_this_history(product_id) -> list[dict]:
    cur = cursor(cnx)
    # extract list of source id
    cur.execute(
        """SELECT s.id, p.item_name, p.user_alias
        FROM sources s
        JOIN product_source_links l ON s.id = l.source_id
        JOIN products p ON l.product_id = p.id
        WHERE p.id = %s""",
        (product_id,)
    )
    source = cur.fetchone()
    result = []
    cur.execute(
        """SELECT ph.date, ph.price
        FROM price_history ph
        WHERE ph.source_id = %s""",
        (source[0],)
    )
    history_data = cur.fetchall()
    # history_data = [(datetime.date, decimal.Decimal | None), ...]
    result.append({
        "source_id": source[0],
        "item_name": source[1],
        "user_alias": source[2],
        "stamp_prices": list(map(
            lambda x: [
                datetime(x[0].year, x[0].month, x[0].day, tzinfo=timezone.utc).timestamp(),
                x[1] and float(x[1])
            ],
            history_data
        ))
    })
    cur.close()

    # e.g. result =
    # [{
    #       'source_id': 1,
    #       'item_name': 'name',
    #       'user_alias': 'alias',
    #       'stamp_prices': [ [float(timestamp), float(price)|None], ... ]
    # }]
    # print(*result, sep="\n") # debug
    print(f"history result: {len(result)}") # debug
    return result

def get_user_items_history(user_id) -> list[dict]:
    cur = cursor(cnx)
    # extract list of source ids
    cur.execute(
        """SELECT s.id, p.item_name, p.user_alias
        FROM sources s
        JOIN product_source_links l ON s.id = l.source_id
        JOIN products p ON l.product_id = p.id
        WHERE p.user_id = %s
        GROUP BY s.id""",
        (user_id,)
    )
    sources = cur.fetchall()
    # e.g. sources_arr = [(1, "item1", "alias" | None), ...]
    # print(sources) #debug
    # loop thr the source ids to get a list of dates and another of prices
    result = []
    for source in sources:
        cur.execute(
            """SELECT ph.date, ph.price
            FROM price_history ph
            WHERE ph.source_id = %s""",
            (source[0],)
        )
        history_data = cur.fetchall()
        # history_data = [(datetime.date, decimal.Decimal | None), ...]
        result.append({
            "source_id": source[0],
            "item_name": source[1],
            "user_alias": source[2],
            "stamp_prices": list(map(
                lambda x: [
                    datetime(x[0].year, x[0].month, x[0].day, tzinfo=timezone.utc).timestamp(),
                    x[1] and float(x[1])
                ],
                history_data
            ))
        })
    cur.close()

    # e.g. result =
    # [
    #   {
    #       'source_id': 1,
    #       'item_name': 'name',
    #       'user_alias': 'alias',
    #       'stamp_prices': [ [float(timestamp), float(price)|None], ... ]
    #   },
    #   ...
    # ]
    # print(*result, sep="\n") # debug
    print(f"history result: {len(result)}") # debug
    return result

def add_product(url, shop_id, user_id, item_name, alias, stamp_today, price):
    date_utc = datetime.fromtimestamp(stamp_today, timezone.utc).strftime("%Y-%m-%d")
    cur = cursor(cnx)
    cur.execute(
        """INSERT INTO sources (url, shop_id)
        VALUES (%s, %s)""",
        (url, shop_id,)
    )
    source_id = cur.lastrowid
    cur.execute(
        """INSERT INTO products (user_id, item_name, user_alias)
        VALUES (%s, %s, %s)""",
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
        (source_id, date_utc, price,)
    )
    cnx.commit()
    cur.close()

def add_product_w_existing_source(user_id, item_name, alias, source_id):
    cur = cursor(cnx)
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

def update_today_price(price, source_id, stamp_today):
    date_utc = datetime.fromtimestamp(stamp_today, timezone.utc).strftime("%Y-%m-%d")
    cur = cursor(cnx)
    cur.execute(
        """UPDATE price_history
        SET price = %s
        WHERE source_id = %s  AND date = %s""",
        (price, source_id, date_utc,)
    )
    cnx.commit()
    cur.close()

def add_today_price(price, source_id, stamp_today):
    date_utc = datetime.fromtimestamp(stamp_today, timezone.utc).strftime("%Y-%m-%d")
    cur = cursor(cnx)
    cur.execute(
        """INSERT INTO price_history (source_id, date, price)
        VALUES (%s, %s, %s)""",
        (source_id, date_utc, price,)
    )
    cnx.commit()
    cur.close()

def remove_product_from_user(product_id, user_id):
    cur = cursor(cnx)
    cur.execute(
        """SELECT user_id
        FROM products
        WHERE id = %s""",
        (product_id,)
    )
    belongs_to = cur.fetchone()[0]
    if user_id != belongs_to:
        cur.close()
        raise Exception("product belongs to another user")
    cur.execute(
        """DELETE FROM product_source_links
        WHERE product_id = %s""",
        (product_id,)
    )
    cur.execute(
        """DELETE FROM products
        WHERE id = %s""",
        (product_id,)
    )
    # the corresponding source and price history will remain in database however
    cnx.commit()
    cur.close()

def update_user_data(user_name, password_hash, current_user):
    cur = cursor(cnx)
    if user_name:
        cur.execute(
            """UPDATE users
            SET user_name = %s
            WHERE id = %s""",
            (user_name, current_user,)
        )
    if password_hash:
        cur.execute(
            """UPDATE users
            SET password_hash = %s
            WHERE id = %s""",
            (password_hash, current_user,)
        )
    cnx.commit()
    cur.close()

##### functions for main_updater.py only #####

def get_url_all_sources() -> list[str]:
    cur = cursor(cnx)
    cur.execute(f"USE {db_name}")
    cur.execute(
        """SELECT id, url
        FROM sources"""
    )
    sources = cur.fetchall() # sources=[(id1, url1), (id2, url2), ...]
    cur.close()
    return sources
