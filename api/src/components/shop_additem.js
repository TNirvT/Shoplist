import React, { useState } from "react";
import axios from "axios";

import plusCircle from "../plus-circle.svg";

export default function ShopAddItem({setShowAdd}) {
  const [message, setMessage] = useState("");
  const [disableSave, setDisableSave] = useState(true);
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
      setDisableSave(false);
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
    <section className="bg-light text-dark p-2">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div className="my-2">
            <img src={plusCircle} alt="Add item icon" width="60" className="px-2"/>
          </div>
          <div className="my-2">
            <button className="btn btn-primary" onClick={setShowAdd}>◃&nbsp;&nbsp;Back</button>
          </div>
        </div>
        <div className="my-2">
          <label htmlFor="product_url" className="form-label">
            ➀ Paste the URL of an item
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g.: https://bestbuy.com/..."
            id="product_url"
            onBlur={e => setNewItem({...newItem, url: e.target.value})}
          />
        </div>
        <div className="d-flex align-items-start flex-column my-2">
          <p>➁ Press Fetch and check if it's the correct item</p>
          <button className="btn btn-info" onClick={getProductData}>
            ⇄ Fetch Data
          </button>
        </div>
        <div>
          <span>Item: {newItem.item}</span><br/>
          <span>Price: {newItem.price}</span><br/>
        </div>
        <div className="d-flex align-items-start flex-column my-2">
          <p>➂ Confirm and Save</p>
          <button className="btn btn-danger" onClick={addItemToDB} disabled={disableSave}>
            Save
          </button><br/>
          <span>{message}</span>
        </div>
      </div>
    </section>
  )
}