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
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
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
    <input id="amt" placeholder="Enter amount" style="width:100%;margin-top:5px;color:black;background:white;" />
    <button id="start" style="width:100%;margin-top:5px;background:green;color:#fff;">Start</button>
    <button id="stop" style="width:100%;margin-top:5px;background:red;color:#fff;">Stop</button>
    <div id="status">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");

  checkAccess().then(allowed => {
    if (!allowed) {
      status.innerText = "Access Denied";
      return;
    }

    document.getElementById("start").onclick = () => {
      target = document.getElementById("amt").value.trim();
      displayTarget = "₹" + target;

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

  // 🔥 FIND ROWS (IMPORTANT FIX)
  function getRows() {
    return Array.from(document.querySelectorAll("button"))
      .map(btn => btn.closest("div")) // go up
      .filter(el => el && el.innerText.includes("₹"));
  }

  // 🔥 FILTER ONLY TARGET ROWS
  function filterRows(rows) {
    rows.forEach(row => {
      if (row.innerText.includes(displayTarget)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  // 🔥 CLICK BUY PROPERLY
  async function clickAllMatching(rows) {
    let matched = rows.filter(r => r.innerText.includes(displayTarget));

    if (matched.length === 0) return false;

    playSound();

    for (let row of matched) {
      let btn = row.querySelector("button");

      if (btn) {
        // REAL CLICK (important)
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

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

      let rows = getRows();

      filterRows(rows);

      let success = await clickAllMatching(rows);

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
