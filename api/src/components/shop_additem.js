import React, { useState } from "react";
import axios from "axios";

import ToggleButton from "./toggle_button";

export default function ShopAddItem() {
  const [show_add, set_show_add] = useState(false);
  let toggle_text = show_add? "Close" : "Add";

  return (
    <React.Fragment>
    <h1>ShopList - Track online shopping items</h1>
    <h2>Welcome back, *user!</h2>
    <ToggleButton text={toggle_text} on_toggle={()=>set_show_add(!show_add)} />
    <input
      type="text"
      id="product_url"
      placeholder="URL" />
    <label for="product_url">URL</label><br/>
    <button>Fetch Data</button><br/>
    <input
      type="text"
      id="product_name"
      placeholder="Item name" />
    <label for="product_name">Item</label><br/>
    <input
      type="text"
      id="product_brand"
      placeholder="Brand" />
    <label for="product_brand">Brand</label><br/>
    <input
      type="text"
      id="product_type"
      placeholder="Type/Make a list to select" />
    <label for="product_type">Type</label><br/>
    </React.Fragment>
  )
}