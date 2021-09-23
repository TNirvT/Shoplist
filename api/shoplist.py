import re
import requests
from datetime import datetime

from bs4 import BeautifulSoup

# [simple tags: boolean, regex: raw string]
SHOPS = {
    "Amazon US": [r"amazon\.com(/[^/\s]+)?/dp/[^/\s]+", True],
    "Amazon Japan": [r"amazon\.co\.jp(/[^/\s]+)?/dp/[^/\s]+", True],
    "Amazon UK": [r"amazon\.co\.uk(/[^/\s]+)?/dp/[^/\s]+", True],
    "B&H": [r"bhphotovideo\.com/c/product/[^/\s]+/[^/\s]+\.html$", True],
    "Best Buy": [r"bestbuy\.com/site/[^/\s]+/\d+\.p\?skuId=\d+", False],
}

# https://www.amazon.com/dp/B07YNHYQ5Z/
# https://www.amazon.com/New-Microsoft-Surface-Pro-Touch-Screen/dp/B07YNHYQ5Z
# https://www.bestbuy.com/site/microsoft-surface-pro-7-12-3-touch-screen-intel-core-i5-8gb-memory-256gb-ssd-device-only-latest-model-matte-black/6375619.p?skuId=6375619

# https://www.amazon.com/2021-Apple-12-9-inch-Wi%E2%80%91Fi-128GB/dp/B0932D45W8/
# https://www.bhphotovideo.com/c/product/1636228-REG/apple_mhnf3ll_a_12_9_ipad_pro_wifi.html
# https://www.bestbuy.com/site/apple-12-9-inch-ipad-pro-latest-model-with-wi-fi-128gb-space-gray/4263701.p?skuId=4263701

def url_parser(url: str):
    url = url.strip()
    for shop in SHOPS:
        url_re = r"(^https://|^http://)?(www\.)?" + SHOPS[shop][0]
        match = re.match(url_re, url)
        if match:
            if "Amazon" in shop:
                shorten = re.split(r"/[^/\s]+(?=/dp/[^/\s]+)", match.group(0), 1)
                result = shorten[0] + shorten[1]
                print("1:"+result) #debug
            else:
                result = match.group(0)
                print("2:"+result) #debug
            # normalize to https://...
            if re.match(r"^https://www\.", result):
                print("3:"+result) #debug
                return (result, shop)
            else:
                norm_result = r"https://www." + re.split(r"^http://www\.|^www\.", result, 1)[-1]
                print("4:"+result) #debug
                return (norm_result, shop)
    print(1) #debug
    return None

def _simple_tags(soup: BeautifulSoup, shop: str):
    # tags = {"price": [tag, attrs], "item": [tag, attrs]}
    TAGS = {
        "Amazon": {
            "item": ["span", {"id":"productTitle"}],
            "price": ["span", {"id":"priceblock_ourprice"}],
        },
        "B&H": {
            "item": ["h1", {"data-selenium":"productTitle"}],
            "price": ["div", {"data-selenium":"pricingPrice"}],
        },
    }

    item = soup.find(TAGS[shop]["item"][0], attrs=TAGS[shop]["price"][1]).text.strip()
    price_raw = soup.find(TAGS[shop]["price"][0], attrs=TAGS[shop]["price"][1]).text
    return (item, price_raw)

def _bestbuy_tags(soup: BeautifulSoup):
    item_div = soup.find("div", attrs={"class":"sku-title"})
    item = item_div.find("h1").text.strip()
    price_div = soup.find("div", attrs={"class":"pricing-price pricing-lib-price-8-2136-6 priceView-price "})
    price_raw = price_div.find("span", attrs={"aria-hidden":"true"}).text.strip()
    return (item, price_raw)

def scrap_product_data(url: str, shop: str):  
    headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36", "Accept-Encoding":"gzip, deflate, br", "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.content, "lxml")

    if SHOPS[shop][1]:
        if "Amazon" in shop:
            shop = "Amazon"
        (item, price_raw) = _simple_tags(soup, shop)
    else:
        if shop == "Best Buy":
            (item, price_raw) = _bestbuy_tags(soup)
    price_rm_sep = re.sub(r"[,\.](?=\d{3})", "", price_raw)
    price_decimal = re.sub(r",(?=\d{2}\D)", ".", price_rm_sep)
    price = float(re.search(r"[\d\.]+", price_decimal).group(0))
    print(f"{item}, {len(item)}")
    print(f"{price}, {len(price)}")
    return (item, price, datetime.now().strftime("%Y-%m-%d"))
