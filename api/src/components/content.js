import React, { useState, useEffect } from "react";
import axios from "axios";

import ToggleButton from "./toggle_button";
import ShopAddItem from "./shop_additem";
import ShopItemList from "./shop_itemlist";
import UserSettings from "./user_settings";

export default function Content() {
  const [screenName, setScreenName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  let toggleText = showAdd ? "Close" : "Add";

  function userLogout() {
    axios.post("/logout").then(res => {
      window.location = "/";
    }).catch(err => {
      if (err) {
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
      if (err) {
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
      <nav className="navbar navbar-expand-md bg-secondary navbar-dark">
        <div className="container">
          <a href="#" className="navbar-brand">ShopList</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => {
                  userLogout();
                  return false;
                }}>Logout</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => {
                  setShowAdd(false);
                  setShowSettings(!showSettings);
                  return false;
                }}>Settings</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <h1>ShopList - Track online shop items</h1>
      <h2>Welcome back, {screenName}!</h2>
      {showSettings || <ToggleButton text={toggleText} onToggle={() => setShowAdd(!showAdd)} />}
      {showSettings || <br/>}
      {showAdd && <ShopAddItem />}
      {showSettings || <ShopItemList />}
      {showSettings && <UserSettings />}
    </div>
  )
}
