import React, { useState } from "react";
import axios from "axios";

export default function UserLogin() {
  const [credentials, set_credentials] = useState({});
  const [message, set_message] = useState("");
  
  function user_login() {
    axios.post("/login", {
      email: credentials.email,
      password: credentials.password
    }).then(res => {
    }).catch(err => {
      if (err != undefined) {
        set_message(err.message);
      };
    });
  };

  axios.interceptors.response.use(res => {
    return res
  }, redir => {
    if (redir.response && redir.response.data && redir.response.data.location) {
      window.location = redir.response.data.location
    } else {
      return Promise.reject(redir)
    }
  })

  return (
    <React.Fragment>
    <h1>Log in to ShopList</h1>
    <input
      type="text"
      placeholder="Email"
      onBlur={ e => set_credentials({ ...credentials, ["email"]: e.target.value.trim() }) }
      /><br/>
    <input
      type="password"
      placeholder="Password"
      onBlur={ e => set_credentials({ ...credentials, ["password"]: e.target.value.trim() }) }
    /><br/>
    <button onClick={user_login}>
      Log in
    </button><br/>
    {message && <span>{message}</span>}
    </React.Fragment>
  )
}