import React, { useState } from "react";
import axios from "axios";

export default function UserCreation() {
  const [newUser, setNewUser] = useState({});
  const [nameMessage, setNameMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [validateAll, setValidateAll] = useState({
    userName: false,
    userEmail: false,
    password: false
  });
  const [message, setMessage] = useState("");
  
  function nameCheck(e) {
    if ( e.target.value.trim().length < 1 ) {
      setNewUser({...newUser, userName:null});
      setNameMessage(`User name must not be empty`);
      setValidateAll({...validateAll, userName: false});
    } else {
      setNewUser({...newUser, userName:e.target.value.trim()});
      setNameMessage(`✔`);
      setValidateAll({...validateAll, userName: true});
    }
  };

  function emailExistsCheck(e) {
    const reEmail = /^[\w\.]+@\w+\.\w+$/;
    if ( reEmail.test(e.target.value.trim()) ) {
      setNewUser({...newUser, userEmail: e.target.value.trim()});
      setEmailMessage("");
    } else {
      setNewUser({...newUser, userEmail:null});
      setEmailMessage(`Invalid Email`);
      setValidateAll({...validateAll, userEmail: false});
      return
    };

    axios.get("/existing_email", {
      params: {
        new_email: e.target.value.trim(),
      },
    }).then(res => {
      if (res.data.email_exists) {
        setEmailMessage(`Email already exists`);
        setValidateAll({...validateAll, userEmail: false});
      } else {
        setEmailMessage(`✔`);
        setValidateAll({...validateAll, userEmail: true});
      };
    }).catch(err => {
      if (err) {
        setEmailMessage(err.message);
      }
    });
  };

  function passwordCheck(e) {
    let rePw = /[ ]/;
    const newPw = e.target.value;
    if (rePw.test(newPw)) {
      setNewUser({...newUser, password: null});
      setPasswordMessage(`Password must not contain white-space`);
      setValidateAll({...validateAll, password: false});
    } else if (newPw.length < 6) {
      setNewUser({...newUser, password: null});
      setPasswordMessage(`Password must be at least 6 characters`);
      setValidateAll({...validateAll, password: false});
    } else {
      setNewUser({...newUser, password: newPw});
      setPasswordMessage(`✔`);
      setValidateAll({...validateAll, password: true});
    };
  };

  function createUser() {
    for (const field in validateAll) {
      if (!validateAll[field]) {
        setMessage("Some of the fields are invalid");
        return;
      }
    };

    axios.put("/user_creation", {
      params: {
        user_name: newUser.userName,
        user_email: newUser.userEmail,
        password: newUser.password,
      },
    }).then(res => {
      setMessage("new user created");
      window.location = res.data.location;
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };

  return (
    <React.Fragment>
    <h1>Create an account</h1>
    <input
      type="text"
      placeholder="Name"
      name="userName"
      onBlur={nameCheck}
    /><br/>
    {nameMessage && <div><span>{nameMessage}</span></div>}
    <input
      type="text"
      placeholder="Email"
      name="userEmail"
      onBlur={emailExistsCheck}
    /><br/>
    {emailMessage && <div><span>{emailMessage}</span></div>}
    <input
      type="password"
      placeholder="Password"
      name="password"
      onBlur={passwordCheck}
      /><br/>
    {passwordMessage && <div><span>{passwordMessage}</span></div>}
    <button onClick={createUser}>
      Next
    </button>
    {message && <div><span>{message}</span></div>}
    </React.Fragment>
  )
}
