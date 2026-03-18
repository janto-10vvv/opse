# Technology Stack

**Project:** OPSE Name Generator
**Researched:** 2026-03-18

---

## Recommended Stack

This is a zero-dependency, no-build vanilla JS feature. There is no "stack" to choose in the library sense — the constraint is how to implement two generation algorithms compactly and correctly inside a single ES module.

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JS ES modules | ES2020+ | Name generation logic | Matches existing codebase exactly; no CDN dependency needed |
| `Math.random()` | built-in | Weighted random selection | Sufficient entropy; no crypto API needed for names |

### Algorithm 1: Markov Chain (People Names)

**Recommended approach: Order-2 character n-gram model with pre-computed transition tables.**

The model operates on pairs of characters (bigrams) as the state, not single characters. Order-1 (single char) produces incoherent output. Order-3 captures too much of the training data verbatim, producing near-copies rather than novel names. Order-2 is the sweet spot for 30-50 training name inputs.

**How it works:**

```
Training: "Arwen" → bigrams ["Ar","rw","we","en"]
          Map each bigram to what follows: {"Ar":["rw"], "rw":["we"], "we":["en"], "en":["#"]}
          "#" is the end-of-name sentinel.

Generation: Start from "#" (beginning), pick a random start bigram,
            then repeatedly pick the next bigram from the current state's followers,
            assemble characters, stop on "#".
```

**Pre-computed vs runtime training:**

Do NOT ship raw name lists and train at runtime. Ship the pre-computed transition table as a JS object literal. This:
- Removes the training loop from the browser entirely (zero runtime overhead)
- Compresses significantly better than name lists (shared keys, no repetition)
- Makes data size predictable and inspectable

**Transition table format:**

```js
// Compact representation: each key maps to a flat array of weighted followers.
// Repeats encode frequency: "el" appearing after "Th" 3 times → ["el","el","el"]
// This is the "bag of marbles" approach — uniform random pick, implicit weighting.
const humanMaleTable = {
  "#": ["Ar","Br","El","Ga","Th","Wi"],
  "Ar":["ag","an","on","th"],
  "Br":["an","en","ia","yn"],
  // ...
  "an":["#","ce","dr"],
};
```

**Why repeated-element arrays over frequency objects:**

A frequency map `{"an": {"#":3,"ce":1}}` requires a weighted-random-pick function. A flat array with repeats `["#","#","#","ce"]` needs only `arr[Math.floor(Math.random()*arr.length)]` — a one-liner. The array form is slightly larger in bytes but eliminates a 15-line utility function. For data sizes in scope here the tradeoff is correct.

**Training set size per culture:**

30-50 carefully curated names per variant (male/female/surname) is the target. Under 30 and the chain memorises too much; over 80 and the table grows faster than quality improves.

**Estimated table size per variant:**

| Training names | Unique bigrams | Table JSON size |
|---------------|----------------|-----------------|
| 30 names | ~60-90 keys | ~1.5 KB |
| 50 names | ~80-120 keys | ~2.5 KB |

With 5 cultures (Human M/F/Surname, Elf M/F, Dwarf M/F, Orc/Goblin M/F, Beastkin) = ~13 variants.

**Estimated total for all people-name tables: 20-35 KB unminified, 10-18 KB minified.**

This is well within acceptable inline JS. For comparison, a full English dictionary is ~1 MB; 35 KB is negligible.

**Beastkin special case:**

Beastkin names should be generated from a deliberately scrambled or cross-culture training set — high entropy, short names, unusual phoneme clusters. Do not hand-craft a "Beastkin phoneme set"; instead use a training set of onomatopoeic, animal-adjacent syllables (Rrakh, Grrn, Ssive, Nssari...). The same order-2 chain handles this correctly with an appropriate training corpus.

**Name length guard:**

Markov chains can loop. Add a hard cap of 12 characters and a floor of 3. If a generated name is shorter than 3 characters, regenerate (retry up to 5 times). Do not loop indefinitely.

**Capitalisation:**

Apply `name[0].toUpperCase() + name.slice(1).toLowerCase()` after generation. Do NOT bake capitalisation into the table keys — it doubles the state space for no benefit.

---

### Algorithm 2: Word Combination (Places, Guilds, Items)

**Recommended approach: Flat weighted word lists per slot, assembled by pattern.**

Each name type is a pattern of 1-3 slots, each slot pulling from a small curated word list. This is simpler and more compact than Markov for these use cases because place and item names benefit from recognisable word-roots (Blackwater Mill, Sword of the Fallen, etc.) rather than phoneme-level generation.

**Pattern definition format:**

```js
// Each pattern is an array of slot-references.
// Each slot is a flat array (no weighting needed; all equally likely).
const PLACE_PATTERNS = {
  town: [
    ["Black","Red","Silver","Storm","Frost"], // prefix
    ["water","haven","forge","vale","moor"],  // suffix
  ],
  geographic: [
    ["The"],
    ["Shattered","Sunken","Lost","Iron","Grey"],
    ["Peak","Mere","Reach","Fens","Gorge"],
  ],
};

function combineName(slots) {
  return slots.map(list => list[Math.floor(Math.random() * list.length)]).join("");
}
```

**Spacing and separators:**

Some name types join with a space ("Storm Haven"), some concatenate ("Stormhaven"), some use "of the" patterns ("Sword of the Fallen"). Encode this in the pattern, not as post-processing. A pattern is just an array of arrays; literal string entries like `" of the "` are valid slot values.

**Data size for word-combination lists:**

