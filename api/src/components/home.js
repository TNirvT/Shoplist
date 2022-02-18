import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import UserLogin from "./user_login";
import UserCreation from "./user_creation";
import Footer from "./footer";

export default function Home() {

  return (
    <Router>
      <nav className="navbar navbar-expand-md bg-secondary navbar-dark">
        <div className="container">
        <a href="#" className="navbar-brand text-warning">Shoplist</a>
        </div>
      </nav>
      <section className="bg-light text-dark p-1">
        <h1 className="text-center fw-bolder" style={{fontSize:40}}>
          The way to price track
        </h1>
        <h4 className="text-center">
          Make your own shoplist today.
        </h4>
      </section>
      <section className="bg-light text-dark p-1">
        <div className="container">
          <Routes>
            <Route path="/" element={<UserLogin />} />
            <Route path="/signup" element={<UserCreation />} />
          </Routes>
          {/* {signup || <UserLogin setSignup={setSignup} />}
          {signup && <UserCreation setSignup={setSignup} />} */}
        </div>
      </section>
      <Footer />
    </Router>
  )
}
