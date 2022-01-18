import React, { useState } from "react";
import axios from "axios";

export default function UserLogin() {
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
    <React.Fragment>
      <input
        type="text"
        placeholder="Email"
        name="email"
        onBlur={emailExistsCheck}
        /><br/>
      <input
        type="password"
        placeholder="Password"
        name="password"
        onBlur={ e => setCredentials({ ...credentials, password: e.target.value.trim() }) }
      /><br/>
      <button
        className="btn btn-primary my-3"
        onClick={userLogin}
      >
        Log in
      </button><br/>
      {message && <span>{message}</span>}
    </React.Fragment>
  )
}