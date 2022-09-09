import React, { useState, useRef } from "react"
import "./style.css"

/**
 * 100 meter sprint
 * - A line of checkboxes, that triggers the timer at the first click
 * and ends a the final click, score is based on the time between those two moments
 */

const boxCount = 28

export default function Sprint({ updateScore }) {
  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [isFalseStart, setIsFalseStart] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const startTime = useRef()
  const animFrame = useRef()
  const timeoutRef = useRef()

  const tick = () => {
    let delta = Date.now() - startTime.current
    setCurrentTime(delta / 1000)
    animFrame.current = window.requestAnimationFrame(tick)
  }

  const readyToGo = () => {
    setReady(true)

    // Start at a random time between 2 and 3 seconds
    timeoutRef.current = setTimeout(() => {
      start()
    }, Math.random() * 1000 + 2000)
  }

  const start = () => {
    setStarted(true)
    startTime.current = Date.now()
    animFrame.current = window.requestAnimationFrame(tick)
  }

  const end = () => {
    window.cancelAnimationFrame(animFrame.current)
    updateScore({ "100 Meter Sprint": currentTime })
    setIsFinished(true)
  }

  const falseStart = () => {
    clearTimeout(timeoutRef.current)
    setIsFalseStart(true)
    setIsFinished(true)
    window.cancelAnimationFrame(animFrame.current)
    setCurrentTime("False Start!")
    updateScore({ "100 Meter Sprint": 999 })
  }

  const onCheckboxClick = (e, index) => {

    if(!started) {
      falseStart()
    }

    const checked = e.target.checked
    if (checked && index === currentIndex) {
      if (currentIndex === boxCount - 1) {
        end()
      }

      setCurrentIndex(currentIndex + 1)
    }
  }

  const checkBoxes = []
  for (let i = 0; i < boxCount; i++) {
    checkBoxes.push(
      <input
        key={i}
        type="checkbox"
        onClick={(e) => onCheckboxClick(e, i)}
        tabIndex={-Math.floor(Math.random() * 10)}
        {...(i > currentIndex && {
          disabled: true,
        })}
        {...(isFalseStart && {
          disabled: true
        })}
        {...(!ready && {
          disabled: true
        })}
      />
    )
  }

  return (
    <div className="sportsWrapper">
      {/*TODO: Own component*/}
      <div className="instructions">
        <div className="name">100 Meter Sprint</div>
        <div className="howTo">
          <div className="text">
            When the start board reads Go, begin clicking, speed is what matters
            here. <br />
            <br /> Don't false start.
            <br /><br /> <a href="https://www.youtube.com/watch?v=wnFUC6TDR0s" target="_blank">Watch how on YouTube</a>
          </div>
          <button className="readyButton" onClick={readyToGo} disabled={ready || isFalseStart}>
            ready
          </button>
        </div>
      </div>
      <div className="theSport">
        <div
          className={`setGo ${ready && currentTime === null && "ready"} ${
            ready && currentTime !== null && currentTime !== 999 && !isFinished && "going"
          } ${
            isFalseStart || isFinished && "falseStart"
          }`}
        >
          <span className="set">SET</span>/<span className="go">GO</span>
        </div>
        <div>{checkBoxes}</div>
      </div>
      <div className="score">
        <div className="time">
          <b>Time:</b> {currentTime ? currentTime : "not yet set"}
        </div>
      </div>
    </div>
  )
}
