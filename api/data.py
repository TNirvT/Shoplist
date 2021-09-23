from . import cnx

def check_existing_source(url):
    cur = cnx.cursor()
    cur.execute(
        """SELECT p.id, p.user_id, p.item_name 
        FROM products p
        JOIN product_source_links l ON p.id = l.product_id
        JOIN sources s ON l.source_id = s.id
        WHERE s.url = %s""",
        (url,)
    )
    result = cur.fetchone() and cur.fetchone()[0]
    if result: print(*result, sep="\n") #debug
    rows = cur.fetchall() #debug
    if rows: print(*rows, sep="\n") #debug
    cur.close()
    return int(result or 0)

def get_db_product(product_id):
    cur = cnx.cursor()
    cur.execute("SELECT item_name, user_id FROM products WHERE id = %s", (product_id,))
    result = cur.fetchone()[0]
    cur.close()
    return result

def get_db_latest_price(source_id):
    cur = cnx.cursor()
    cur.execute(
        """SELECT price, date FROM price_history WHERE source_id = %s
        ORDER BY date DESC LIMIT 1""",
        (source_id,)
    )
    result = cur.fetchone()
    cur.close()
    return result
