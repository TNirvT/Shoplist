import React, { useState } from "react";

import UserLogin from "./user_login";
import UserCreation from "./user_creation";
import ToggleButton from "./toggle_button";

export default function Home() {
  const [signup, setSignup] = useState(false);
  let toogle_text = signup ? "Existing User? Log In" : "New User? Sign Up";

  return (
    <div>
      {signup || <UserLogin />}
      <br/>
      <ToggleButton text={toogle_text} onToggle={()=>setSignup(!signup)} />
      <br/>
      {signup && <UserCreation />}
    </div>
  )
}