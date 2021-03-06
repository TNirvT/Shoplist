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
            <a href="https://github.com/TNirvT/" target="_blank" className="link-light link-nodeco">ShopList 2022 | by TNirvT</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT" target="_blank" className="link-light link-nodeco"><img src={iconGithub} alt="Github" width="40" className="px-2"/>Github</a>
          </div>
          <div>
            <a href="https://www.linkedin.com/in/terry-t/" target="_blank" className="link-light link-nodeco"><img src={iconLinkedin} alt="LinkedIn" width="40" className="px-2"/>LinkedIn</a>
          </div>
          <div>
            <a href="https://github.com/TNirvT/Shoplist" target="_blank" className="link-light link-nodeco"><img src={iconRepo} alt="Repository" width="40" className="px-2"/>Repository</a>
          </div>
        </div>
      </div>
      <div className="container my-3">
        Icons by authors on <a href="https://www.svgrepo.com" className="link-light link-nodeco">svgrepo.com</a><br/>
        <a href="https://github.com/TNirvT/Shoplist/blob/dev/Resources.md" target="_blank" className="link-light link-nodeco">Details.</a>
      </div>
    </footer>
  )
}
