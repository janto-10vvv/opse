import { insertAtCursor, setStatus, loadSettings } from "./app.js";
import { roll, sum, d } from "./dice.js";
import { drawCard, cardLabel, cardLabelWithDomain, rankToIndex } from "./deck.js";
import {
  ACTION_FOCUS, DETAIL_FOCUS, TOPIC_FOCUS,
  NPC_IDENTITY, NPC_GOAL, NPC_NOTABLE_FEATURE,
  SCENE_COMPLICATION, ALTERED_SCENE,
  PACING_MOVES, FAILURE_MOVES,
  ORACLE_HOW,
  PLOT_OBJECTIVE, PLOT_ADVERSARY, PLOT_REWARD,
  DUNGEON_LOCATION, dungeonEncounter, dungeonObject, dungeonExits,
  hexTerrain, HEX_FEATURES,
} from "./tables.js";

// ── Focus table helpers ────────────────────────────────────

function drawFocus(table) {
  const { card, jokerTriggered } = drawCard();
  if (jokerTriggered) {
    triggerRandomEventAndInsert("Joker draw");
    return drawFocus(table); // draw the replacement card
  }
  const idx = rankToIndex(card.rank);
  return { result: table[idx], card };
}

function focusLine(label, table) {
  const { result, card } = drawFocus(table);
  return `**${label}:** ${result} — ${cardLabelWithDomain(card)}`;
}

// ── Oracle (Yes/No) ────────────────────────────────────────

function oracleYesNo(likelihood, advantage) {
  const thresholds = { likely: 3, even: 4, unlikely: 5 };
  const threshold = thresholds[likelihood] ?? 4;

  let answerDie, answerDisplay;
  if (advantage) {
    const [a, b] = roll(2, 6);
    answerDie = Math.max(a, b);
    answerDisplay = `best of ${a},${b} → ${answerDie}`;
  } else {
    answerDie = d(6);
    answerDisplay = String(answerDie);
  }

  const modDie = d(6);
  const yes    = answerDie >= threshold;
  const answer = yes ? "Yes" : "No";
  const mod    = modDie === 1 ? ", but…" : modDie === 6 ? ", and…" : "";
  const label  = likelihood.charAt(0).toUpperCase() + likelihood.slice(1);
  const advTag = advantage ? ", Advantage" : "";

  return `> **Oracle (${label}${advTag}):** ${answer}${mod} [answer: ${answerDisplay}, mod: ${modDie}]`;
}

// ── Oracle (How) ───────────────────────────────────────────

function oracleHow() {
  const r = d(6);
  return `> **How:** ${ORACLE_HOW[r - 1]} [${r}]`;
}

// ── Set the Scene ──────────────────────────────────────────

function setScene() {
  const r = d(6);
  const complication = SCENE_COMPLICATION[r - 1];
  if (r >= 5) {
    const r2 = d(6);
    return `> **Scene (Altered):** ${complication} → ${ALTERED_SCENE[r2 - 1]} [scene: ${r}, altered: ${r2}]`;
  }
  return `> **Scene:** ${complication} [${r}]`;
}

// ── GM Moves ───────────────────────────────────────────────

function gmMove(type) {
  const r = d(6);
  if (type === "pacing") {
    const result = PACING_MOVES[r - 1];
    let text = `> **Pacing Move:** ${result} [${r}]`;
    if (r === 6) {
      text += "\n" + buildRandomEvent("Pacing Move");
    }
    return text;
  }
  return `> **Failure Move:** ${FAILURE_MOVES[r - 1]} [${r}]`;
}

// ── Random Event ───────────────────────────────────────────

function buildRandomEvent(source) {
  const action = drawFocus(ACTION_FOCUS);
  const topic  = drawFocus(TOPIC_FOCUS);
  const sourceTag = source ? ` [from: ${source}]` : "";
  return (
    `> **Random Event:** ${action.result} — ${cardLabelWithDomain(action.card)}` +
    ` + ${topic.result} — ${cardLabelWithDomain(topic.card)}${sourceTag}`
  );
}

function triggerRandomEventAndInsert(source) {
  insertAtCursor(buildRandomEvent(source));
}

// ── Generators ─────────────────────────────────────────────

function genGeneric() {
  const action = drawFocus(ACTION_FOCUS);
  const detail = drawFocus(DETAIL_FOCUS);
  const how = d(6);
  return (
    `> **Generic Generator:**\n` +
    `> - Does: ${action.result} — ${cardLabelWithDomain(action.card)}\n` +
    `> - Looks: ${detail.result} — ${cardLabelWithDomain(detail.card)}\n` +
    `> - Significance: ${ORACLE_HOW[how - 1]} [${how}]`
  );
}

function genPlotHook() {
  const obj = d(6), adv = d(6), rew = d(6);
  return (
    `> **Plot Hook:**\n` +
    `> - Objective: ${PLOT_OBJECTIVE[obj - 1]} [${obj}]\n` +
    `> - Adversary: ${PLOT_ADVERSARY[adv - 1]} [${adv}]\n` +
    `> - Reward: ${PLOT_REWARD[rew - 1]} [${rew}]`
  );
}

