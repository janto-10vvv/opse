// ── Focus Tables (card rank → entry, index matches RANKS array) ──
// RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"]
//          0    1    2    3    4    5    6    7    8    9   10   11  12

export const ACTION_FOCUS = [
  "Seek", "Oppose", "Communicate", "Move", "Harm",
  "Create", "Reveal", "Command", "Take", "Protect",
  "Assist", "Transform", "Deceive",
];

export const DETAIL_FOCUS = [
  "Small", "Large", "Old", "New", "Mundane",
  "Simple", "Complex", "Unsavoury", "Specialised", "Unexpected",
  "Exotic", "Dignified", "Unique",
];

export const TOPIC_FOCUS = [
  "Current Need", "Allies", "Community", "History", "Future Plans",
  "Enemies", "Knowledge", "Rumours", "A Plot Arc", "Recent Events",
  "Equipment", "A Faction", "The PCs",
];

// ── NPC tables ─────────────────────────────────────────────

export const NPC_IDENTITY = [
  "Outlaw", "Drifter", "Tradesman", "Commoner", "Soldier",
  "Merchant", "Specialist", "Entertainer", "Adherent", "Leader",
  "Mystic", "Adventurer", "Lord",
];

export const NPC_GOAL = [
  "Obtain", "Learn", "Harm", "Restore", "Find",
  "Travel", "Protect", "Enrich Self", "Avenge", "Fulfil Duty",
  "Escape", "Create", "Serve",
];

export const NPC_NOTABLE_FEATURE = [
  "Unremarkable",
  "Notable nature",
  "Obvious physical trait",
  "Quirk or mannerism",
  "Unusual equipment",
  "Unexpected age or origin",
];

// ── Scene Complication ─────────────────────────────────────

export const SCENE_COMPLICATION = [
  "Hostile forces oppose you",
  "An obstacle blocks your way",
  "Wouldn't it suck if…",
  "An NPC acts suddenly",
  "All is not as it seems",
  "Things actually go as planned",
];

export const ALTERED_SCENE = [
  "A major detail of the scene is enhanced or somehow worse",
  "The environment is different",
  "Unexpected NPCs are present",
  "Add a Scene Complication",
  "Add a Pacing Move",
  "Add a Random Event",
];

// ── GM Moves ───────────────────────────────────────────────

export const PACING_MOVES = [
  "Foreshadow Trouble",
  "Reveal a New Detail",
  "An NPC Takes Action",
  "Advance a Threat",
  "Advance a Plot",
  "Add a Random Event to the scene",
];

export const FAILURE_MOVES = [
  "Cause Harm",
  "Put Someone in a Spot",
  "Offer a Choice",
  "Advance a Threat",
  "Reveal an Unwelcome Truth",
  "Foreshadow Trouble",
];

// ── Oracle (How) ───────────────────────────────────────────

export const ORACLE_HOW = [
  "Surprisingly lacking",   // 1
  "Less than expected",     // 2
  "About average",          // 3
  "About average",          // 4
  "More than expected",     // 5
  "Extraordinary",          // 6
];

// ── Plot Hook ──────────────────────────────────────────────

export const PLOT_OBJECTIVE = [
  "Eliminate a threat",
  "Learn the truth",
  "Recover something valuable",
  "Escort or deliver to safety",
  "Restore something broken",
  "Save an ally in peril",
];

export const PLOT_ADVERSARY = [
  "A powerful organisation",
  "Outlaws",
  "Guardians",
  "Local inhabitants",
  "Enemy horde or force",
  "A new or recurring villain",
];

export const PLOT_REWARD = [
  "Money or valuables",
  "Money or valuables",
  "Knowledge and secrets",
  "Support of an ally",
  "Advance a plot arc",
  "A unique item of power",
];

// ── Dungeon Crawler ────────────────────────────────────────

export const DUNGEON_LOCATION = [
  "Typical area",
  "Transitional area",
  "Living area or meeting place",
  "Working or utility area",
  "Area with a special feature",
  "Location for a specialised purpose",
];

// d6 → result (1-indexed), grouped:
export function dungeonEncounter(roll) {
  if (roll <= 2) return "None";
  if (roll <= 4) return "Hostile enemies";
  if (roll === 5) return "An obstacle blocks the way";
  return "Unique NPC or adversary";
}

export function dungeonObject(roll) {
  if (roll <= 2) return "Nothing, or mundane objects";
  if (roll === 3) return "An interesting item or clue";
  if (roll === 4) return "A useful tool, key, or device";
  if (roll === 5) return "Something valuable";
  return "Rare or special item";
}

export function dungeonExits(roll) {
  if (roll <= 2) return "Dead end (no additional exits)";
  if (roll <= 4) return "1 additional exit";
  return "2 additional exits";
}

// ── Hex Crawler ────────────────────────────────────────────

export function hexTerrain(roll) {
  if (roll <= 2) return "Same as current hex";
  if (roll <= 4) return "Common terrain";
  if (roll === 5) return "Uncommon terrain";
  return "Rare terrain";
}

export const HEX_FEATURES = [
  "Notable structure",
  "Dangerous hazard",
  "A settlement",
  "Strange natural feature",
  "New region (set new terrain types)",
  "Dungeon Crawler entrance",
];
