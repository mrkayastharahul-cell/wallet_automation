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

  // ===== STRICT MATCH (ONLY EXACT AMOUNT) =====
  function getRows() {
    const buttons = document.querySelectorAll("button");
    let rows = [];

    buttons.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      const text = row.innerText;

      // extract numbers
      const numbers = text.match(/\d+/g);
      if (!numbers) return;

      // STRICT match only exact target (e.g. 1000 only)
      if (numbers.some(n => n === target)) {
        if (!rows.includes(row)) {
          rows.push(row);
        }
      }
    });

    return rows;
  }

  // ===== FILTER ONLY MATCHED ROWS =====
  function filterRows(rows) {
    const buttons = document.querySelectorAll("button");

    buttons.forEach(btn => {
      const row = btn.closest("div");
      if (!row) return;

      const isMatch = rows.includes(row);

      if (row.innerText.includes("₹")) {
        row.style.display = isMatch ? "" : "none";
      }
    });
  }

  // ===== CLICK MATCHES =====
  async function clickRows(rows) {
    if (rows.length === 0) return false;

    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();

    for (let row of rows) {
      let btn = Array.from(row.querySelectorAll("button"))
        .find(b => b.innerText.includes("Buy"));

      if (btn) {
        btn.click();

        await sleep(1200);

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

      await sleep(800);

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
