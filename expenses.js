// expenses.js — money spent on the mess (rice, vegetables, gas, cook's pay …) and who paid.

const expenseDate = document.getElementById("expense-date");
expenseDate.value = todayText();

document.getElementById("expense-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const error = document.getElementById("expense-error");
  const payerId = document.getElementById("expense-payer").value;
  const amountText = document.getElementById("expense-amount").value.trim();
  const amount = Number(amountText);
  const note = document.getElementById("expense-note").value.trim();
  const date = expenseDate.value;

  if (!payerId) {
    error.textContent = "Add a member first.";
    return;
  }
  // Rupees with at most 2 decimals (paise), more than 0 and at most ₹1,00,000.
  if (!/^\d+(\.\d{1,2})?$/.test(amountText) || amount <= 0 || amount > 100000) {
    error.textContent = "Amount must be more than ₹0 and at most ₹1,00,000, with up to 2 decimals.";
    return;
  }
  if (!date) {
    error.textContent = "Pick a date.";
    return;
  }

  error.textContent = "";
  state.expenses.push({ id: uid(), date, payerId, amount, note });
  save();
  document.getElementById("expense-amount").value = "";
  document.getElementById("expense-note").value = "";
});

function renderExpenses() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";
  // Newest first. "2026-10-05" > "2026-10-01" works because the dates are YYYY-MM-DD text.
  const sorted = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  for (const e of sorted) {
    const li = document.createElement("li");
    li.dataset.testid = "expense-row";
    li.dataset.id = e.id;
    const text = document.createElement("span");
    text.textContent = `${e.date} · ${memberName(e.payerId)} paid ₹${rupees(e.amount)}${e.note ? " · " + e.note : ""}`;
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.className = "small";
    del.dataset.testid = "delete-expense";
    del.addEventListener("click", () => {
      state.expenses = state.expenses.filter((x) => x.id !== e.id);
      save();
    });
    li.append(text, del);
    list.appendChild(li);
  }
}

onChange(renderExpenses);
