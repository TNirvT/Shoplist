import React from "react";
import iconGithub from "../github.svg";
import iconLinkedin from "../287697_linkedin.svg";
import iconTwtter from "../twitter.svg";
import iconFacebook from "../fb.svg";

export default function Footer() {
  return (
    <footer className="bg-dark text-light link-light p-3 position-relative">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div>
            <p>© 2022 <a href="https://github.com/TNirvT" className="link-light" style={{textDecoration:"none"}}>TNirvT Repository</a></p>
          </div>
          <div>
            <a href="https://github.com/TNirvT"><img src={iconGithub} alt="Github" width="40" className="px-2"/></a>Github
          </div>
          <div>
            <a href="https://linkedin.com"><img src={iconLinkedin} alt="LinkedIn" width="40" className="px-2"/></a>LinkedIn
          </div>
          <div>
            <a href="https://twitter.com"><img src={iconTwtter} alt="Twitter" width="40" className="px-2"/></a>Twitter
          </div>
          <div>
            <a href="https://facebook.com"><img src={iconFacebook} alt="Facebook" width="40" className="px-2"/></a>Facebook
          </div>
        </div>
      </div>
    </footer>
  )
}
