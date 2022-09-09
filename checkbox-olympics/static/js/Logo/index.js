import React from "react"
import "./style.css"

// TODO: Allow unchecking
export default function Logo() {
  return (
    <div className="logo">
      Checkb
      <input className="logoSmaller" type="checkbox" readOnly checked />
      x<input className="logoBigger" type="checkbox" readOnly checked />
      lympics
    </div>
  )
}
