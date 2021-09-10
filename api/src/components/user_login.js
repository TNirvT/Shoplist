import React, { useState } from "react";
import axios from "axios";

export default function UserLogin() {
  const [credentials, set_credentials] = useState({});
  const [message, set_message] = useState("");
  const [email_exists, set_email_exists] = useState(false);

  function email_exists_check(e) {
    const re_email = /^\w+@\w+\.\w+$/;
    if ( !re_email.test(e.target.value.trim()) ) {
      set_credentials({ ...credentials, ["email"]: null });
      set_message(`Invalid Email`);
      return
    };
    
    axios.get("/existing_email", {
      params: {
        new_email: e.target.value.trim(),
      },
    }).then(res => {
      if (res.data.email_exists) {
        set_email_exists(true);
        set_message("");
        set_credentials({ ...credentials, ["email"]: e.target.value.trim() });
      } else {
        set_message(`Email is not registered. Sign Up?`);
      };
    }).catch(err => {
      if (err != undefined) {
        set_message(err.message);
      }
    });
  };

  function user_login() {
    if (!email_exists) {
      return
    };

    document.loginForm.submit();
  };

  function user_login_ajax() {
    if (!email_exists) {
      return
    };

    axios.post("/login", {
      email: credentials.email,
      password: credentials.password
    }).then(res => {
      console.log("Ajax Interceptor bypassed (user_login)")
    }).catch(err => {
      if (err != undefined) {
        console.log(err);
        set_message(err.message);
      };
    });
  
    axios.interceptors.response.use(res => {
      return res
    }, redir => {
      if (redir.response && redir.response.data && redir.response.data.location) {
        window.location = redir.response.data.location
      } else {
        return Promise.reject(redir)
      }
    });
  };

  return (
    <React.Fragment>
    <h1>Log in to track your items</h1>
    <form name="loginForm" method="POST" action="/login">
      <input
        type="text"
        placeholder="Email"
        name="email"
        onBlur={email_exists_check}
        /><br/>
      <input
        type="password"
        placeholder="Password"
        name="password"
        onBlur={ e => set_credentials({ ...credentials, ["password"]: e.target.value.trim() }) }
      /><br/>
    <button onClick={user_login}>
      Log in
    </button><br/>
    </form>
    {message && <span>{message}</span>}
    </React.Fragment>
  )
}