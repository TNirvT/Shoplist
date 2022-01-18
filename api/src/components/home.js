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
      <section className="bg-light text-dark">
        <div className="container">
          <div className="text-center">
            <h1>The way to track prices</h1>
            <h4>Make your own shoplist today.</h4>
            {signup || <UserLogin />}
          </div>
        </div>
      </section>
      <br/>
      <ToggleButton text={toogleText} onToggle={() => setSignup(!signup)} />
      <br/>
      {signup && <UserCreation />}
    </div>
  )
}
