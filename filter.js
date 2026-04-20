(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;
  let target = "";

  // ===== UI =====
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
    <input id="amt" placeholder="Enter amount" style="width:100%;margin-bottom:5px;color:black;background:white;" />
    <button id="start" style="width:100%;background:green;color:white;margin-bottom:5px;">Start</button>
    <button id="stop" style="width:100%;background:red;color:white;margin-bottom:5px;">Stop</button>
    <div id="status">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");

  document.getElementById("start").onclick = () => {
    target = document.getElementById("amt").value.trim();
    if (!target) return alert("Enter amount");

    running = true;
    status.innerText = "Running";
    loop();
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    status.innerText = "Stopped";
  };

  // ===== CLICK OTP-UPI =====
  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(tab => {
      if (tab.innerText.includes("OTP-UPI")) tab.click();
    });
  }

  // ===== FIND MATCHES =====
  function getMatches() {
    const buttons = document.querySelectorAll("button");
    let matches = [];

    buttons.forEach(btn => {
      if (!btn.innerText.includes("Buy")) return;

      const row = btn.closest("div");
      if (!row) return;

      const text = row.innerText;

      // extract numbers
      const nums = text.match(/\d+/g);
      if (!nums) return;

      if (nums.includes(target)) {
        matches.push({ row, btn });
      }
    });

    return matches;
  }

  // ===== FILTER ONLY MATCHED ROWS =====
  function filterRows(matches) {
    const buttons = document.querySelectorAll("button");

    buttons.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      const isMatch = matches.some(m => m.row === row);

      row.style.display = isMatch ? "" : "none";
    });
  }

  // ===== PROCESS =====
  async function process() {
    const matches = getMatches();

    if (matches.length === 0) return false;

    // filter UI
    filterRows(matches);

    // sound
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();

    // click each buy
    for (let item of matches) {
      item.btn.click();

      await sleep(1200);

      if (document.body.innerText.includes("Select Payment Method")) {
        return true;
      }
    }

    return false;
  }

  // ===== LOOP =====
  async function loop() {
    while (running) {
      clickOtpUpi();

      await sleep(800);

      let success = await process();

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
