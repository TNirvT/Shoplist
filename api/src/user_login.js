import React, { useState } from "react";
import axios from "axios";

export default function User_Login() {
  const [new_user, set_new_user] = useState({});
  const [name_message, set_name_message] = useState("");
  const [email_message, set_email_message] = useState("");
  const [password_message, set_password_message] = useState("");
  const [validate_all, set_validate_all] = useState({
    user_name: false,
    user_email: false,
    password: false
  });
  const [message, set_message] = useState("");
  
  function name_check(e) {
    if ( e.target.value.trim().length < 1 ) {
      set_new_user({...new_user, ["user_name"]:null});
      set_name_message(`User name must not be empty`);
      set_validate_all({...validate_all, ["user_name"]:false});
    } else {
      set_new_user({...new_user, ["user_name"]:e.target.value.trim()});
      set_name_message(`✔`);
      set_validate_all({...validate_all, ["user_name"]:true});
    }
  };

  function email_exists_check(e) {
    const re_email = /^\w+@\w+\.\w+$/;
    if ( re_email.test(e.target.value.trim()) ) {
      set_new_user({...new_user, ["user_email"]:e.target.value.trim()});
      set_email_message("");
    } else {
      set_new_user({...new_user, ["user_email"]:null});
      set_email_message(`Invalid Email`);
      set_validate_all({...validate_all, ["user_email"]:false});
      return
    };

    axios.get("/existing_email", {
      params: {
        new_email: e.target.value.trim(),
      },
    }).then(res => {
      if (res.data.email_exists) {
        set_email_message(`Email already exists`);
        set_validate_all({...validate_all, ["user_email"]:false});
      } else {
        set_email_message(`✔`);
        set_validate_all({...validate_all, ["user_email"]:true});
      };
    }).catch(err => {
      if (err != undefined) {
        set_email_message(err.message);
      }
    });
  };

  function password_check(e) {
    let re_pw = /[ ]/;
    const new_pw = e.target.value;
    if (re_pw.test(new_pw)) {
      set_new_user({...new_user, ["password"]:null});
      set_password_message(`Password must not contain white-space`);
      set_validate_all({...validate_all, ["password"]:false});
    } else if (new_pw.length < 6) {
      set_new_user({...new_user, ["password"]:null});
      set_password_message(`Password must be at least 6 characters`);
      set_validate_all({...validate_all, ["password"]:false});
    } else {
      set_new_user({...new_user, ["password"]:new_pw});
      set_password_message(`✔`);
      set_validate_all({...validate_all, ["password"]:true});
    };
  };

  function create_user() {
    for (const field in validate_all) {
      if (!validate_all[field]) {
        return
      }
    };

    axios.put("/create_user", {
      user_name: new_user.user_name,
      user_email: new_user.user_email,
      password: new_user.password
    }).then(res => {
      set_message("new user created");
    }).catch(err => {
      if (err != undefined) {
        set_message(err.message);
      }
    });
  };

  return (
    <React.Fragment>
    <h1>Create an account</h1>
    <input
      id="name-input"
      type="text"
      placeholder="Name"
      onBlur={name_check}
    /><br/>
    {name_message && <div><span>{name_message}</span></div>}
    <input
      id="email-input"
      type="text"
      placeholder="Email"
      onBlur={email_exists_check}
    /><br/>
    {email_message && <div><span>{email_message}</span></div>}
    <input
      id="password-input"
      type="password"
      placeholder="Password"
      onBlur={password_check}
      /><br/>
    {password_message && <div><span>{password_message}</span></div>}
    <button onClick={create_user}>
      Next
    </button>
    {message && <div><span>{message}</span></div>}
    </React.Fragment>
  )
}