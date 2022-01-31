import React from "react";
import iconGithub from "../github.svg";
import iconLinkedin from "../linkedin.svg";
import iconFile from "../file-doc.svg"

export default function Footer() {
  return (
    <footer className="bg-secondary text-light link-light p-3 position-relative">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div>
            <a href="https://github.com/TNirvT/" className="link-light" style={{textDecoration:"none"}}>© 2022 TNirvT</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT/Shoplist" className="link-light" style={{textDecoration:"none"}}><img src={iconFile} alt="Repository" width="40" className="px-2"/>Repository</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT" className="link-light" style={{textDecoration:"none"}}><img src={iconGithub} alt="Github" width="40" className="px-2"/>Github</a>
          </div>
          <div>
            <a href="https://linkedin.com" className="link-light" style={{textDecoration:"none"}}><img src={iconLinkedin} alt="LinkedIn" width="40" className="px-2"/>LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
