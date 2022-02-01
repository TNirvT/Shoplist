import React, { useState } from "react";
import axios from "axios";

export default function UserLogin({setSignup}) {
  const [credentials, setCredentials] = useState({});
  const [message, setMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  function emailExistsCheck(e) {
    const reEmail = /^[\w\.]+@\w+\.\w+$/;
    if ( !reEmail.test(e.target.value.trim()) ) {
      setCredentials({ ...credentials, email: null });
      setEmailMessage(`Invalid Email`);
      return
    };

    axios.get("/existing_email", {
      params: {
        new_email: e.target.value.trim(),
      },
    }).then(res => {
      if (res.data.email_exists) {
        setEmailExists(true);
        setEmailMessage("");
        setCredentials({ ...credentials, email: e.target.value.trim() });
      } else {
        setEmailMessage(`Email is not registered. Sign Up?`);
      };
    }).catch(err => {
      if (err) {
        setEmailMessage(err.message);
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
    <div className="d-flex flex-column border border-4 rounded-3 m-3">
      <div className="tab-div mx-auto text-center align-self-center" style={{width:"80vw"}}>
        <button className="tab-btn btn btn-light border border-2 mx-2">
          Log In
        </button>
        <button className="tab-btn btn btn-secondary text-dark mx-2" onClick={() => setSignup(true)}>
          Sign Up
        </button>
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
      <div className="row mx-auto w-50 m-1 text-danger fst-italic">
        {emailMessage && <span>{emailMessage}</span>}
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          id="password"
          onBlur={ e => setCredentials({ ...credentials, password: e.target.value.trim() }) }
        />
      </div>
      <div className="row mx-auto w-50 m-1 text-danger fst-italic">
        {message && <span>{message}</span>}
      </div>
      <div className="row mx-auto m-1 text-center align-self-center">
        <button className="btn btn-primary my-2" onClick={userLogin}>
          Log in
        </button>
      </div>
    </div>
  )
}