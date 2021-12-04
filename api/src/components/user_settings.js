import React from "react";
import axios from "axios";

export default function UserSettings() {

  function changeSettings() {
    axios.get("/settings").then(res => {
      console.log("settings")
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };

  return (
    <div>
    <h2>Settings</h2>
    <label htmlFor="userName">User Name</label><br/>
    <input
      type="text"
      placeholder="userName"
      id="userName"
      name="userName"
    /><br/>
    <label htmlFor="password">Password</label><br/>
    <input
      type="password"
      placeholder="Password"
      id="password"
      name="password"
    /><br/>
    <button onClick={changeSettings}>Apply New Settings</button>
    </div>
  )
}
