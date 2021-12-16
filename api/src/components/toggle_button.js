import React, { useState } from "react";

export default function ToggleButton({text, onToggle, classN=null}) {
  return (
    <button className={classN} onClick={onToggle}>{text}</button>
  )
}

ToggleButton.defaultProps = {
  text: "Button-Text",
  onToggle: (e => {})
}
