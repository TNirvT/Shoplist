import React, { useState } from "react";
import axios from "axios";

export default function ShopItemList() {
  const [message, setMessage] = useState("");
  const listItems = 0;

  function price_update() {
    axios.put("/user_price_history_update",
    ).then(res => {
      console.log("updated!");
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  return (
    <React.Fragment>
    <h1>Item List</h1>
    <ul>{listItems}</ul>
    <button onClick={price_update}>Price update(user's items)</button>
    </React.Fragment>
  )
}