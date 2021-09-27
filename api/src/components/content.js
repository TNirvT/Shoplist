import React, { useState, useEffect } from "react";
import axios from "axios";

import ToggleButton from "./toggle_button";
import ShopAddItem from "./shop_additem";
import ShopItemList from "./shop_itemlist";

export default function Content() {
  const [screenName, setScreenName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  let toggleText = showAdd? "Close" : "Add";

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

  useEffect(() => {
    getName();
    console.log("useEffect count");
  }, [])

  return (
    <div>
      <ToggleButton text={toggleText} onToggle={()=>setShowAdd(!showAdd)} /><br/>
      {showAdd && <ShopAddItem userName={screenName} />}
      <ShopItemList />
    </div>
  )
}
