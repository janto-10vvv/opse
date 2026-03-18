# Architecture Patterns

**Domain:** Procedural name generator module for a vanilla JS GM toolkit
**Researched:** 2026-03-18

## Recommended Architecture

`namegen.js` follows the identical structural contract as every other tool module in the codebase:

```
import { insertAtCursor, setStatus } from "./app.js";

// 1. Data — inline constants (culture definitions, word lists)
// 2. Engine — pure generation functions
// 3. Format — text formatters that produce insertable strings
// 4. Wire   — addEventListener calls that bind buttons to insertAtCursor()
```

No exports are required unless another module needs to call generation functions directly. `dice.js` and `deck.js` export because `tools.js` composes them. `namegen.js` is a leaf module and can be self-contained.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `namegen.js` — Data layer | Inline culture definitions: Markov transition tables, word combination lists | None (pure data) |
| `namegen.js` — Markov engine | `buildChain(tokens)`, `walkChain(chain, seed)` for people names | Data layer only |
| `namegen.js` — Combiner engine | `combine(parts[])` for places, guilds, items | Data layer only |
| `namegen.js` — Formatters | `generatePersonName(culture, variant)`, `generatePlaceName(type)`, `generateItemName(type)` | Markov engine, combiner engine |
| `namegen.js` — UI wiring | `addEventListener` on each button → `insertAtCursor(formatted result)` | `app.js` (insertAtCursor, setStatus) |
| `index.html` — Panel | `<details class="tool-section" id="section-namegen">` with culture select + type buttons | `namegen.js` (reads DOM elements) |
| `app.js` — Bootstrap | `import("./js/namegen.js")` added to existing `Promise.all` | `namegen.js` |

### Data Flow

```
User clicks button in #section-namegen
  → event listener in namegen.js reads <select> value for culture/type
  → formatter function called (e.g. generatePersonName("elf", "female"))
  → formatter calls Markov engine or combiner engine
  → engine selects from inline data
  → formatter builds string: "> Name: Aelindra"
  → insertAtCursor(string)
  → CodeMirror inserts at cursor
  → setStatus("Generated elf female name.")
```

---

## Module Structure: `namegen.js`

### Internal Organisation (top to bottom)

```
// ── Imports ─────────────────────────────────────────────────
import { insertAtCursor, setStatus } from "./app.js";

// ── Utility ─────────────────────────────────────────────────
function pick(arr)            // random element from array
function weightedPick(obj)    // pick key by weight value

// ── Markov engine ───────────────────────────────────────────
function buildChain(tokens)   // build bigram transition table from token array
function walkChain(chain, minLen, maxLen)  // generate one name string

// ── Combiner engine ─────────────────────────────────────────
function combine(...parts)    // pick one element from each parts array, join with space

// ── Culture data ────────────────────────────────────────────
// (see Data Organisation section below)
const CULTURES = { ... };
const PLACE_DATA = { ... };
const ITEM_DATA = { ... };
const GUILD_DATA = { ... };

// ── Generators ──────────────────────────────────────────────
function generatePersonName(culture, variant)  // returns formatted string
function generatePlaceName(type)               // returns formatted string
function generateItemName(type)                // returns formatted string
function generateGuildName()                   // returns formatted string

// ── Wire up buttons ─────────────────────────────────────────
// (reads #namegen-culture, #namegen-variant, calls insertAtCursor)
```

### Export Shape

`namegen.js` does not need to export anything for v1. It wires itself on import, exactly as `dice.js` and `customtables.js` do. If cross-module composition is needed later, export the generator functions:

```js
export { generatePersonName, generatePlaceName, generateItemName, generateGuildName };
```

---

## Data Organisation

### People Names — Markov Chain Approach

Each culture stores a compact pre-built transition table rather than a raw training corpus. The table is an object mapping bigrams (two-character pairs) to arrays of likely next characters. This removes any runtime training step and keeps the data small.

