import React, { useState } from "react";
import ReactDOM from "react-dom";

export default function ToggleButton({text, on_toggle}) {
  return (
    <div>
      <button onClick={on_toggle}>{text}</button>
    </div>
  )
}

ToggleButton.defaultProps = {
  text: "Button-Text",
  on_toggle: (e => {})
}
