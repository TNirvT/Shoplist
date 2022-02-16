import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import ShopAddItem from "./shop_additem";
import ShopItemList from "./shop_itemlist";
import UserSettings from "./user_settings";
import Footer from "./footer";

export default function Content() {
  const [screenName, setScreenName] = useState("");
  const [showList, setShowList] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <Router>
      <nav className="navbar navbar-expand-md bg-secondary navbar-dark">
        <div className="container">
          <a href="#" className="navbar-brand text-warning">Shoplist</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => {
                  userLogout();
                  return false;
                }}>
                  Logout
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link" onClick={() => {
                  setShowAdd(false);
                  setShowList(showSettings);
                  setShowSettings(!showSettings);
                  return false;
                }}>
                  Settings
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <svg width={32} height={32}>
                    <circle cx={16} cy={16} r={16} fill="white"/>
                    <text x="50%" y="50%" fill="black" dominant-baseline="middle" text-anchor="middle">{screenName.substring(0, 2)}</text>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {
        showList &&
        <ShopItemList
          setShowAdd={() => {
            setShowAdd(true);
            setShowList(false);
          }}
        />
      }
      {
        showAdd &&
        <ShopAddItem
          setShowAdd={() => {
            setShowAdd(false);
            setShowList(true);
          }}
        />
      }
      {
        showSettings &&
        <UserSettings
          setShowContent={() => {
            setShowList(true);
            setShowSettings(false);
          }}
          screenName={screenName}
        />
      }
      <Footer />
    </Router>
  )
}
