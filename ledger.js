// ledger.js — the maths of the mess. No page code here, so Node can test it too.
// Money is counted in PAISE (whole numbers) inside, because 0.1 + 0.2 is not exactly 0.3
// in JavaScript, but 10 + 20 is always exactly 30.

function toPaise(rupees) {
    return Math.round(rupees * 100);
}

// month is "YYYY-MM", e.g. "2026-10". Returns totals and one row per member.
function monthSummary(state, month) {
    const inMonth = (entry) => entry.date.startsWith(month + "-");
    const expenses = state.expenses.filter(inMonth);
    const meals = state.meals.filter(inMonth);

    const totalPaise = expenses.reduce((sum, e) => sum + toPaise(e.amount), 0);
    const totalMeals = meals.reduce((sum, m) => sum + m.count, 0);

    const members = state.members.map((member) => {
        const mealCount = meals.filter((m) => m.memberId === member.id).reduce((sum, m) => sum + m.count, 0);
        const paidPaise = expenses.filter((e) => e.payerId === member.id).reduce((sum, e) => sum + toPaise(e.amount), 0);
        // Your share = your meals × (total spent ÷ total meals), rounded to the nearest paisa.
        const sharePaise = totalMeals === 0 ? 0 : Math.round((mealCount * totalPaise) / totalMeals);
        return {
            id: member.id,
            name: member.name,
            upi: member.upi,
            meals: mealCount,
            paid: paidPaise / 100,
            share: sharePaise / 100,
            balance: (paidPaise - sharePaise) / 100, // + means the mess owes you, − means you owe
        };
    });

    const eaters = members.filter((m) => m.meals > 0).length;
    return {
        month,
        totalSpent: totalPaise / 100,
        totalMeals,
        costPerMeal: totalMeals === 0 ? 0 : Math.round(totalPaise / totalMeals) / 100,
        perHead: eaters === 0 ? 0 : Math.round(totalPaise / eaters) / 100,
        members,
    };
}

// Who pays whom, with few payments: the biggest debtor pays the biggest creditor, again and again.
function settleUp(members) {
    const biggestFirst = (a, b) => b.left - a.left || a.name.localeCompare(b.name);
    const debtors = members.filter((m) => m.balance < 0).map((m) => ({ ...m, left: toPaise(-m.balance) })).sort(biggestFirst);
    const creditors = members.filter((m) => m.balance > 0).map((m) => ({ ...m, left: toPaise(m.balance) })).sort(biggestFirst);

    const transfers = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const pay = Math.min(debtor.left, creditor.left);
        transfers.push({ fromId: debtor.id, from: debtor.name, toId: creditor.id, to: creditor.name, toUpi: creditor.upi, amount: pay / 100 });
        debtor.left -= pay;
        creditor.left -= pay;
        if (debtor.left === 0) i++; // this person has paid everything they owe
        if (creditor.left === 0) j++; // this person has got everything back
    }
    return transfers;
}

// A UPI payment link. Phone UPI apps (GPay, PhonePe, Paytm, BHIM) open it with the amount filled in.
function upiLink(transfer, month) {
    return (
        `upi://pay?pa=${transfer.toUpi}` +
        `&pn=${encodeURIComponent(transfer.to)}` +
        `&am=${transfer.amount.toFixed(2)}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent("Mess " + month)}`
    );
}

// Lets Node load this file for tests. In the browser `module` doesn't exist, so this is skipped.
if (typeof module !== "undefined") {
    module.exports = { toPaise, monthSummary, settleUp, upiLink };
}
