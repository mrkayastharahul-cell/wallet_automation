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

  // ===== CLICK OTP-UPI =====
  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(tab => {
      if (tab.innerText.includes("OTP-UPI")) tab.click();
    });
  }

  // ===== CLICK LARGE =====
  function clickLarge() {
    document.querySelectorAll(".txt").forEach(el => {
      if (el.innerText.trim() === "Large") el.click();
    });
  }

  // ===== FIND ₹1000 ROWS =====
  function getRows() {
    const buttons = document.querySelectorAll("button");
    let rows = [];

    buttons.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      const text = row.innerText;
      const numbers = text.match(/\d+/g);
      if (!numbers) return;

      if (numbers.some(n => n === target)) {
        if (!rows.includes(row)) rows.push(row);
      }
    });

    return rows;
  }

  // ===== FILTER =====
  function filterRows(rows) {
    const buttons = document.querySelectorAll("button");

    buttons.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      if (row.innerText.includes("₹")) {
        row.style.display = rows.includes(row) ? "" : "none";
      }
    });
  }

  // ===== REAL CLICK =====
  function realClick(el) {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  // ===== CLICK BUY =====
  async function clickRows(rows) {
    if (rows.length === 0) return false;

    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();

    for (let row of rows) {
      let btn = Array.from(row.querySelectorAll("button"))
        .find(b => b.innerText.includes("Buy"));

      if (btn) {
        realClick(btn);

        await sleep(1500);

        if (document.body.innerText.includes("Select Payment Method")) {
          running = false;
          status.innerText = "Stopped (Payment Page)";
          return true;
        }
      }
    }

    return false;
  }

  // ===== LOOP =====
  async function loop() {
    while (running) {

      if (document.body.innerText.includes("Select Payment Method")) {
        running = false;
        status.innerText = "Stopped (Payment Page)";
        return;
      }

      clickOtpUpi();
      clickLarge(); // ⚡ instant (no delay)

      await sleep(800); // wait only for results

      const rows = getRows();

      if (rows.length > 0) {
        filterRows(rows);

        let success = await clickRows(rows);
        if (success) return;
      }

      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
