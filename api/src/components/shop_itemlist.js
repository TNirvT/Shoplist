import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShopItemList() {
  const [message, setMessage] = useState("");
  const [listItems, setListItems] = useState([]);

  function priceUpdate() {
    axios.put("/user_price_history_update",
    ).then(res => {
      console.log("updated!");
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };
  
  function listUserItems() {
    axios.get("/list_user_items",
    ).then(res => {
      let userItems = res.data;
      let arr = userItems.map((userItem) =>
        <li key={userItem.source_id.toString()}>
          {userItem.item_name.substring(0,35)}
          {userItem.item_name.length > 35 && "..."}
          {" : $"}
          {userItem.price}
        </li>
      );
      setListItems(arr);
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  useEffect(() => {
    listUserItems();
    console.log("useEffect: list");
  }, []);

  return (
    <React.Fragment>
    <h1>Item List</h1>
    <ul>
      {listItems}
    </ul>
    <button onClick={priceUpdate}>Price update(user's items)</button><br/>
    <button onClick={listUserItems}>List</button><br/>
    </React.Fragment>
  )
}