function clockCursor(options) {
    let hasWrapperEl = options && options.element;
    let element = hasWrapperEl || document.body;
  
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cursor = { x: width / 2, y: width / 2 };
    let canvas, context;
  
    const dateColor = "blue";
    const faceColor = "black";
    const secondsColor = "red";
    const minutesColor = "black";
    const hoursColor = "black";
  
    const del = 0.4;
  
    const theDays = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
  
    const theMonths = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
  
    let date = new Date();
    let day = date.getDate();
    let year = date.getYear() + 1900; // Year
  
    // Prepare particle arrays
    const dateInWords = (
      " " +
      theDays[date.getDay()] +
      " " +
      day +
      " " +
      theMonths[date.getMonth()] +
      " " +
      year
    ).split("");
  
    const clockNumbers = [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "1",
      "2",
    ];
  
    const F = clockNumbers.length; // todo: why
  
    const hourHand = ["•", "•", "•"];
    const minuteHand = ["•", "•", "•", "•"];
    const secondHand = ["•", "•", "•", "•", "•"];
  
    const siz = 45;
    const eqf = 360 / F;
    const eqd = 360 / dateInWords.length;
    const han = siz / 6.5;
    const ofy = 0;
    const ofx = 0;
    const ofst = 0;
  
    const dy = [];
    const dx = [];
    const zy = [];
    const zx = [];
  
    const tmps = [];
    const tmpm = [];
    const tmph = [];
    const tmpf = [];
    const tmpd = [];
  
    var sum =
      parseInt(
        dateInWords.length +
          F +
          hourHand.length +
          minuteHand.length +
          secondHand.length
      ) + 1;
  
    function init(wrapperEl) {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");
  
      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
  
      if (hasWrapperEl) {
        canvas.style.position = "absolute";
        element.appendChild(canvas);
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
      } else {
        canvas.style.position = "fixed";
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
      }
  
      context.font = "10px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
  
      // indivdual positions of the movement and movement deltas
      for (i = 0; i < sum; i++) {
        dy[i] = 0;
        dx[i] = 0;
        zy[i] = 0;
        zx[i] = 0;
      }
  
      // Date in Words
      for (i = 0; i < dateInWords.length; i++) {
        tmpd[i] = {
          color: dateColor,
          value: dateInWords[i],
        };
      }
  
      // Face!
      for (i = 0; i < clockNumbers.length; i++) {
        tmpf[i] = {
          color: faceColor,
          value: clockNumbers[i],
        };
      }
  
      // Hour
      for (i = 0; i < hourHand.length; i++) {
        tmph[i] = {
          color: hoursColor,
          value: hourHand[i],
        };
      }
  
      // Minutes
      for (i = 0; i < minuteHand.length; i++) {
        tmpm[i] = {
          color: minutesColor,
          value: minuteHand[i],
        };
      }
  
      // Seconds
      for (i = 0; i < secondHand.length; i++) {
        tmps[i] = {
          color: secondsColor,
          value: secondHand[i],
        };
      }
  
      bindEvents();
      loop();
    }
  
    // Bind events that are needed
    function bindEvents() {
      element.addEventListener("mousemove", onMouseMove);
      element.addEventListener("touchmove", onTouchMove, { passive: true });
      element.addEventListener("touchstart", onTouchMove, { passive: true });
      window.addEventListener("resize", onWindowResize);
    }
  
    function onWindowResize(e) {
      width = window.innerWidth;
      height = window.innerHeight;
  
      if (hasWrapperEl) {
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    }
  
    function onTouchMove(e) {
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          // addParticle(
          //   e.touches[i].clientX,
          //   e.touches[i].clientY,
          //   canvImages[Math.floor(Math.random() * canvImages.length)]
          // )
        }
      }
    }
  
    function onMouseMove(e) {
      if (hasWrapperEl) {
        const boundingRect = element.getBoundingClientRect();
        cursor.x = e.clientX - boundingRect.left;
        cursor.y = e.clientY - boundingRect.top;
      } else {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
      }
    }
  
    function updatePositions() {
      widthBuffer = 80;
  
      zy[0] = Math.round((dy[0] += (cursor.y - dy[0]) * del));
      zx[0] = Math.round((dx[0] += (cursor.x - dx[0]) * del));
      for (i = 1; i < sum; i++) {
        zy[i] = Math.round((dy[i] += (zy[i - 1] - dy[i]) * del));
        zx[i] = Math.round((dx[i] += (zx[i - 1] - dx[i]) * del));
        if (dy[i - 1] >= height - 80) dy[i - 1] = height - 80;
        if (dx[i - 1] >= width - widthBuffer) dx[i - 1] = width - widthBuffer;
      }
    }
  
    function updateParticles() {
      context.clearRect(0, 0, width, height);
  
      const time = new Date();
      const secs = time.getSeconds();
      const sec = (Math.PI * (secs - 15)) / 30;
      const mins = time.getMinutes();
      const min = (Math.PI * (mins - 15)) / 30;
      const hrs = time.getHours();
      const hr =
        (Math.PI * (hrs - 3)) / 6 + (Math.PI * parseInt(time.getMinutes())) / 360;
  
      // Date
      for (i = 0; i < tmpd.length; i++) {
        tmpd[i].y =
          dy[i] + siz * 1.5 * Math.sin(-sec + (i * eqd * Math.PI) / 180);
        tmpd[i].x =
          dx[i] + siz * 1.5 * Math.cos(-sec + (i * eqd * Math.PI) / 180);
  
        context.fillStyle = tmpd[i].color;
        context.fillText(tmpd[i].value, tmpd[i].x, tmpd[i].y);
      }
  
      // Face
      for (i = 0; i < tmpf.length; i++) {
        tmpf[i].y =
          dy[tmpd.length + i] + siz * Math.sin((i * eqf * Math.PI) / 180);
        tmpf[i].x =
          dx[tmpd.length + i] + siz * Math.cos((i * eqf * Math.PI) / 180);
  
        context.fillStyle = tmpf[i].color;
        context.fillText(tmpf[i].value, tmpf[i].x, tmpf[i].y);
      }
  
      // Hours
      for (i = 0; i < tmph.length; i++) {
        tmph[i].y = dy[tmpd.length + F + i] + ofy + i * han * Math.sin(hr);
        tmph[i].x = dx[tmpd.length + F + i] + ofx + i * han * Math.cos(hr);
  
        context.fillStyle = tmph[i].color;
        context.fillText(tmph[i].value, tmph[i].x, tmph[i].y);
      }
  
      // Minutes
      for (i = 0; i < tmpm.length; i++) {
        tmpm[i].y =
          dy[tmpd.length + F + tmph.length + i] + ofy + i * han * Math.sin(min);
  
        tmpm[i].x =
          dx[tmpd.length + F + tmph.length + i] + ofx + i * han * Math.cos(min);
  
        context.fillStyle = tmpm[i].color;
        context.fillText(tmpm[i].value, tmpm[i].x, tmpm[i].y);
      }
  
      // Seconds
      for (i = 0; i < tmps.length; i++) {
        tmps[i].y =
          dy[tmpd.length + F + tmph.length + tmpm.length + i] +
          ofy +
          i * han * Math.sin(sec);
  
        tmps[i].x =
          dx[tmpd.length + F + tmph.length + tmpm.length + i] +
          ofx +
          i * han * Math.cos(sec);
  
        context.fillStyle = tmps[i].color;
        context.fillText(tmps[i].value, tmps[i].x, tmps[i].y);
      }
    }
  
    function loop() {
      updatePositions();
      updateParticles();
  
      requestAnimationFrame(loop);
    }
  
    init();
  }
  