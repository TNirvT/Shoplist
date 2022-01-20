import React, { useState } from "react";

export default function ToggleButton({text, onToggle, className=null}) {
  return (
    <button className={className} onClick={onToggle}>{text}</button>
  )
}

ToggleButton.defaultProps = {
  text: "Button-Text",
  onToggle: (e => {console.log("Clicked")})
}
