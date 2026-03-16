import { insertAtCursor, setStatus } from "./app.js";

// ── Card definitions ───────────────────────────────────────

const SUITS = [
  { sym: "♣", name: "Clubs",    domain: "Physical"  },
  { sym: "♦", name: "Diamonds", domain: "Technical" },
  { sym: "♠", name: "Spades",   domain: "Mystical"  },
  { sym: "♥", name: "Hearts",   domain: "Social"    },
];

const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];

/** Map rank string to 0-based table index (A=12, 2=0 … K=11) */
export function rankToIndex(rank) {
  return RANKS.indexOf(rank);
}

// ── Build a fresh deck ─────────────────────────────────────

function buildDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  cards.push({ rank: "Joker", suit: { sym: "🃏", name: "Joker", domain: "" }, joker: true, color: "R" });
  cards.push({ rank: "Joker", suit: { sym: "🃏", name: "Joker", domain: "" }, joker: true, color: "B" });
  return cards;
}

// ── Fisher-Yates shuffle ───────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Deck state ─────────────────────────────────────────────

const LS_KEY = "opse_deck";

let drawPile = [];
let discard  = [];

function loadDeck() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved && Array.isArray(saved.drawPile) && saved.drawPile.length > 0) {
      drawPile = saved.drawPile;
      discard  = saved.discard || [];
      return;
    }
  } catch {/* fall through */}
  resetDeck();
}

function resetDeck() {
  drawPile = shuffle(buildDeck());
  discard  = [];
  persistDeck();
}

function persistDeck() {
  localStorage.setItem(LS_KEY, JSON.stringify({ drawPile, discard }));
  updateDeckUI();
}

function updateDeckUI() {
  const el = document.getElementById("deck-count");
  if (el) el.textContent = `🃏 Deck: ${drawPile.length} remaining`;
}

// ── Draw ───────────────────────────────────────────────────

/**
 * Draw one card. Returns { card, jokerTriggered }.
 * On Joker: reshuffles discard into draw pile, returns the Joker card,
 * and sets jokerTriggered = true.
 */
export function drawCard() {
  if (drawPile.length === 0) {
    // Full reshuffle if somehow empty
    resetDeck();
  }

  const card = drawPile.pop();
  discard.push(card);

  if (card.joker) {
    // Reshuffle discard (including this Joker) back into draw pile
    drawPile = shuffle([...drawPile, ...discard]);
    discard = [];
    persistDeck();
    return { card, jokerTriggered: true };
  }

  persistDeck();
  return { card, jokerTriggered: false };
}

/** Format a card as a display string: "7♠" or "Joker (Red)" */
export function cardLabel(card) {
  if (card.joker) return `Joker (${card.color === "R" ? "Red" : "Black"})`;
  return `${card.rank}${card.suit.sym}`;
}

/** Format card with domain: "7♠ (Mystical)" */
export function cardLabelWithDomain(card) {
  if (card.joker) return `Joker (${card.color === "R" ? "Red" : "Black"})`;
  return `${card.rank}${card.suit.sym} (${card.suit.domain})`;
}

// ── Draw button ────────────────────────────────────────────

document.getElementById("btn-draw").addEventListener("click", () => {
  const { card, jokerTriggered } = drawCard();

  if (jokerTriggered) {
    insertAtCursor(
      `> 🃏 Drew: ${cardLabel(card)} — Deck reshuffled! **Random Event triggered.**`
    );
  } else {
    insertAtCursor(
      `> 🃏 Drew: ${card.rank}${card.suit.sym} — ${card.suit.name} (${card.suit.domain})`
    );
  }
});

document.getElementById("btn-shuffle").addEventListener("click", () => {
  resetDeck();
  setStatus("Deck shuffled. 54 cards remaining.");
});

// ── Handle import event from app.js ───────────────────────
window.addEventListener("opse:deck-import", (e) => {
  drawPile = e.detail.drawPile || [];
  discard  = e.detail.discard  || [];
  persistDeck();
  setStatus("Deck state restored from import.");
});

// ── Init ───────────────────────────────────────────────────
loadDeck();
updateDeckUI();