| Category | Variants | Estimated size |
|----------|----------|---------------|
| Towns/villages | 2 slots × ~15 words | 0.5 KB |
| Buildings/locations | 2-3 slots × ~12 words | 0.8 KB |
| Geographic features | 3 slots × ~12 words | 0.7 KB |
| Guild names | 2-3 slots × ~15 words | 0.7 KB |
| Weapons | 3 slots × ~15 words | 0.8 KB |
| Armour | 2-3 slots × ~12 words | 0.7 KB |
| Potions | 2-3 slots × ~10 words | 0.6 KB |

**Estimated total for all word-combination data: 5-8 KB unminified.**

---

### Module Structure

New file: `js/namegen.js`

```js
import { insertAtCursor, setStatus } from "./app.js";

// --- Data (inline) ---
const PEOPLE = { /* transition tables */ };
const PLACES = { /* word list patterns */ };
const ITEMS  = { /* word list patterns */ };

// --- Markov engine (order-2 bigram) ---
function markovName(table) { /* ... */ }

// --- Combination engine ---
function combineName(slots) { /* ... */ }

// --- Public generators ---
export function generatePersonName(culture, variant) { /* ... */ }
export function generatePlaceName(type)              { /* ... */ }
export function generateItemName(type)               { /* ... */ }

// --- UI wiring ---
document.querySelectorAll(".namegen-btn").forEach(btn => { /* ... */ });
```

The entire feature lives in one file. Data and logic colocated, no external imports beyond `app.js`.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Markov order | Order-2 bigram | Order-1 (single char) | Too incoherent; vowel/consonant patterns collapse |
| Markov order | Order-2 bigram | Order-3 trigram | Tables grow ~3× larger; output too closely copies training data; no novel names |
| Markov order | Order-2 bigram | Order-2 phoneme (syllable-unit) | Needs a syllable segmenter; significant added complexity for marginal quality gain |
| Weight encoding | Repeated-element arrays | Frequency count object + weighted-random fn | Frequency objects require a non-trivial sampling function; repeated arrays need only `Math.random()` |
| Training approach | Pre-computed table baked into JS | Raw name list + runtime training | Runtime training is wasted work on every page load; raw lists are larger and leak the training corpus; pre-computed is inspectable |
| Place/item generation | Word combination patterns | Markov on place names | Place names need recognisable word-roots for flavour; phoneme-level generation produces gibberish for places |
| Data location | Inline in `namegen.js` | Separate `namegen-data.js` file | One extra file with no benefit at this scale; inline keeps the module self-contained |
| Randomness | `Math.random()` | `crypto.getRandomValues()` | Cryptographic quality unnecessary for names; `Math.random()` is simpler and universally available |

---

## Implementation Notes

### What NOT to do

**Do NOT ship raw name lists and train at runtime.**
Even 50 names per culture × 13 variants = 650 strings that must be processed on every module load. Pre-compute the tables during development (a one-time offline step) and commit only the tables.

**Do NOT use a third-party name generation library.**
Libraries exist (e.g. `fantasy-name-generator`, `random-name-gen`) but they require npm, a build step, or are large (fantasy-name-generator is ~200 KB). The algorithm is ~25 lines of JS; there is nothing to gain from a dependency.

**Do NOT use a phoneme/syllable approach for Markov.**
Syllable-based Markov chains require a syllabifier (non-trivial) or a hand-built phoneme table. Character-level bigram chains on curated training names produce phonetically plausible output without any linguistic machinery.

**Do NOT make the word-combination patterns too long.**
3 slots maximum. 4-slot place names ("The Dark Sunken Iron Reach") are unwieldy. The generator's job is to suggest, not to narrate.

**Do NOT mix Markov and word-combination in the same generator.**
They are different quality tools for different jobs. People names benefit from phonetic plausibility (Markov). Place/item names benefit from recognisable semantic components (combination). Mixing them for a single output type produces worse results than either alone.

### Data curation matters more than algorithm sophistication

The output quality is almost entirely determined by the training data, not the algorithm. 30 well-chosen, phonetically consistent training names for Elves will produce better output than 200 scraped fantasy names of mixed style. Spend effort on curation.

### Seeding is not needed

`Math.random()` is not seeded in browsers and produces different sequences per page load. This is the desired behaviour for a name generator — reproducible results would require saving the seed to localStorage, which is out of scope.

---

## Data Size Summary

| Component | Unminified | Minified (est.) |
|-----------|-----------|-----------------|
| Markov tables (all people) | ~30 KB | ~15 KB |
| Word combination lists (all places/items) | ~8 KB | ~4 KB |
| Markov engine code | ~0.5 KB | ~0.3 KB |
| Combination engine code | ~0.2 KB | ~0.1 KB |
| UI wiring code | ~0.5 KB | ~0.3 KB |
| **Total `namegen.js`** | **~39 KB** | **~20 KB** |

For a static GitHub Pages app served over HTTPS, 39 KB of unminified JS is insignificant. The existing `tables.js` for reference tables is the right mental benchmark: moderate-sized, human-readable data baked directly into JS.

---

## Sources

- Algorithm design: order-2 character Markov chains for procedural name generation is the established baseline in game development tooling (HIGH confidence — this approach appears in multiple game dev texts and is directly implementable from first principles)
- Repeated-element array weighting: standard "alias method lite" pattern for small discrete distributions in client-side JS (HIGH confidence — basic probability technique)
- Data size estimates: derived from the structure of order-2 bigram tables over 30-50 training items (HIGH confidence — deterministic calculation)
- Module pattern: derived from reading `dice.js` and `customtables.js` directly (HIGH confidence — primary source)
