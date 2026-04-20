(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  console.log("Filter script loaded");

  let running = false;
  let target = "";

  // 🔐 UID SYSTEM
  const UID = localStorage.getItem("bot_uid") || prompt("Enter your UID");
  localStorage.setItem("bot_uid", UID);

  async function checkAccess() {
    try {
      const res = await fetch("https://YOURDOMAIN.com/api/check.php?uid=" + UID);
      const data = await res.json();
      return data.allowed;
    } catch {
      return false;
    }
  }

  // 🎛 UI
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
    font-family:sans-serif;
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
      <span>Auto</span>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amt" placeholder="Enter amount" style="width:100%;margin-top:5px;" />

    <button id="start" style="width:100%;margin-top:5px;background:green;color:#fff;">Start</button>
    <button id="stop" style="width:100%;margin-top:5px;background:red;color:#fff;">Stop</button>

    <div id="status" style="margin-top:5px;font-size:12px;">Checking access...</div>
  `;

  document.body.appendChild(box);

  const light = document.getElementById("light");
  const status = document.getElementById("status");

  // 🔐 ACCESS CHECK
  checkAccess().then(allowed => {
    if (!allowed) {
      status.innerText = "Access Denied";
      return;
    }

    status.innerText = "Active";

    // ▶️ START
    document.getElementById("start").onclick = () => {
      target = document.getElementById("amt").value.trim();
      if (!target) return alert("Enter amount");

      running = true;
      light.style.background = "lime";
      status.innerText = "Running";
      loop();
    };

    // ⛔ STOP
    document.getElementById("stop").onclick = () => {
      running = false;
      light.style.background = "red";
      status.innerText = "Stopped";
    };
  });

  // 🔍 FIND + CLICK
  function findAndClick() {
    const elements = document.querySelectorAll("body *");

    for (let el of elements) {
      let txt = el.innerText?.trim();

      if (txt === target) {
        let btn = el.closest("div")?.querySelector("button");

        if (btn) {
          console.log("Match found → Clicking BUY:", target);
          btn.click();
          return true;
        }
      }
    }
    return false;
  }

  // 🔁 LOOP
  async function loop() {
    while (running) {
      let found = findAndClick();

      if (found) {
        await sleep(2000);

        if (location.href.toLowerCase().includes("payment")) {
          console.log("Reached payment page → STOP");
          status.innerText = "Success";
          running = false;
          light.style.background = "red";
          return;
        }
      }

      await sleep(1200);
      location.reload();
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
