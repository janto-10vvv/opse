import { insertAtCursor, setStatus } from "./app.js";

// ── Core dice functions ────────────────────────────────────

/** Roll n dice each with `sides` faces. Returns array of results. */
export function roll(n, sides) {
  const results = [];
  for (let i = 0; i < n; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  return results;
}

/** Sum an array of numbers. */
export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

/** Roll a single dN. */
export function d(sides) {
  return roll(1, sides)[0];
}

// ── Insert helpers ─────────────────────────────────────────

function insertRoll(n, sides) {
  const results = roll(n, sides);
  const total = sum(results);
  const text = `> 🎲 ${n}d${sides}: [${results.join(", ")}] = ${total}`;
  insertAtCursor(text);
}

// ── Wire up dice buttons ───────────────────────────────────

document.querySelectorAll(".dice-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    insertRoll(1, parseInt(btn.dataset.sides, 10));
  });
});

document.getElementById("btn-roll-custom").addEventListener("click", () => {
  const n = Math.max(1, Math.min(20, parseInt(document.getElementById("dice-count").value, 10) || 1));
  const sides = Math.max(2, Math.min(100, parseInt(document.getElementById("dice-sides").value, 10) || 6));
  insertRoll(n, sides);
});
