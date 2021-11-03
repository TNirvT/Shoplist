import React, { useState } from "react";
import axios from "axios";

export default function ShopAddItem() {
  const [message, setMessage] = useState("");
  const [newItem, setNewItem] = useState({
    url: "",
    item: "",
    alias: "",
    price: 0,
    timestamp: 0,
    dateFormated: "",
    shop: "",
  });

  function getProductData() {
    axios.get("/get_product_data", {
      params: {
        url: newItem.url,
      },
    }).then(res => {
      if (res.data.error) {
        setMessage(res.data.error);
        return
      };
      document.getElementById("product_url").value = res.data.url_norm;
      const dateLocal = new Date(res.data.date * 1000);
      const monthLocal = dateLocal.getMonth() + 1;
      const dayLocal = dateLocal.getDay();
      setNewItem({...newItem,
        url: res.data.url_norm,
        item: res.data.item,
        price: res.data.price,
        timestamp: res.data.date,
        dateFormated: `${dateLocal.getFullYear()}-${("0" + monthLocal).substr(-2)}-${("0" + dayLocal).substr(-2)}`,
        shop: res.data.shop,
      });
      setMessage(`Data received for ${res.data.item}: Latest Price ${res.data.price}`);
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };

  function addItemToDB() {
    if (!newItem.url) {
      setMessage("Error. URL is empty");
      return
    } else if (newItem.item === "Can't reach the url") {
      setMessage("Error. Can't reach the url");
      return
    };

    axios.put("/add_item", newItem).then(res => {
      if (res.data.error) {
        setMessage(res.data.error);
        return
      } else if (res.data.added_item) {
        console.log(`Item added`);
        setMessage("The item is added to database");
      };
    }).catch(err => {
      if (err) {
        console.log(err.message);
      };
    });
  };

  return (
    <React.Fragment>
    <input
      type="text"
      id="product_url"
      placeholder="URL"
      onBlur={ e => setNewItem({...newItem, url: e.target.value}) } />
    <label htmlFor="product_url">URL</label><br/>
    <button onClick={getProductData}>
      Get Product Data
    </button><br/>
    <span>Item: {newItem.item}</span><br/>
    <span>Price: {newItem.price}</span><br/>
    <input
      type="text"
      id="user_alias"
      placeholder="Item name Alias"
      onBlur={ e => setNewItem({...newItem, alias: e.target.value}) } />
    <label htmlFor="product_name">Alias</label><br/>
    <button onClick={addItemToDB}>
      Add Item to DB
    </button><br/>
    <span>{message}</span>
    </React.Fragment>
  )
}