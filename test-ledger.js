// Run with:  node test-ledger.js
// Each check prints PASS or FAIL. Change the numbers and see what breaks.
const assert = require("assert");
const { monthSummary, settleUp, upiLink } = require("./ledger.js");

const state = {
    members: [
        { id: "r", name: "Ravi", upi: "ravi@okaxis" },
        { id: "l", name: "Lakshmi", upi: "lakshmi@ybl" },
        { id: "i", name: "Imran", upi: "" },
    ],
    expenses: [
        { id: "e1", date: "2026-10-02", payerId: "r", amount: 900, note: "Rice 25 kg" },
        { id: "e2", date: "2026-10-05", payerId: "l", amount: 300, note: "Vegetables" },
        { id: "e3", date: "2026-09-28", payerId: "i", amount: 500, note: "September — must be ignored" },
    ],
    meals: [
        { id: "m1", date: "2026-10-02", memberId: "r", count: 2 },
        { id: "m2", date: "2026-10-02", memberId: "l", count: 3 },
        { id: "m3", date: "2026-10-02", memberId: "i", count: 3 },
        { id: "m4", date: "2026-10-03", memberId: "i", count: 2 },
    ],
};

function check(name, fn) {
    try {
        fn();
        console.log("PASS", name);
    } catch (err) {
        console.log("FAIL", name, "→", err.message);
        process.exitCode = 1;
    }
}

const s = monthSummary(state, "2026-10");
const by = (name) => s.members.find((m) => m.name === name);

check("only October is counted", () => assert.strictEqual(s.totalSpent, 1200));
check("total meals", () => assert.strictEqual(s.totalMeals, 10));
check("cost per meal = 1200 / 10", () => assert.strictEqual(s.costPerMeal, 120));
check("Ravi: 2 meals → share 240, paid 900, gets back 660", () => assert.deepStrictEqual([by("Ravi").share, by("Ravi").balance], [240, 660]));
check("Lakshmi: 3 meals → share 360, owes 60", () => assert.strictEqual(by("Lakshmi").balance, -60));
check("Imran: 5 meals → share 600, owes 600", () => assert.strictEqual(by("Imran").balance, -600));

const t = settleUp(s.members);
check("two payments are enough", () => assert.strictEqual(t.length, 2));
check("Imran pays Ravi 600 first", () => assert.deepStrictEqual([t[0].from, t[0].to, t[0].amount], ["Imran", "Ravi", 600]));
check("after paying, everyone is at zero", () => {
    const left = {};
    for (const m of s.members) left[m.id] = m.balance;
    for (const x of t) {
        left[x.fromId] += x.amount;
        left[x.toId] -= x.amount;
    }
    for (const id in left) assert.ok(Math.abs(left[id]) < 0.01, `${id} still has ${left[id]}`);
});
check("UPI link", () =>
    assert.strictEqual(upiLink(t[0], "2026-10"), "upi://pay?pa=ravi@okaxis&pn=Ravi&am=600.00&cu=INR&tn=Mess%202026-10")
);
check("no meals → nobody owes", () => assert.strictEqual(settleUp(monthSummary(state, "2026-08").members).length, 0));
