import React, { useState } from "react";
import axios from "axios";

import ToggleButton from "./toggle_button";

export default function ShopAddItem({userName}) {
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState("");
  const [newItem, setNewItem] = useState({
    url:"",
    item:"",
    price:"",
    data:"",
    brand:"",
    type:""
  });
  let toggleText = showAdd? "Close" : "Add";

  function userLogout() {
    axios.post("/logout",
    ).then(res => {
      window.location = "/";
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  function get_product_data() {
    axios.get("/get_product_data", {
      params: {
        url: newItem.url,
      },
    }).then(res => {
      setNewItem({...newItem, item: res.data.item, price: res.data.price, date: res.data.date});
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  function addItemToDB() {
    axios.put("/add_item", newItem
    ).then(res => {
      console.log(`Item added`);
    }).catch(err => {
      if (err != undefined) {
        console.log(err.message);
      };
    });
  };

  return (
    <React.Fragment>
    <h1>ShopList - Track online shopping items</h1>
    <h2>Welcome back, {userName}!</h2>
    <button onClick={userLogout}>Logout</button><br/>
    <ToggleButton text={toggleText} onToggle={()=>setShowAdd(!showAdd)} /><br/>
    <input
      type="text"
      id="product_url"
      placeholder="URL"
      onBlur={ e => setNewItem({...newItem, url: e.target.value}) } />
    <label htmlFor="product_url">URL</label><br/>
    <button onClick={get_product_data}>
      Get Product Data
    </button><br/>
    <input
      type="text"
      id="product_name"
      placeholder="Item name"
      onBlur={ e => setNewItem({...newItem, item: e.target.value}) } />
    <label htmlFor="product_name">Item</label><br/>
    <input
      type="text"
      id="product_brand"
      placeholder="Brand"
      onBlur={ e => setNewItem({...newItem, brand: e.target.value}) } />
    <label htmlFor="product_brand">Brand</label><br/>
    <input
      type="text"
      id="product_type"
      placeholder="Type/Make a list to select"
      onBlur={ e => setNewItem({...newItem, type: e.target.value}) } />
    <label htmlFor="product_type">Type</label><br/>
    <button onClick={addItemToDB}>
      Add Item to DB
    </button>
    <span>{message}</span>
    </React.Fragment>
  )
}