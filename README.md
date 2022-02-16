# Shoplist
A web application allows users to create their accounts, and manage their own lists to track prices of online shopping items.

Add items by simply copy and paste the url from an online shopping site, try to grab data from the site, then confirm to add the item to database.

Amazon (US), Best Buy are supported.

## Pip install modules

Python (>=3.9) required  

    pip install -r requirements.txt

beautifulsoup4 (>=4.9.3)  
lxml (>=4.6.5)  
Flask (>=2.0.1)  
gunicorn (>=20.1.0)  
mysql-connector-python (>=8.0.26)  

## Recommended node version

    nvm install 16.10
    nvm use 16.10

## Npm install modules  

    npm install

axios (>=0.26.0)  
react (>=17.0.2)  
react-chartjs-2 (>=3.3.0)  

## Compile (before launching server the first time)  

    npm run build

## Known Issues  
- Only per month price can be retrieved for some items on BestBuy  

## Future features  
- Add search function in user item list  
- Use BestBuy API  

## Blog post about this project
[Shoplist Blog post][blog post link]


[blog post link]: https://tnirvt.github.io/shoplist
