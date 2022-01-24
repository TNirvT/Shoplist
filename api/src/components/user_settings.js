import React, { useState } from "react";
import axios from "axios";

export default function UserSettings({setShowContent, screenName}) {
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
    <section className="bg-secondary text-light p-2">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div className="my-2">
            <h3>Settings</h3>
          </div>
          <div className="my-2">
            <button className="btn btn-primary" onClick={setShowContent}>⟲ Back</button>
          </div>
        </div>
        <div className="my-1">
          <label htmlFor="userName" className="form-label">
            New User Name
          </label>
          <input
            type="text"
            className="form-control"
            style={{maxWidth: 300}}
            placeholder={screenName}
            id="userName"
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
          />
        </div>
        <div className="my-1">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            style={{maxWidth: 300}}
            placeholder="something*secret"
            id="password"
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
          />
          {passwordMessage && <span className="text-warning fst-italic">{passwordMessage}</span>}
        </div>
        <button className="btn btn-danger my-2" onClick={changeSettings}>
          Apply Changes
        </button>
      </div>
    <div>
    {message && <div><span>{message}</span></div>}
    </div>
    </section>
  )
}
