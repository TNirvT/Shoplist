import React from "react";
import iconGithub from "../github-svgrepo-com.svg";
import iconLinkedin from "../linkedin-svgrepo-com.svg";
import iconRepo from "../git-svgrepo-com.svg"

export default function Footer() {
  return (
    <footer className="bg-secondary text-light link-light p-3 position-relative">
      <div className="container">
        <div className="d-flex justify-content-between">
          <div>
            <a href="https://github.com/TNirvT/" className="link-light link-nodeco">© 2022 TNirvT</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT" className="link-light link-nodeco"><img src={iconGithub} alt="Github" width="40" className="px-2"/>Github</a>
          </div>
          <div>
            <a href="https://linkedin.com" className="link-light link-nodeco"><img src={iconLinkedin} alt="LinkedIn" width="40" className="px-2"/>LinkedIn</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT/Shoplist" className="link-light link-nodeco"><img src={iconRepo} alt="Repository" width="40" className="px-2"/>Repository</a>
          </div>
        </div>
      </div>
      <div className="container my-3">
        Icons by authors on <a href="https://www.svgrepo.com" className="link-light link-nodeco">svgrepo.com</a><br/>
        <a href="https://github.com/TNirvT/Shoplist/blob/dev/Resources.md" className="link-light link-nodeco">Details.</a>
      </div>
    </footer>
  )
}