```js
const CULTURES = {
  human: {
    male: {
      chain: {
        "__": ["Al", "Ed", "Ro", "Wi", "Th", "Go", "Ha"],  // start tokens
        "Al": ["ex", "an", "fr", "be", "d"],
        "ed": ["ar", "ga", "r", "win"],
        // ... ~30-50 bigram entries per variant
      },
      minLen: 4,
      maxLen: 9,
    },
    female: { chain: { ... }, minLen: 4, maxLen: 9 },
    surname: { chain: { ... }, minLen: 5, maxLen: 11 },
  },
  elf: {
    // elves: single pool, no male/female distinction in lore
    any: { chain: { ... }, minLen: 6, maxLen: 12 },
    surname: { chain: { ... }, minLen: 7, maxLen: 13 },
  },
  dwarf: {
    male: { chain: { ... }, minLen: 4, maxLen: 9 },
    female: { chain: { ... }, minLen: 4, maxLen: 9 },
    clan: { chain: { ... }, minLen: 6, maxLen: 10 },
  },
  orc: {
    // orcs/goblins share one pool; no gendered variants
    any: { chain: { ... }, minLen: 3, maxLen: 8 },
  },
  beastkin: {
    // highly random — deliberately broad; one combined pool
    any: { chain: { ... }, minLen: 3, maxLen: 9 },
  },
};
```

**Key convention:** `"__"` is the reserved start-token key. `walkChain` always begins from `chain["__"]` and walks until it hits a terminal marker (e.g. `"."`) or reaches `maxLen`.

**Why pre-built tables instead of training at runtime:** The app has no build step. Training at load time from a large corpus adds latency and code complexity. A hand-curated transition table of ~40–60 entries per variant produces comparable quality output at zero runtime cost and is small enough to read and edit directly.

### Places, Items, Guilds — Word Combination Approach

Word lists are arrays of strings. The combiner picks one element from each supplied array and joins them. Pattern varies by type.

```js
const PLACE_DATA = {
  town: {
    prefix: ["Ash", "Black", "Bright", "Cold", "Dark", "Elder", "Far", "Gold", "Green", "High", ...],
    suffix: ["bridge", "brook", "burg", "dale", "fell", "ford", "gate", "haven", ...],
    // output: combine(prefix, suffix) → "Ashford", "Goldbridge"
  },
  building: {
    adjective: ["Ancient", "Broken", "Crumbling", "Gilded", "Hidden", ...],
    noun: ["Anvil", "Barrel", "Cauldron", "Crown", "Flask", "Hammer", ...],
    // output: "The " + combine(adjective, noun) → "The Gilded Cauldron"
  },
  geographic: {
    adjective: ["Black", "Blighted", "Crooked", "Dying", "Frost", "Shattered", "Sunken", ...],
    noun: ["Chasm", "Cliffs", "Crossing", "Falls", "Hollow", "Maw", "Mire", "Pass", "Peak", ...],
    // output: combine(adjective, noun) → "Frostmaw", "Shattered Pass"
  },
};

const ITEM_DATA = {
  weapon: {
    material: ["Ashwood", "Blackiron", "Bonewood", "Coldsteel", "Duskforged", ...],
    type: ["Axe", "Blade", "Bow", "Cleaver", "Dagger", "Hammer", "Spear", ...],
    // output: combine(material, type) → "Coldsteel Blade"
  },
  armour: {
    material: ["Boneplate", "Darkened", "Ironwoven", "Scorched", "Stormforged", ...],
    type: ["Breastplate", "Cuirass", "Gauntlets", "Greaves", "Helm", "Shield", ...],
    // output: combine(material, type) → "Ironwoven Breastplate"
  },
  potion: {
    adjective: ["Bitter", "Clouded", "Glowing", "Murky", "Rank", "Shimmering", "Thick", ...],
    noun: ["Draught", "Elixir", "Extract", "Philtre", "Tincture", "Vial", ...],
    // output: combine(adjective, noun) → "Glowing Elixir"
  },
};

const GUILD_DATA = {
  adjective: ["Amber", "Black", "Golden", "Iron", "Silver", "Scarlet", "Shattered", "Veiled", ...],
  noun: ["Anvil", "Arrow", "Blade", "Claw", "Coin", "Compass", "Crown", "Eye", "Fang", "Flame", ...],
  suffix: ["Brotherhood", "Circle", "Company", "Compact", "Consortium", "Guild", "Order", "Society", ...],
  // output: "The " + combine(adjective, noun) + " " + pick(suffix)
  //       → "The Iron Claw Brotherhood"
};
```

