new rainbowCursor({ element: document.querySelector("#rainbow") })
new clockCursor({ element: document.querySelector("#clock") })
new fairyDustCursor({ element: document.querySelector("#fairyDust") })
new ghostCursor({ element: document.querySelector("#ghost") })
new trailingCursor({ element: document.querySelector("#trailing") })
new springyEmojiCursor({ element: document.querySelector("#springs") })
new followingDotCursor({ element: document.querySelector("#following") })
new emojiCursor({ element: document.querySelector("#emoji") })
new bubbleCursor({ element: document.querySelector("#bubbles") })
new snowflakeCursor({ element: document.querySelector("#snowflake") })

const allCursors = [...document.querySelectorAll('.cursor')]
let currentIndex = 0

function cycle() {
  allCursors[currentIndex].classList.remove('active')
    currentIndex++
    currentIndex %= allCursors.length
    allCursors[currentIndex].classList.add('active')
}

document.querySelectorAll(".effect").forEach(effect => 
  effect.addEventListener("click", () => {
  	cycle()
  })
)

document.querySelectorAll(".byline").forEach(effect => 
  effect.addEventListener("click", () => {
    cycle()
  })
)