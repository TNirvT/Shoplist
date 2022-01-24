import React, { useState } from "react";
import axios from "axios";

import plusCircle from "../plus-circle.svg";

export default function ShopAddItem({setShowAdd}) {
  const [message, setMessage] = useState("");
  const [newItem, setNewItem] = useState({
    url: "",
    item: "",
    alias: "",
    price: "",
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
      if (err) setMessage(err.message);
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
    <section className="bg-warning text-dark p-2">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div className="my-2">
            <img src={plusCircle} alt="Add item icon" width="60" className="px-2"/>
            Paste the URL of an item to start tracking
          </div>
          <div className="my-2">
            <button className="btn btn-primary" onClick={setShowAdd}>⟲ Back</button>
          </div>
        </div>
        <div>
          <label htmlFor="product_url" className="form-label">
            URL
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="https://url.xyz"
            id="product_url"
            onBlur={e => setNewItem({...newItem, url: e.target.value})}
          />
          <button className="btn btn-info my-2" onClick={getProductData}>
            ⇄ Refresh Data
          </button>
        </div>
        <div>
          <label htmlFor="product_name" className="form-label">
            Alias (Optional)
          </label>
          <input
            type="text"
            className="form-control"
            style={{maxWidth: 300}}
            id="user_alias"
            placeholder="Awesome gadget"
            onBlur={e => setNewItem({...newItem, alias: e.target.value})}
            />
        </div>
        <div>
          <span>Item: {newItem.item}</span><br/>
          <span>Price: {newItem.price}</span><br/>
          <button className="btn btn-danger" onClick={addItemToDB}>
            Add Item to DB
          </button><br/>
          <span>{message}</span>
        </div>
      </div>
    </section>
  )
}