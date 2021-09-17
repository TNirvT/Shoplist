from bs4 import BeautifulSoup
import requests

def scrap_product_data(url):  
    headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36", "Accept-Encoding":"gzip, deflate, br", "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}
    r = requests.get("https://www.amazon.com/New-Microsoft-Surface-Pro-Touch-Screen/dp/B07YNJGMH6/", headers=headers)
    soup = BeautifulSoup(r.content, "lxml")

    price_raw = soup.find("span", attrs={"id":"priceblock_ourprice"}).text
    print(f"{price_raw}, {len(price_raw)}")
    item = soup.find("span", attrs={"id":"productTitle"}).text
    print(f"{item.strip()}, {len(item.strip())}")
    return [item, price_raw]