**Extensibility rule:** Adding a new culture means adding one key to `CULTURES`. Adding a new place or item type means adding one key to `PLACE_DATA` or `ITEM_DATA`. No structural changes to the engines are needed.

---

## UI Integration Points

### index.html — New Panel

The name generator panel follows the exact same `<details class="tool-section">` pattern used by Dice Roller, Generators, Custom Tables, and all other collapsible panels. Insert it before or after the Generators section (`#section-generators`).

```html
<!-- Name Generator -->
<details class="tool-section" id="section-namegen">
  <summary>📛 Name Generator</summary>
  <div class="tool-content">

    <p class="section-label">Person Name</p>
    <div class="namegen-controls">
      <select id="namegen-culture">
        <option value="human">Human</option>
        <option value="elf">Elf</option>
        <option value="dwarf">Dwarf</option>
        <option value="orc">Orc / Goblin</option>
        <option value="beastkin">Beastkin</option>
      </select>
      <select id="namegen-variant">
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="surname">Surname / Clan</option>
      </select>
    </div>
    <button id="btn-namegen-person" class="secondary">Generate Name</button>

    <p class="section-label">Place Name</p>
    <select id="namegen-place-type">
      <option value="town">Town / Village</option>
      <option value="building">Building / Location</option>
      <option value="geographic">Geographic Feature</option>
    </select>
    <button id="btn-namegen-place" class="secondary">Generate Place</button>

    <p class="section-label">Guild Name</p>
    <button id="btn-namegen-guild" class="secondary">Generate Guild</button>

    <p class="section-label">Item Name</p>
    <select id="namegen-item-type">
      <option value="weapon">Weapon</option>
      <option value="armour">Armour</option>
      <option value="potion">Potion</option>
    </select>
    <button id="btn-namegen-item" class="secondary">Generate Item</button>

  </div>
</details>
```

**Notes on the select controls:**
- `#namegen-variant` should update its options dynamically when the culture changes (elves and orcs have no male/female split). This is wired in `namegen.js` via a `change` listener on `#namegen-culture`.
- CSS classes (`namegen-controls`, `btn-row`) follow existing patterns in `style.css` and likely need no new CSS rules if the grid-style `.dice-custom` or flex-row patterns are reused.

### app.js — Bootstrap Registration

The single change to `app.js` is adding `namegen.js` to the existing `Promise.all` import block in the `DOMContentLoaded` handler:

```js
Promise.all([
  import("./dice.js"),
  import("./deck.js"),
  import("./tools.js"),
  import("./customtables.js"),
  import("./namegen.js"),   // add this line
]).catch((err) => {
  console.error("Tool module load error:", err);
  setStatus("Error loading tool modules — check console.");
});
```

No other changes to `app.js` are needed. `namegen.js` wires its own buttons on import.

### insertAtCursor Output Format

Follow the existing blockquote convention used by all other tools:

```
> **Name (Elf):** Aelindra Vaelthorn
> **Place (Town):** Ashford
> **Guild:** The Iron Claw Brotherhood
> **Item (Weapon):** Coldsteel Blade
```

---

## Patterns to Follow

### Pattern 1: Self-Wiring on Import
Every tool module in this codebase wires its own event listeners at module load time with no exported init function. `namegen.js` does the same — all `addEventListener` calls are at the top level of the module, not inside any exported function.

**Example (from dice.js):**
```js
document.querySelectorAll(".dice-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    insertRoll(1, parseInt(btn.dataset.sides, 10));
  });
});
```

### Pattern 2: Read DOM State at Click Time
UI state (select values, checkbox values) is read inside the click handler, not cached at module load. This avoids stale reference bugs. See `tools.js` — `oracle-likelihood` and `oracle-advantage` are read inside the click callback.

### Pattern 3: Format Strings Inside Generator Functions
Generator functions return a formatted string. The event listener calls `insertAtCursor(formattedString)`. This keeps generators testable in isolation (they have no side effects).

