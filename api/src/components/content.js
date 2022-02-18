import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

import ShopAddItem from "./shop_additem";
import ShopItemList from "./shop_itemlist";
import UserSettings from "./user_settings";
import Footer from "./footer";

export default function Content() {
  const [screenName, setScreenName] = useState("");

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
                <Link to="/content/settings" className="nav-link">
                  Settings
                </Link>
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
      <Routes>
        <Route path="/content" element={<ShopItemList />} />
        <Route path="/content/add" element={<ShopAddItem />} />
        <Route path="/content/settings" element={<UserSettings screenName={screenName} />} />
      </Routes>
      <Footer />
    </Router>
  )
}
