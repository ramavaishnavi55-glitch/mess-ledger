// members.js — add mess members and show them.

const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/; // like ravi.k@okaxis or 9848012345@ybl

document.getElementById("member-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  const nameInput = document.getElementById("member-name");
  const upiInput = document.getElementById("member-upi");
  const error = document.getElementById("member-error");
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const upi = upiInput.value.trim();

  if (name.length < 1 || name.length > 30) {
    error.textContent = "Name must be 1 to 30 characters.";
    return;
  }
  if (state.members.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
    error.textContent = `${name} is already a member.`;
    return;
  }
  if (upi !== "" && !UPI_RE.test(upi)) {
    error.textContent = "UPI id looks wrong. It should look like name@bank (e.g. ravi@okaxis).";
    return;
  }

  error.textContent = "";
  state.members.push({ id: uid(), name, upi });
  save();
  nameInput.value = "";
  upiInput.value = "";
  nameInput.focus();
});

function renderMembers() {
  const list = document.getElementById("member-list");
  list.innerHTML = "";
  for (const m of state.members) {
    const li = document.createElement("li");
    li.dataset.testid = "member-row";
    li.dataset.name = m.name;
    li.textContent = m.upi ? `${m.name} · ${m.upi}` : `${m.name} · no UPI id yet`;
    list.appendChild(li);
  }
  document.getElementById("member-count").textContent = state.members.length;

  // Keep the "Paid by" dropdown in step with the members list.
  const payer = document.getElementById("expense-payer");
  const chosen = payer.value;
  payer.innerHTML = "";
  for (const m of state.members) payer.add(new Option(m.name, m.id));
  if (chosen) payer.value = chosen;
}

onChange(renderMembers);
