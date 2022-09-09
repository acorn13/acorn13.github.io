import React, { useState } from "react"

import Logo from "../Logo"
import ScoreBoard from "../ScoreBoard"
import Sprint from "../Sprint"
import Hurdles from "../Hurdles"

import "./style.css"

// Main state machine of sports and the timing screen
export default function App() {
  const [sports, setSports] = useState({
    "100 Meter Sprint": null,
    "110 Meter Hurdles": null,
  })
  const [currentSport, setCurrentSport] = useState("100 Meter Sprint")

  const updateScore = (score) => {
    setSports({ ...sports, ...score })
  }

  return (
    <div className="center">
      <div className="fixed">
        <Logo />
        {currentSport !== "scoreboard" && (
          <button onClick={() => setCurrentSport("scoreboard")}>←</button>
        )}
      </div>
      {currentSport === "scoreboard" && (
        <ScoreBoard sports={sports} setCurrentSport={setCurrentSport} />
      )}
      {currentSport === "100 Meter Sprint" && (
        <Sprint updateScore={updateScore} />
      )}
      {currentSport === "110 Meter Hurdles" && (
        <Hurdles updateScore={updateScore} />
      )}
    </div>
  )
}
