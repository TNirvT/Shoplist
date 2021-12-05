import React, { useState } from "react";
import axios from "axios";

export default function UserSettings() {
  const [userChanges, setUserChanges] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [message, setMessage] = useState("");

  function changeSettings() {
    if (userChanges) {
      axios.put("/settings", userChanges).then(res => {
        setMessage("Changes applied!");
      }).catch(err => {
        if (err) {
          setMessage(err.message);
        };
      });
    }
  };

  function passwordCheck(e) {
    let rePw = /[ ]/;
    const newPw = e.target.value;
    if (rePw.test(newPw)) {
      setPasswordMessage("Password must not contain white-space");
      return false
    } else if (newPw.length < 6) {
      setPasswordMessage("Password must be at least 6 characters");
      return false
    } else {
      setPasswordMessage("✔");
      return true
    };
  };

  return (
    <div>
    <h2>Settings</h2>
    <label htmlFor="userName">User Name</label><br/>
    <input
      type="text"
      placeholder="User Name"
      id="userName"
      name="userName"
      onBlur={(e) => {
        if (e.target.value.length > 0) {
          setUserChanges({...userChanges, userName: e.target.value.trim()})
        } else {
          setUserChanges((savedChanges) => {
            const changes = {...savedChanges};
            delete changes.userName;
            return changes
          })
        }
      }}
    /><br/>
    <label htmlFor="password">Password</label><br/>
    <input
      type="password"
      placeholder="Password"
      id="password"
      name="password"
      onBlur={(e) => {
        if (passwordCheck(e)) {
          setUserChanges({...userChanges, password: e.target.value.trim()})
        } else {
          setUserChanges((savedChanges) => {
            const changes = {...savedChanges};
            delete changes.password;
            return changes
          })
        }
      }}
    /><br/>
    {passwordMessage && <div><span>{passwordMessage}</span></div>}
    <button onClick={changeSettings}>Apply Changes</button>
    {message && <div><span>{message}</span></div>}
    </div>
  )
}
