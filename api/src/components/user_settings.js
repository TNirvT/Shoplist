import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function UserSettings({screenName}) {
  const [userChanges, setUserChanges] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [message, setMessage] = useState("");
  const [deleteUserWarn, setDeleteUserWarn] = useState(false);

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

  function onDeleteUser() {
    console.log("delete user");
  }

  return (
    <section className="bg-light text-dark p-2">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div className="my-2">
            <h3>Settings</h3>
          </div>
          <div className="my-2">
            <Link to="/content"><button className="btn btn-primary">◃&nbsp;&nbsp;Back</button></Link>
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
            defaultValue={screenName}
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
        <button className="btn btn-secondary my-2" onClick={changeSettings}>
          Apply Changes
        </button><br/>
        <button className="btn btn-danger my-2" onClick={() => setDeleteUserWarn(true)}>
          Delete User
        </button>
        {/* { deleteUserWarn &&
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" width={24} height={24} fill="currentColor" viewBox="0 0 16 16" role="img" aria-label="Danger:">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div className="mx-1">
              This action is cannot be undone. Confirm to delete?
            </div>
            <button className="btn btn-danger btn-sm mx-1" onClick={() => onDeleteUser()}>
              Confirm
            </button>
            <button className="btn btn-secondary btn-sm mx-1" onClick={() => setDeleteUserWarn(false)}>
              Back
            </button>
          </div>
        } */}
      </div>
    <div>
    {message && <div><span>{message}</span></div>}
    </div>
    </section>
  )
}
