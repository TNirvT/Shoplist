import React, { useState } from "react";

export default function ToggleButton({text, onToggle}) {
  return (
    <button onClick={onToggle}>{text}</button>
  )
}

ToggleButton.defaultProps = {
  text: "Button-Text",
  on_toggle: (e => {})
}
