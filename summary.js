// summary.js — the month's totals, each member's balance, and who pays whom (with UPI).

const monthPicker = document.getElementById("month-picker");
monthPicker.value = todayText().slice(0, 7); // "2026-10"
monthPicker.addEventListener("change", renderSummary);

// Puts a number on the page twice: nicely for people, plainly (data-value) for our checker.
function showMoney(testid, amount) {
    const el = document.querySelector(`[data-testid="${testid}"]`);
    el.textContent = `₹${rupees(amount)}`;
    el.dataset.value = amount.toFixed(2);
}

function renderSummary() {
    const month = monthPicker.value;
    if (!month) return;
    const s = monthSummary(state, month);

    showMoney("total-spent", s.totalSpent);
    showMoney("cost-per-meal", s.costPerMeal);
    showMoney("per-head", s.perHead);
    const mealsEl = document.querySelector('[data-testid="total-meals"]');
    mealsEl.textContent = s.totalMeals;
    mealsEl.dataset.value = s.totalMeals;

    // Balance table: one row per member.
    const body = document.getElementById("balance-body");
    body.innerHTML = "";
    for (const m of s.members) {
        const tr = document.createElement("tr");
        tr.dataset.testid = "balance-row";
        tr.dataset.name = m.name;
        tr.dataset.meals = m.meals;
        tr.dataset.paid = m.paid.toFixed(2);
        tr.dataset.share = m.share.toFixed(2);
        tr.dataset.balance = m.balance.toFixed(2);
        const cells = [m.name, m.meals, `₹${rupees(m.paid)}`, `₹${rupees(m.share)}`, (m.balance >= 0 ? "+" : "−") + `₹${rupees(Math.abs(m.balance))}`];
        for (const value of cells) {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        }
        tr.className = m.balance < 0 ? "owes" : "gets";
        body.appendChild(tr);
    }

    // Settle up: who pays whom.
    const list = document.getElementById("settle-list");
    list.innerHTML = "";
    const transfers = settleUp(s.members);
    document.getElementById("settle-empty").hidden = transfers.length > 0;
    for (const t of transfers) list.appendChild(settleRow(t, month));
}

function settleRow(t, month) {
    const li = document.createElement("li");
    li.dataset.testid = "settle-row";
    li.dataset.from = t.from;
    li.dataset.to = t.to;
    li.dataset.amount = t.amount.toFixed(2);

    const text = document.createElement("span");
    text.textContent = `${t.from} pays ${t.to} ₹${rupees(t.amount)} `;
    li.appendChild(text);

    if (!t.toUpi) {
        const note = document.createElement("em");
        note.dataset.testid = "no-upi";
        note.textContent = `(ask ${t.to} to add a UPI id)`;
        li.appendChild(note);
        return li;
    }

    const link = document.createElement("a");
    link.href = upiLink(t, month);
    link.textContent = "Pay with UPI";
    link.dataset.testid = "upi-link";

    const qrButton = document.createElement("button");
    qrButton.type = "button";
    qrButton.className = "small";
    qrButton.textContent = "Show QR";
    qrButton.dataset.testid = "qr-button";

    const qrBox = document.createElement("div");
    qrBox.className = "qr";
    qrBox.dataset.testid = "qr-box";
    qrBox.hidden = true;

    qrButton.addEventListener("click", () => {
        if (qrBox.childElementCount === 0) {
            if (typeof QRCode === "undefined") {
                qrBox.textContent = "The QR library did not load (no internet?). Use the Pay with UPI link.";
            } else {
                new QRCode(qrBox, { text: link.href, width: 180, height: 180 });
            }
        }
        qrBox.hidden = !qrBox.hidden;
        qrButton.textContent = qrBox.hidden ? "Show QR" : "Hide QR";
    });

    li.append(link, " ", qrButton, qrBox);
    return li;
}

onChange(renderSummary);
