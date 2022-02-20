import re
import requests
from urllib.parse import urlparse, urlunparse
from datetime import datetime, timezone

from bs4 import BeautifulSoup

from .config import bestbuy_api_key

# [shop domain: str, path, params, query: regex str, simple tags: boolean]
SHOPS = {
    "Amazon US": ["www.amazon.com", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", False],
    "Amazon Japan": ["www.amazon.co.jp", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", False],
    "Amazon UK": ["www.amazon.co.uk", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", False],
    # "B and H": ["www.bhphotovideo.com", r"/c/product/[^/\s]+/[^/\s]+\.html$", "", "", True],
    "Best Buy": ["www.bestbuy.com", r"/site/[^/\s]+/\d+\.p", "", r"skuId=\d+", False],
}

def url_parser(url: str):
    url = url.strip()
    # normalize to https://www...
    if re.search(r"//(?=[^/\s]+/[^/\s]+)", url):
        o = urlparse(url, allow_fragments=False)
    else:
        o = urlparse("//" + url)
    o = o._replace(scheme="https")
    if not re.match(r"^www\.", o.netloc):
        o = o._replace(netloc="www." + o.netloc)

    for shop in SHOPS:
        match_path = re.match(SHOPS[shop][1], o.path)
        match_params = re.match(SHOPS[shop][2], o.params)
        match_query = re.match(SHOPS[shop][3], o.query)
        if o.netloc == SHOPS[shop][0] and match_path and match_params and match_query:
            match_obj = o._replace(path=match_path.group(0), params=match_params.group(0), query=match_query.group(0))
            shorten = re.split(r"/[^/\s]+(?=/dp/[^/\s]+)", match_obj.path, 1)
            if "Amazon" in shop and len(shorten) > 1:
                match_obj = match_obj._replace(path=shorten[1])
            result = urlunparse(match_obj)
            return result, shop
    return None, None

def _simple_tags(soup: BeautifulSoup, shop: str):
    # tags = {"price": [tag, attrs], "item": [tag, attrs]}
    TAGS = {
        "B and H": {
            "item": ["h1", {"data-selenium":"productTitle"}],
            "price": ["div", {"data-selenium":"pricingPrice"}],
        },
    }

    item = soup.find(TAGS[shop]["item"][0], attrs=TAGS[shop]["item"][1])
    if item:
        item = item.text.strip()
    else:
        return None, None
    price_raw = soup.find(TAGS[shop]["price"][0], attrs=TAGS[shop]["price"][1])
    if price_raw: price_raw = price_raw.text.strip()
    return item, price_raw

def _amazon_tags(soup: BeautifulSoup):
    item = soup.find("h1", attrs={"id": "title"})
    if item:
        item = item.text.strip()
    else:
        return None, None
    print(f"item: {item}") #debug
    price_div = soup.find("div", attrs={"data-feature-name": "corePrice_desktop"})
    print("price_div exists") #debug
    if price_div:
        price_raw = price_div.find("span", attrs={"class": "a-price a-text-price a-size-medium apexPriceToPay"})
        if price_raw:
            price_raw = price_raw.text.strip()
            print(f"price_raw: {price_raw}") #debug
    else:
        price_raw = None
    return item, price_raw

def _bestbuy_tags(soup: BeautifulSoup):
    item_div = soup.find("div", attrs={"class":"sku-title"})
    item = item_div.find("h1")
    if item:
        item = item.text.strip()
    else:
        return None, None
    price_div = soup.find("div", attrs={"class":"priceView-hero-price priceView-customer-price"})
    price_raw = price_div.find("span", attrs={"aria-hidden":"true"})
    if price_raw: price_raw = price_raw.text.strip()
    return item, price_raw

class Bestbuy_item:
    def __init__(self, url: str) -> None:
        self.url = url
        self.sku = get_sku(url)

        def get_sku(url):
            sku = re.sub(r".+bestbuy.com/site/[^/\s]+/", "", url)
            sku = re.match(r"\d+", sku)
            return sku.group(0)

    def get_price(self):
        bestbuy_query = f"https://api.bestbuy.com/v1/products(sku={self.sku})?apiKey={bestbuy_api_key}&sort=salePrice.asc&show=salePrice&format=json"
        r = requests.get(bestbuy_query)
        res = r.json()
        # res = {
        #   ......,
        #   "products": [
        #       {
        #          "salePrice": 9.99
        #       }
        #   ]
        # }
        return res["products"][0]["salePrice"]


def scrap_product_data(url: str, shop: str):  
    headers = {
        "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding":"gzip, deflate, br",
        "accept-language":"en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        "sec-fetch-dest":"document",
        "sec-fetch-mode":"navigate",
        "sec-fetch-site":"cross-site",
        "sec-fetch-user":"?1",
        "sec-gpc":"1",
        "Upgrade-Insecure-Requests":"1",
        "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.87 Safari/537.36",
    }

    r = requests.get(url, headers=headers)
    
    # in case, error when reaching the url
    if r.status_code > 399:
        return "Can't reach the url", None, None

    soup = BeautifulSoup(r.content, "lxml")

    if SHOPS[shop][4]:
        item, price_raw = _simple_tags(soup, shop)
    elif "Amazon" in shop:
        item, price_raw = _amazon_tags(soup)
    elif shop == "Best Buy":
        item, price_raw = _bestbuy_tags(soup)

    offset = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # in case, out of stock
    if not price_raw:
        return item, None, offset.timestamp()

    # remove the thousands separator
    price_rmv_sep = re.sub(r"[,\.](?=\d{3})", "", price_raw)
    # change decimal separator to "."
    price_decimal = re.sub(r",(?=\d{2}\D)", ".", price_rmv_sep)
    price = float(re.search(r"[\d\.]+", price_decimal).group(0))
    # return item, price, datetime.now().strftime("%Y-%m-%d")
    return item, price, offset.timestamp()
