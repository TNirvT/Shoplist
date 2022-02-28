from datetime import datetime
import time

from api.shoplist import fetch_product_data
from api import today
from api import data

def update_all():
    sources = data.get_url_all_sources() # sources=[(id1, url1), (id2, url2), ...]
    for source in sources:
        product_data = fetch_product_data(source[1])
        name, price = product_data.name, product_data.price
        today_stamp = today()
        if name is None:
            print(f"update skipped, source_id: {source[0]}")
            continue
        elif data.get_latest_price(source[0])[1] == today_stamp:
            data.update_today_price(price, source[0], today_stamp)
        else:
            data.add_today_price(price, source[0], today_stamp)

while True:
    print(f"Update starts: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
    update_all()
    print(f"Update sleeps: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
    time.sleep(6*60*60)
