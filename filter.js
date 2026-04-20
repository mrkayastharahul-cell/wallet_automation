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
  `;

  box.innerHTML = `
    <input id="amt" placeholder="Enter amount" style="width:100%;color:black;background:white;margin-bottom:5px;" />
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

  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(t => {
      if (t.innerText.includes("OTP-UPI")) t.click();
    });
  }

  // ===== FIND ROWS BASED ON ₹ TEXT =====
  function getRows() {
    const all = document.querySelectorAll("*");
    let rows = [];

    all.forEach(el => {
      const text = el.innerText?.trim();

      if (!text) return;

      // match ₹100 exactly
      if (text.includes("₹" + target)) {
        const row = el.closest("div");
        if (row) rows.push(row);
      }
    });

    return rows;
  }

  // ===== FILTER =====
  function filterRows(rows) {
    const all = document.querySelectorAll("div");

    all.forEach(div => {
      if (rows.includes(div)) {
        div.style.display = "";
      } else if (div.innerText.includes("₹")) {
        div.style.display = "none";
      }
    });
  }

  // ===== CLICK =====
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

      const rows = getRows();

      if (rows.length > 0) {
        filterRows(rows);

        let success = await clickRows(rows);

        if (success) {
          status.innerText = "Success";
          running = false;
          return;
        }
      }

      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
