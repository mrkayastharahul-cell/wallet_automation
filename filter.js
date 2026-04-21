(function () {
  if (window.__FILTER__) return;
  window.__FILTER__ = true;

  let running = false;
  const target = "1000";

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
    <div style="margin-bottom:5px;font-weight:bold;">Target: ₹1000</div>
    <button id="start" style="width:100%;background:green;color:white;margin-bottom:5px;">Start</button>
    <button id="stop" style="width:100%;background:red;color:white;margin-bottom:5px;">Stop</button>
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

  function beep() {
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
  }

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

  // ===== FIND ROWS =====
  function getRows() {
    const btns = document.querySelectorAll(".van-button--primary");
    let rows = [];

    btns.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      const nums = row.innerText.match(/\d+/g);
      if (!nums) return;

      if (nums.includes(target)) {
        if (!rows.includes(row)) rows.push(row);
      }
    });

    return rows;
  }

  // ===== FILTER =====
  function filterRows(rows) {
    const btns = document.querySelectorAll(".van-button--primary");

    btns.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      if (row.innerText.includes("₹")) {
        row.style.display = rows.includes(row) ? "" : "none";
      }
    });
  }

  // ===== VISUAL =====
  function highlight(row) {
    row.style.outline = "3px solid red";
    row.style.background = "rgba(255,0,0,0.2)";
  }

  // ===== CLICK BUY (FINAL FIX) =====
  async function clickRows(rows) {
    if (rows.length === 0) return false;

    await sleep(1000); // wait after filtering

    for (let row of rows) {
      highlight(row);

      let buttons = row.querySelectorAll("button.van-button--primary");

      for (let btn of buttons) {
        if (btn.offsetParent !== null) { // visible check
          btn.scrollIntoView({ block: "center" });

          btn.click(); // 🔥 same as manual click

          await sleep(1200);

          if (document.body.innerText.includes("Select Payment Method")) {
            beep();
            running = false;
            status.innerText = "Stopped (Payment Page)";
            return true;
          }
        }
      }
    }

    return false;
  }

  // ===== LOOP =====
  async function loop() {
    while (running) {

      if (document.body.innerText.includes("Select Payment Method")) {
        beep();
        running = false;
        status.innerText = "Stopped (Payment Page)";
        return;
      }

      clickOtpUpi();
      clickLarge();

      await sleep(800);

      const rows = getRows();

      if (rows.length > 0) {
        filterRows(rows);

        let success = await clickRows(rows);
        if (success) return;
      }

      await sleep(800);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
