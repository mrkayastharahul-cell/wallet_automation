(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;
  let target = "";
  let displayTarget = "";

  const UID = localStorage.getItem("bot_uid") || prompt("Enter UID");
  localStorage.setItem("bot_uid", UID);

  async function checkAccess() {
    try {
      const res = await fetch("https://raw.githubusercontent.com/mrkayastharahul-cell/wallet_automation/main/users.json");
      const data = await res.json();
      return data.allowed.includes(UID);
    } catch {
      return false;
    }
  }

  function playSound() {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
  }

  // UI
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:220px;
    background:#111;
    color:#fff;
    padding:10px;
    border-radius:10px;
    z-index:999999;
    font-family:sans-serif;
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
      <span>Auto</span>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amt" placeholder="Enter amount" style="width:100%;margin-top:5px;color:black;background:white;" />
    <div id="showAmt" style="margin-top:5px;font-size:12px;color:black;"></div>

    <button id="start" style="width:100%;margin-top:5px;background:green;color:#fff;">Start</button>
    <button id="stop" style="width:100%;margin-top:5px;background:red;color:#fff;">Stop</button>

    <div id="status" style="margin-top:5px;font-size:12px;">Checking access...</div>
  `;

  document.body.appendChild(box);

  const light = document.getElementById("light");
  const status = document.getElementById("status");
  const showAmt = document.getElementById("showAmt");

  checkAccess().then(allowed => {
    if (!allowed) {
      status.innerText = "Access Denied";
      return;
    }

    status.innerText = "Active";

    document.getElementById("start").onclick = () => {
      target = document.getElementById("amt").value.trim();

      if (!target) return alert("Enter amount");

      displayTarget = "₹" + target;

      showAmt.innerText = "Target: " + displayTarget;

      running = true;
      light.style.background = "lime";
      status.innerText = "Running";
      loop();
    };

    document.getElementById("stop").onclick = () => {
      running = false;
      light.style.background = "red";
      status.innerText = "Stopped";
    };
  });

  function clickOtpUpi() {
    const tabs = document.querySelectorAll(".tab-title");
    for (let tab of tabs) {
      if (tab.innerText.includes("OTP-UPI")) {
        tab.click();
        return true;
      }
    }
    return false;
  }

  // 🔥 FIND ALL MATCHES
  function getMatchingContainers() {
    const elements = document.querySelectorAll("body *");
    let containers = [];

    for (let el of elements) {
      let txt = el.innerText?.trim();

      if (txt === displayTarget) {
        let container = el.closest("div");
        if (container) containers.push(container);
      }
    }

    return containers;
  }

  // 🔥 CLICK ALL BUY BUTTONS ONE BY ONE
  async function clickAllBuy() {
    const targets = getMatchingContainers();

    if (targets.length === 0) return false;

    playSound();

    for (let container of targets) {
      let buyBtn = container.querySelector("button");

      if (buyBtn && buyBtn.innerText.includes("Buy")) {
        buyBtn.click();

        await sleep(1200);

        if (document.body.innerText.includes("Select Payment Method")) {
          return true;
        }
      }
    }

    return false;
  }

  async function loop() {
    while (running) {

      clickOtpUpi();

      await sleep(800);

      let success = await clickAllBuy();

      if (success) {
        status.innerText = "Success";
        running = false;
        light.style.background = "red";
        return;
      }

      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
