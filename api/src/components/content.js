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
    axios.get("/get_name").then(res => {
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
    <React.Fragment>
      <nav className="navbar navbar-expand-md bg-secondary navbar-dark">
        <div className="container">
          <a href="#" className="navbar-brand">Shop<span className="text-warning">List</span></a>
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
      <section className="bg-warning text-dark p-1">
        <div className="container">
          <div>
            {showSettings || <ToggleButton text={toggleText} onToggle={() => setShowAdd(!showAdd)} classN="btn btn-primary" />}
          </div>
          <div className="p-2">
            {showAdd && <ShopAddItem />}
          </div>
        </div>
      </section>
      <section className="bg-light text-dark">
        <div className="container">
          <div>
            {showSettings || <ShopItemList />}
            {showSettings && <UserSettings />}
          </div>
        </div>
      </section>
      <footer className="bg-dark text-white p-5 position-relative">
        <div className="container">
          <p>2021 <a href="https://github.com/TNirvT">TNirvT</a></p>
        </div>
      </footer>
    </React.Fragment>
  )
}
