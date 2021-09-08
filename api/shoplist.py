from bs4 import BeautifulSoup
import requests

def get_data():  
    headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36", "Accept-Encoding":"gzip, deflate, br", "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}
    r = requests.get("https://www.amazon.com/New-Microsoft-Surface-Pro-Touch-Screen/dp/B07YNJGMH6/", headers=headers)
    soup = BeautifulSoup(r.content, "lxml")

    price_raw = soup.find("span", attrs={"id":"priceblock_ourprice"}).text
    print(f"{price_raw}, {len(price_raw)}")
    product_name = soup.find("span", attrs={"id":"productTitle"}).text
    print(f"{product_name.strip()}, {len(product_name.strip())}")

get_data()