function genNPC() {
  const identity    = drawFocus(NPC_IDENTITY);
  const goal        = drawFocus(NPC_GOAL);
  const featRoll    = d(6);
  const feat        = NPC_NOTABLE_FEATURE[featRoll - 1];
  const featDetail  = drawFocus(DETAIL_FOCUS);
  const how         = d(6);
  const convo       = drawFocus(TOPIC_FOCUS);
  return (
    `> **NPC:**\n` +
    `> - Identity: ${identity.result} — ${cardLabelWithDomain(identity.card)}\n` +
    `> - Goal: ${goal.result} — ${cardLabelWithDomain(goal.card)}\n` +
    `> - Feature: ${feat} (${featDetail.result} — ${cardLabelWithDomain(featDetail.card)}) [${featRoll}]\n` +
    `> - Attitude: ${ORACLE_HOW[how - 1]} [${how}]\n` +
    `> - Conversation: ${convo.result} — ${cardLabelWithDomain(convo.card)}`
  );
}

function genDungeonTheme() {
  const detail = drawFocus(DETAIL_FOCUS);
  const action = drawFocus(ACTION_FOCUS);
  return (
    `> **Dungeon Theme:**\n` +
    `> - Looks: ${detail.result} — ${cardLabelWithDomain(detail.card)}\n` +
    `> - Used as: ${action.result} — ${cardLabelWithDomain(action.card)}\n` +
    `> *(First area always has 3 exits.)*`
  );
}

function genDungeonArea() {
  const loc = d(6), enc = d(6), obj = d(6), ext = d(6);
  return (
    `> **Dungeon Area:**\n` +
    `> - Location: ${DUNGEON_LOCATION[loc - 1]} [${loc}]\n` +
    `> - Encounter: ${dungeonEncounter(enc)} [${enc}]\n` +
    `> - Object: ${dungeonObject(obj)} [${obj}]\n` +
    `> - Exits: ${dungeonExits(ext)} [${ext}]`
  );
}

function getHexTerrainLabel(roll) {
  const common   = document.getElementById("hex-common").value.trim()   || "Common terrain";
  const uncommon = document.getElementById("hex-uncommon").value.trim() || "Uncommon terrain";
  const rare     = document.getElementById("hex-rare").value.trim()     || "Rare terrain";
  if (roll <= 2) return "Same as current hex";
  if (roll <= 4) return common;
  if (roll === 5) return uncommon;
  return rare;
}

function genHex() {
  const ter  = d(6), cont = d(6), evt = d(6);
  let text =
    `> **Hex:**\n` +
    `> - Terrain: ${getHexTerrainLabel(ter)} [${ter}]\n`;
  if (cont === 6) {
    const feat = d(6);
    text += `> - Contents: Feature — ${HEX_FEATURES[feat - 1]} [contents: 6, feature: ${feat}]\n`;
  } else {
    text += `> - Contents: Nothing notable [${cont}]\n`;
  }
  if (evt >= 5) {
    text += `> - Event: Random Event triggered!\n`;
    text += buildRandomEvent("Hex Event") + "\n";
    text += `> *(Set the Scene for this hex)*`;
  } else {
    text += `> - Event: None [${evt}]`;
  }
  return text;
}

// ── Wire up buttons ────────────────────────────────────────

document.getElementById("btn-oracle-yn").addEventListener("click", () => {
  const likelihood = document.getElementById("oracle-likelihood").value;
  const advantage  = document.getElementById("oracle-advantage").checked;
  insertAtCursor(oracleYesNo(likelihood, advantage));
});

document.getElementById("btn-oracle-how").addEventListener("click", () => {
  insertAtCursor(oracleHow());
});

document.getElementById("btn-scene").addEventListener("click", () => {
  insertAtCursor(setScene());
});

document.getElementById("btn-pacing").addEventListener("click", () => {
  insertAtCursor(gmMove("pacing"));
});

document.getElementById("btn-failure").addEventListener("click", () => {
  insertAtCursor(gmMove("failure"));
});

document.getElementById("btn-random-event").addEventListener("click", () => {
  insertAtCursor(buildRandomEvent());
});

document.getElementById("btn-action-focus").addEventListener("click", () => {
  insertAtCursor(`> ${focusLine("Action Focus", ACTION_FOCUS)}`);
});

document.getElementById("btn-detail-focus").addEventListener("click", () => {
  insertAtCursor(`> ${focusLine("Detail Focus", DETAIL_FOCUS)}`);
});

document.getElementById("btn-topic-focus").addEventListener("click", () => {
  insertAtCursor(`> ${focusLine("Topic Focus", TOPIC_FOCUS)}`);
});

document.getElementById("btn-gen-generic").addEventListener("click", () => {
  insertAtCursor(genGeneric());
});

document.getElementById("btn-gen-plothook").addEventListener("click", () => {
  insertAtCursor(genPlotHook());
});

document.getElementById("btn-gen-npc").addEventListener("click", () => {
  insertAtCursor(genNPC());
});

document.getElementById("btn-dungeon-theme").addEventListener("click", () => {
  insertAtCursor(genDungeonTheme());
});

document.getElementById("btn-dungeon-area").addEventListener("click", () => {
  insertAtCursor(genDungeonArea());
});

document.getElementById("btn-gen-hex").addEventListener("click", () => {
  insertAtCursor(genHex());
});
