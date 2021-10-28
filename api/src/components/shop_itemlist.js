import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

export default function ShopItemList() {
  const [message, setMessage] = useState("");
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(false);

  function priceUpdate() {
    setLoading(true);
    axios.put("/user_price_history_update",
    ).then(res => {
      setLoading(false);
      console.log("updated!");
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };
  
  function listUserItems() {
    setLoading(true);
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
      setLoading(false);
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  function datesThisMonth() {
    let datesArr = [];
    const today = new Date();
    let iterDate = new Date();
    iterDate.setDate(iterDate.getDate()-29);
    while (iterDate <= today) {
      const indexDate = `${iterDate.getFullYear()}-${iterDate.getMonth()+1}-${iterDate.getDate()}`;
      datesArr.push(indexDate);
      iterDate.setDate(iterDate.getDate()+1);
    }
    console.log(datesArr);
    return datesArr
  }

  useEffect(() => {
    listUserItems();
    console.log("useEffect: list");
  }, []);

  return (
    <React.Fragment>
    <h2>Item List</h2>
    <ul>
      {listItems}
    </ul>
    {loading &&
      <div className="loader"></div>
    }
    <button onClick={priceUpdate}>Price update(user's items)</button><br/>
    <button onClick={listUserItems}>List</button><br/>
    </React.Fragment>
  )
}