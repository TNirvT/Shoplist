import React, { useState, useEffect } from "react";
import axios from "axios";

import ToggleButton from "./toggle_button";
import ShopAddItem from "./shop_additem";
import ShopItemList from "./shop_itemlist";

export default function Content() {
  const [screenName, setScreenName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  let toggleText = showAdd ? "Close" : "Add";

  function userLogout() {
    axios.post("/logout").then(res => {
      window.location = "/";
    }).catch(err => {
      if (err != undefined) {
        setMessage(err.message);
      };
    });
  };

  function getName() {
    axios.get("/get_name", {
      withCredentials: true
    }).then(res => {
      setScreenName(res.data.user_name);
    }).catch(err => {
      if (err != undefined) {
        console.log(err.message);
      }
    });
  };

  function getUserItems() {
    axios.get(

    ).then(res => {}).catch(err => {
      if (err != undefined) {
        console.log(err.message);
      }
    });
  };

  useEffect(() => {
    getName();
    console.log("useEffect: load content");
  }, []);

  return (
    <div>
      <button onClick={userLogout}>Logout</button><br/>
      <h1>ShopList - Track online shopping items</h1>
      <h2>Welcome back, {screenName}!</h2>
      <ToggleButton text={toggleText} onToggle={() => setShowAdd(!showAdd)} /><br/>
      {showAdd && <ShopAddItem />}
      <ShopItemList />
    </div>
  )
}
