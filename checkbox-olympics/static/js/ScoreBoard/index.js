import React from "react"
import "./style.css"

// Score board of various sports. Including the logic on
// how the final times are calculated
export default function ScoreBoard({ sports, setCurrentSport }) {
  const sumValues = (accumulator, currentValue) => {
    const val = sports[currentValue] || 0
    return accumulator + val
  }

  const totalTime = Object.keys(sports).reduce(sumValues, 0)

  return (
    <div className="scoreboard">
      <div className="sports">
        {Object.keys(sports).map((sport) => {
          const sportScore = sports[sport] || false
          return (
            <div key={sport} className="sport">
              <div className="sportName">{sport}</div>
              <div className="sportScore">
                {sportScore ? (
                  sportScore
                ) : (
                  <button
                    onClick={() => {
                      setCurrentSport(sport)
                    }}
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="total">
        <b>Total Time:</b> {totalTime}
      </div>
      <br/>
      <div className="total">
        <ul>
          <li>
           More Games Coming Soon!
          </li>
          <li>
            A <a href="https://theuselessweb.com" target="_blank">Useless Web</a> Project!
          </li>
          <li>
            Follow on <a href="https://www.youtube.com/channel/UCY94K78qF3fLuFaW-Y5GlYw" target="_blank">YouTube</a> for updates!
            
          </li>
        </ul>
      </div>

    </div>
  )
}
