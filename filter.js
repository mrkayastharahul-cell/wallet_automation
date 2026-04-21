(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;

  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:200px;
    background:#111;
    color:#fff;
    padding:10px;
    border-radius:10px;
    z-index:999999;
  `;

  box.innerHTML = `
    <div>Target: ₹1000</div>
    <button id="start">Start</button>
    <button id="stop">Stop</button>
    <div id="status">Idle</div>
  `;

  document.body.appendChild(box);
  const status = document.getElementById("status");

  document.getElementById("start").onclick = () => {
    running = true;
    status.innerText = "Running";
    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    status.innerText = "Stopped";
  };

  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(t => {
      if (t.innerText.includes("OTP-UPI")) t.click();
    });
  }

  function clickLarge() {
    document.querySelectorAll(".txt").forEach(el => {
      if (el.innerText.trim() === "Large") el.click();
    });
  }

  function findTargets() {
    return Array.from(document.querySelectorAll(".ml10"))
      .filter(el => el.innerText.includes("₹1000"));
  }

  function highlight(el) {
    el.style.outline = "3px solid red";
  }

  // 🔥 FIND BUY TEXT (REAL TARGET)
  function findBuyText(startEl) {
    let current = startEl;

    while (current && current !== document.body) {
      let btn = current.querySelector(".van-button__text");
      if (btn && btn.innerText.trim() === "Buy") {
        return btn;
      }
      current = current.parentElement;
    }

    return null;
  }

  async function clickTargets(targets) {
    if (targets.length === 0) return false;

    await sleep(1000);

    for (let t of targets) {
      highlight(t);

      let buyText = findBuyText(t);

      if (buyText) {
        buyText.scrollIntoView({ block: "center" });

        // 🔥 CLICK REAL TARGET
        buyText.click();

        await sleep(1200);

        if (document.body.innerText.includes("Select Payment Method")) {
          new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
          running = false;
          status.innerText = "Stopped (Payment Page)";
          return true;
        }
      }
    }

    return false;
  }

  async function loop() {
    while (running) {

      if (document.body.innerText.includes("Select Payment Method")) {
        running = false;
        status.innerText = "Stopped";
        return;
      }

      clickOtpUpi();
      clickLarge();

      await sleep(800);

      let targets = findTargets();

      if (targets.length > 0) {
        let success = await clickTargets(targets);
        if (success) return;
      }

      await sleep(800);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
