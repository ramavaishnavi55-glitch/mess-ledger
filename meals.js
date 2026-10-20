// meals.js — how many meals (0 to 3) each member ate on a day.
// Saving a day REPLACES that day's counts, so a day is never counted twice.

const mealDate = document.getElementById("meal-date");
mealDate.value = todayText();
mealDate.addEventListener("change", renderMealGrid);

function renderMealGrid() {
  const grid = document.getElementById("meal-grid");
  grid.innerHTML = "";
  for (const m of state.members) {
    const saved = state.meals.find((x) => x.date === mealDate.value && x.memberId === m.id);
    const label = document.createElement("label");
    label.textContent = m.name;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "3";
    input.step = "1";
    input.value = saved ? saved.count : 0;
    input.dataset.testid = "meal-count";
    input.dataset.member = m.name;
    input.dataset.memberId = m.id;
    label.appendChild(input);
    grid.appendChild(label);
  }
}

document.getElementById("meal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const error = document.getElementById("meal-error");
  const date = mealDate.value;
  if (!date) {
    error.textContent = "Pick a date.";
    return;
  }
  const inputs = document.querySelectorAll('[data-testid="meal-count"]');
  const entries = [];
  for (const input of inputs) {
    const count = Number(input.value);
    if (!Number.isInteger(count) || count < 0 || count > 3) {
      error.textContent = `${input.dataset.member}: meals must be a whole number from 0 to 3.`;
      return;
    }
    if (count > 0) entries.push({ id: uid(), date, memberId: input.dataset.memberId, count });
  }
  error.textContent = "";
  // Remove this day's old counts, then add the new ones.
  state.meals = state.meals.filter((x) => x.date !== date).concat(entries);
  save();
  document.getElementById("meal-saved").textContent = `Saved meals for ${date}.`;
});

onChange(renderMealGrid);