### Pattern 4: Variant Normalisation for Cultures Without Gender
When a culture does not distinguish male/female (elf, orc, beastkin), `generatePersonName` maps any incoming variant to `"any"`:

```js
function generatePersonName(culture, variant) {
  const cultureData = CULTURES[culture];
  const key = cultureData[variant] ? variant : "any";
  const pool = cultureData[key];
  // ...
}
```

This means the UI can always send `variant` from the select without checking culture first.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Data File
**What:** Putting culture data in `namegen-data.js` imported by `namegen.js`.
**Why bad:** Creates a second file to maintain, adds an import, and breaks the established convention that each tool is a single file. The data is compact enough to inline.
**Instead:** Keep all data in `namegen.js` as `const` declarations.

### Anti-Pattern 2: Training Markov Chains at Runtime
**What:** Storing raw name lists and calling a training function on `DOMContentLoaded`.
**Why bad:** Adds runtime CPU cost (negligible but unnecessary), and increases code complexity. Training output at startup is not cacheable without adding localStorage logic.
**Instead:** Pre-build the transition tables by hand or with a one-off offline script, then paste the output into the module as a literal object.

### Anti-Pattern 3: Exporting an init() Function
**What:** Wrapping all button wiring in `export function init(insertFn)` and calling it from `app.js`.
**Why bad:** No other module does this. `dice.js` and `customtables.js` wire themselves; `app.js` just imports them for side effects.
**Instead:** Wire at top level. Import in the `Promise.all` block.

### Anti-Pattern 4: Dynamic Select Population via JS
**What:** Populating the culture `<select>` from the `CULTURES` object at runtime.
**Why bad:** Over-engineering. The cultures are fixed (no user customisation). Static HTML options are simpler and immediately visible in the source.
**Instead:** Hard-code the `<option>` elements. Only the variant select needs dynamic update (hiding/showing surname vs male/female based on culture).

---

## Scalability Considerations

| Concern | Now (5 cultures) | Future (10+ cultures) |
|---------|------------------|-----------------------|
| Data size | Inline in namegen.js (~200-400 lines of data) | Still inline; each culture adds ~30-60 lines |
| Adding a culture | Add one key to `CULTURES`, add `<option>` to HTML | Same — no structural change |
| Adding a name type | Add one key to `PLACE_DATA`/`ITEM_DATA`, add button + select option | Same pattern |
| Markov quality | Varies by how carefully the table is curated | Independent per culture; one poor culture doesn't affect others |
| File size | Estimated 600-900 lines total for `namegen.js` | Scales linearly; stays manageable without a build step |

---

## Suggested Build Order

1. **Utility and engine functions first** (`pick`, `weightedPick`, `buildChain`, `walkChain`, `combine`) — these can be tested in isolation in the browser console before any UI exists.
2. **One culture end-to-end** — wire human male names fully (data + engine + formatter + button) to validate the full path from data to `insertAtCursor()`.
3. **Remaining person name cultures** — add elf, dwarf, orc, beastkin data; validate variant normalisation logic.
4. **Place name combiner** — add `PLACE_DATA` and `generatePlaceName`; add place section to HTML.
5. **Guild and item combiners** — simpler than places; add last.
6. **Variant select dynamism** — add the `change` listener on `#namegen-culture` to show/hide the appropriate variant options.

---

## Sources

- Direct inspection of `/home/janto/code/opse/js/app.js` — `insertAtCursor` signature, `Promise.all` import pattern (HIGH confidence)
- Direct inspection of `/home/janto/code/opse/js/dice.js`, `deck.js`, `customtables.js`, `tools.js` — self-wiring pattern, import contract, output format (HIGH confidence)
- Direct inspection of `/home/janto/code/opse/index.html` — `<details class="tool-section">` panel pattern, existing select/button layout (HIGH confidence)
- Markov chain bigram approach: standard well-established technique for procedural name generation; pre-built tables as an optimisation for no-build-step environments (MEDIUM confidence — pattern is well-established; specific token key convention `"__"` is a design decision, not drawn from external source)
