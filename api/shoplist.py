import re
import requests
from urllib.parse import urlparse, urlunparse
from collections import namedtuple
from time import sleep

from bs4 import BeautifulSoup

from .config import bestbuy_api_key

SHOPS = {
    "www.amazon.com": "Amazon US",
    "www.amazon.co.jp": "Amazon Japan",
    "www.amazon.co.us": "Amazon UK",
    "www.bhphotovideo.com": "B and H",
    "www.bestbuy.com": "Best Buy",
}

ShopUrl = namedtuple("ShopUrl", "path params query")

def _ensure_scheme(url) -> str:
    url = url.strip()
    if re.search(r"//(?=[^/\s]+/[^/\s]+)", url):
        parse_result = urlparse(url, allow_fragments=False)
    else:
        parse_result = urlparse("//" + url)
    parse_result = parse_result._replace(scheme="https")
    return urlunparse(parse_result)

def get_shop_from_url(url: str) -> str | None:
    parse_result = urlparse(url)
    return SHOPS.get(parse_result.netloc, None)

class ShopItem:
    def __init__(self, url: str) -> None:
        self.url = url
        self.shop = None
        self.status_code = None
        self.name = None
        self.price = None

    def get_data() -> bool:
        print("Child class need to implement its own get data method")
        return False

    def _normalize_url(self, shop_url: ShopUrl) -> str:
        parse_url = urlparse(self.url)
        match_path = re.match(shop_url.path, parse_url.path)
        match_params = re.match(shop_url.params, parse_url.params)
        match_query = re.match(shop_url.query, parse_url.query)
        if match_path and match_params and match_query:
            parse_url = parse_url._replace(
                path=match_path.group(0),
                params=match_params.group(0),
                query=match_query.group(0)
            )
        return urlunparse(parse_url)

    def _fetch(self) -> BeautifulSoup:
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
        r = requests.get(self.url, headers=headers)
        self.status_code = r.status_code
        if r.status_code > 399:
            print(f"ShopItem fetch error: {r.status_code} reaching {self.url}")
        return BeautifulSoup(r.content, "lxml")

    def _parse_dollar(self, price) -> float:
        if isinstance(price, float):
            return price
        # remove the thousands separator
        price_rm_sep = re.sub(r"[,\.](?=\d{3})", "", price)
        # change decimal separator to "."
        price_decimal = re.sub(r",(?=\d{2}\D)", ".", price_rm_sep)
        return float(re.search(r"[\d\.]+", price_decimal).group(0))

class AmazonUSItem(ShopItem):
    def __init__(self, url) -> None:
        super().__init__(url)

        shop_url = ShopUrl(r"(/[^/\s]+)?/dp/[^/\s]+", "", "")
        parse_url = urlparse(self._normalize_url(shop_url))
        shorten = re.split(r"/[^/\s]+(?=/dp/[^/\s]+)", parse_url.path, 1)
        if len(shorten) > 1:
            parse_url = parse_url._replace(path=shorten[1])

        self.url = urlunparse(parse_url)
        self.shop = "Amazon US"

    def get_data(self) -> bool:
        soup = self._fetch()
        name_tag = soup.find("h1", attrs={"id": "title"})
        price_tag = soup.find("div", attrs={"data-feature-name": "corePrice_desktop"})
        try:
            self.name = name_tag.text.strip()
            price_raw = price_tag.find("span", attrs={"class": "a-price a-text-price a-size-medium apexPriceToPay"})
            self.price = self._parse_dollar(price_raw.text.strip())
        except Exception as err:
            print("Amazon US get data error:", err)
            return False
        return True

class BestbuyItem(ShopItem):
    def __init__(self, url) -> None:
        super().__init__(url)

        def __get_sku(url) -> str:
            sku = re.search(r"(?<=skuId\=)\d+", url)
            if sku:
                return sku.group(0)
            else:
                print("BestBuyItem get sku error")
                return None

        shop_url = ShopUrl(r"/site/[^/\s]+/\d+\.p", "", r"skuId=\d+")

        self.url = self._normalize_url(shop_url)
        self.shop = "Best Buy"
        self.sku = __get_sku(url)

    def __get_data_by_api(self) -> bool:
        bestbuy_query = f"https://api.bestbuy.com/v1/products(sku={self.sku})?apiKey={bestbuy_api_key}&sort=name.asc&show=name,salePrice&format=json"
        try:
            r = requests.get(bestbuy_query)
            res = r.json()  # dictionary
            # res = {...,
            #   "products": [
            #       {"name": "iPhone", "salePrice": 9.99}
            #   ]
            # }
            self.name = res["products"][0]["name"]
            self.price = self._parse_dollar(res["products"][0]["salePrice"])
        except Exception as err:
            print("BestBuy get data error:", err)
            return False
        sleep(1.5)
        return True

    def __get_data_by_tag(self) -> bool:
        soup = self._fetch()
        name_tag = soup.find("div", attrs={"class":"sku-title"})
        price_tag = soup.find("div", attrs={"class":"priceView-hero-price priceView-customer-price"})
        try:
            name = name_tag.find("h1")
            self.name = name.text.strip()
            price_raw = price_tag.find("span", attrs={"aria-hidden":"true"})
            self.price = self._parse_dollar(price_raw.text.strip())
        except Exception as err:
            print("BestBuy get data error:", err)
            return False
        return True

    def get_data(self) -> bool:
        if bestbuy_api_key:
            return self.__get_data_by_api()
        else:
            return self.__get_data_by_tag()

ProductInfo = namedtuple("ProductInfo", "url name price shop")
shop_class = {
    "Amazon US": AmazonUSItem,
    # "Amazon Japan": AmazonJPItem,
    # "Amazon UK": AmazonUKItem,
    # "B and H": BnHItem,
    "Best Buy": BestbuyItem,
}

def normalize_url(url: str) -> str:
    shop = get_shop_from_url(url)
    item = shop_class[shop](url)
    return item.url

def fetch_product_data(url: str) -> tuple | None:
    url = _ensure_scheme(url)
    shop = get_shop_from_url(url)
    try:
        item = shop_class[shop](url)
        item.get_data()
        return ProductInfo(item.url, item.name, item.price, item.shop)
    except Exception as err:
        print("Error:", err)
        return None
