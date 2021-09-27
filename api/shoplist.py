import re
import requests
from urllib.parse import urlparse, urlunparse
from datetime import datetime

from bs4 import BeautifulSoup

# [shop domain: str, params, query: regex str, simple tags: boolean]
SHOPS = {
    "Amazon US": ["www.amazon.com", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", True],
    "Amazon Japan": ["www.amazon.co.jp", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", True],
    "Amazon UK": ["www.amazon.co.uk", r"(/[^/\s]+)?/dp/[^/\s]+", "", "", True],
    # "B and H": ["www.bhphotovideo.com", r"/c/product/[^/\s]+/[^/\s]+\.html$", "", "", True],
    "Best Buy": ["www.bestbuy.com", r"/site/[^/\s]+/\d+\.p", "", r"skuId=\d+", False],
}

# https://www.amazon.com/dp/B07YNHYQ5Z/
# https://www.amazon.com/New-Microsoft-Surface-Pro-Touch-Screen/dp/B07YNHYQ5Z
# https://www.bestbuy.com/site/microsoft-surface-pro-7-12-3-touch-screen-intel-core-i5-8gb-memory-256gb-ssd-device-only-latest-model-matte-black/6375619.p?skuId=6375619

# https://www.amazon.com/2021-Apple-12-9-inch-Wi%E2%80%91Fi-128GB/dp/B0932D45W8/
# https://www.bhphotovideo.com/c/product/1636228-REG/apple_mhnf3ll_a_12_9_ipad_pro_wifi.html
# https://www.bestbuy.com/site/apple-12-9-inch-ipad-pro-latest-model-with-wi-fi-128gb-space-gray/4263701.p?skuId=4263701

def url_parser(url: str):
    url = url.strip()
    # normalize to https://www...
    if re.search(r"//(?=[^/\s]+/[^/\s]+)", url):
        o = urlparse(url, allow_fragments=False)
        print(11,o) #debug
    else:
        o = urlparse("//" + url)
        print(12,o) #debug
    o = o._replace(scheme="https")
    print(13,o) #debug
    if not re.match(r"^www\.", o.netloc):
        o = o._replace(netloc="www." + o.netloc)
        print(14,o) #debug

    for shop in SHOPS:
        match_path = re.match(SHOPS[shop][1], o.path)
        match_params = re.match(SHOPS[shop][2], o.params)
        match_query = re.match(SHOPS[shop][3], o.query)
        if o.netloc == SHOPS[shop][0] and match_path and match_params and match_query:
            print(15) #debug
            match_obj = o._replace(path=match_path.group(0))
            shorten = re.split(r"/[^/\s]+(?=/dp/[^/\s]+)", match_obj.path, 1)
            if "Amazon" in shop and len(shorten) > 1:
                match_obj = match_obj._replace(path=shorten[1])
            result = urlunparse(match_obj)
            print(f"01:{result}, {shop}") #debug
            return (result, shop)
    print(16) #debug
    return (None, None)

def _simple_tags(soup: BeautifulSoup, shop: str):
    # tags = {"price": [tag, attrs], "item": [tag, attrs]}
    TAGS = {
        "Amazon": {
            "item": ["span", {"id":"productTitle"}],
            "price": ["span", {"id":"priceblock_ourprice"}],
        },
        "B and H": {
            "item": ["h1", {"data-selenium":"productTitle"}],
            "price": ["div", {"data-selenium":"pricingPrice"}],
        },
    }

    item = soup.find(TAGS[shop]["item"][0], attrs=TAGS[shop]["item"][1]).text.strip()
    price_raw = soup.find(TAGS[shop]["price"][0], attrs=TAGS[shop]["price"][1]).text
    return (item, price_raw)

def _bestbuy_tags(soup: BeautifulSoup):
    item_div = soup.find("div", attrs={"class":"sku-title"})
    item = item_div.find("h1").text.strip()
    price_div = soup.find("div", attrs={"class":"priceView-hero-price priceView-customer-price"})
    price_raw = price_div.find("span", attrs={"aria-hidden":"true"}).text.strip()
    print(price_div) #debug
    print(price_raw) #debug
    return (item, price_raw)

def scrap_product_data(url: str, shop: str):  
    headers = {
        "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding":"gzip, deflate, br",
        "accept-language":"en-GB,en;q=0.9",
        "sec-fetch-dest":"document",
        "sec-fetch-mode":"navigate",
        "sec-fetch-site":"none",
        "sec-fetch-user":"?1",
        "sec-gpc":"1",
        "Upgrade-Insecure-Requests":"1",
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
    }
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.content, "lxml")

    if SHOPS[shop][4]:
        if "Amazon" in shop:
            print("1:amazon") #debug
            (item, price_raw) = _simple_tags(soup, "Amazon")
        else:
            print("2:not amazon") #debug
            (item, price_raw) = _simple_tags(soup, shop)
    elif shop == "Best Buy":
        print("3:best buy") #debug
        (item, price_raw) = _bestbuy_tags(soup)
    price_rm_sep = re.sub(r"[,\.](?=\d{3})", "", price_raw)
    price_decimal = re.sub(r",(?=\d{2}\D)", ".", price_rm_sep)
    price = float(re.search(r"[\d\.]+", price_decimal).group(0))
    return (item, price, datetime.now().strftime("%Y-%m-%d"))
