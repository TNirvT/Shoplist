import React, { useState } from "react";
import axios from "axios";
import ToggleButton from "./toggle_button";

export default function UserCreation({setSignup}) {
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
      setPasswordMessage("Password must not contain white-space");
      setValidateAll({...validateAll, password: false});
    } else if (newPw.length < 6) {
      setNewUser({...newUser, password: null});
      setPasswordMessage("Password must be at least 6 characters");
      setValidateAll({...validateAll, password: false});
    } else {
      setNewUser({...newUser, password: newPw});
      setPasswordMessage("✔");
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
      user_name: newUser.userName,
      user_email: newUser.userEmail,
      password: newUser.password,
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
    <div className="d-flex flex-column border border-4 rounded-3 m-3">
      <div className="tab-div mx-auto text-center align-self-center" style={{width:"80vw"}}>
        <button className="tab-btn btn btn-secondary mx-2 text-dark" onClick={() => setSignup(false)}>
          Log In
        </button>
        <button className="tab-btn btn btn-light border border-2 mx-2">
          Sign Up
        </button>
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="newUserName" className="form-label">
          User Name
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Name"
          id="newUserName"
          onBlur={nameCheck}
        />
        {
          nameMessage &&
          <div className="text-danger fst-italic">
            <span>{nameMessage}</span>
          </div>
        }
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="newUserEmail" className="form-label">
          Email Address
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="you@example.com"
          id="newUserEmail"
          onBlur={emailExistsCheck}
        />
        {
          emailMessage &&
          <div className="text-danger fst-italic">
            <span>{emailMessage}</span>
          </div>
        }
      </div>
      <div className="mx-auto w-50 m-2">
        <label htmlFor="newPassword" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          id="newPassword"
          onBlur={passwordCheck}
        />
        {
          passwordMessage &&
          <div className="text-danger fst-italic">
            <span>{passwordMessage}</span>
          </div>
        }
      </div>
      <div className="row mx-auto w-50 m-1 text-warning text-center">
        {message && <span>{message}</span>}
      </div>
      <div className="row mx-auto m-1 text-center align-self-center">
        <button className="btn btn-info my-2" onClick={createUser}>
          Sign Up
        </button>
      </div>
    </div>
  )
}
