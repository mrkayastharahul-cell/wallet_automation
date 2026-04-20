(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;
  let target = "";

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
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
  }

  // UI
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
    <input id="amt" placeholder="Enter amount" style="width:100%;color:black;background:white;" />
    <button id="start" style="width:100%;background:green;color:white;">Start</button>
    <button id="stop" style="width:100%;background:red;color:white;">Stop</button>
    <div id="status">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");

  checkAccess().then(allowed => {
    if (!allowed) {
      status.innerText = "Denied";
      return;
    }

    document.getElementById("start").onclick = () => {
      target = document.getElementById("amt").value.trim();
      running = true;
      status.innerText = "Running";
      loop();
    };

    document.getElementById("stop").onclick = () => {
      running = false;
      status.innerText = "Stopped";
    };
  });

  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(t => {
      if (t.innerText.includes("OTP-UPI")) t.click();
    });
  }

  // 🔥 FINAL FIND FUNCTION
  function findMatchingRows(target) {
    const buttons = document.querySelectorAll("button");
    let matches = [];

    buttons.forEach(btn => {
      let row = btn.closest("div");
      if (!row) return;

      let text = row.innerText;

      // extract numbers from row
      let numbers = text.match(/\d+/g);
      if (!numbers) return;

      if (numbers.includes(target)) {
        matches.push({
          row: row,
          button: btn
        });
      }
    });

    return matches;
  }

  async function clickMatches() {
    const matches = findMatchingRows(target);

    if (matches.length === 0) return false;

    playSound();

    for (let item of matches) {
      item.button.click();

      await sleep(1200);

      if (document.body.innerText.includes("Select Payment Method")) {
        return true;
      }
    }

    return false;
  }

  async function loop() {
    while (running) {
      clickOtpUpi();

      await sleep(800);

      let success = await clickMatches();

      if (success) {
        status.innerText = "Success";
        running = false;
        return;
      }

      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
