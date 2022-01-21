import React, { useState } from "react";
import axios from "axios";
import ToggleButton from "./toggle_button";

export default function UserLogin({setSignup}) {
  const [credentials, setCredentials] = useState({});
  const [message, setMessage] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  function emailExistsCheck(e) {
    const reEmail = /^[\w\.]+@\w+\.\w+$/;
    if ( !reEmail.test(e.target.value.trim()) ) {
      setCredentials({ ...credentials, email: null });
      setMessage(`Invalid Email`);
      return
    };
    
    axios.get("/existing_email", {
      params: {
        new_email: e.target.value.trim(),
      },
    }).then(res => {
      if (res.data.email_exists) {
        setEmailExists(true);
        setMessage("");
        setCredentials({ ...credentials, email: e.target.value.trim() });
      } else {
        setMessage(`Email is not registered. Sign Up?`);
      };
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      }
    });
  };

  function userLogin() {
    if (!emailExists) {
      return
    };

    axios.post("/login", {
      email: credentials.email,
      password: credentials.password,
    }).then(res => {
      console.log("Website redirecting (user login)")
      window.location = res.data.location;
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };

  return (
    <div className="d-flex flex-column">
      <div className="text-center text-primary fs-3">
        Login to account
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          type="email"
          className="form-control"
          placeholder="you@example.com"
          id="email"
          onBlur={emailExistsCheck}
        />
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          placeholder="secret***"
          id="password"
          onBlur={ e => setCredentials({ ...credentials, password: e.target.value.trim() }) }
        />
      </div>
      <div className="row mx-auto w-50 m-1 text-danger fst-italic">
        {message && <span>{message}</span>}
      </div>
      <div className="row mx-auto w-50 m-1 text-center">
        <div className="col align-self-center">
          <button className="btn btn-primary my-2" onClick={userLogin}>
            Log in
          </button>
        </div>
        <div className="col">
          <ToggleButton
            text="New user? SignUp"
            onToggle={() => setSignup(true)}
            className={"btn btn-info my-2"}
          />
        </div>
      </div>
    </div>
  )
}