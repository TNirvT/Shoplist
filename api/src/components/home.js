import React, { useState } from "react";

import UserLogin from "./user_login";
import UserCreation from "./user_creation";
import ToggleButton from "./toggle_button";

export default function Home() {
  const [signup, setSignup] = useState(false);
  let toogleText = signup ? "Existing User? Log In" : "New User? Sign Up";

  return (
    <div>
      <nav className="navbar navbar-expand-md bg-secondary navbar-dark">
        <div className="container">
        <a href="#" className="navbar-brand">Shop<span className="text-warning">List</span></a>
        </div>
      </nav>
      <section className="bg-light text-dark p-1">
        <h1 className="text-center">The way to price track</h1>
        <h4 className="text-center">Make your own shoplist today.</h4>
      </section>
      <section className="bg-light text-dark p-1">
        <div className="container">
          {signup || <UserLogin setSignup={setSignup} />}
          {signup && <UserCreation setSignup={setSignup} />}
        </div>
      </section>
    </div>
  )
}
