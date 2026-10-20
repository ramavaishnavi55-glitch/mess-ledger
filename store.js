// store.js — keeps ALL the data and saves it in this browser (localStorage).
// Every other file reads `state` and calls save() after changing it.

const STORAGE_KEY = "messLedger.v1";

// The whole ledger is one object with three lists.
let state = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.members)) return saved;
  } catch {
    // Broken or blocked storage → start empty instead of crashing.
  }
  return { members: [], expenses: [], meals: [] };
}

// Functions that redraw part of the page. Each feature file adds its own with onChange().
const renderers = [];

function onChange(renderFn) {
  renderers.push(renderFn);
  renderFn(); // draw once right away
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    alert("Could not save in this browser. Your changes will be lost when you close the page.");
  }
  for (const renderFn of renderers) renderFn();
}

// A short random id like "k3f9x2ab" for each member, expense and meal entry.
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function memberName(id) {
  const m = state.members.find((member) => member.id === id);
  return m ? m.name : "(removed)";
}

// 1234.5 → "1,234.50" (Indian grouping: 1,23,456.00)
function rupees(amount) {
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Today as "YYYY-MM-DD" in the student's own time zone.
function todayText() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "Clear all data" button.
document.getElementById("reset-all").addEventListener("click", () => {
  if (!confirm("Delete ALL members, expenses and meals from this browser?")) return;
  state = { members: [], expenses: [], meals: [] };
  save();
});
