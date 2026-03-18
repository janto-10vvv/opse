# Project Research Summary

**Project:** OPSE Name Generator
**Domain:** Procedural fantasy name generation for a vanilla JS GM toolkit
**Researched:** 2026-03-18
**Confidence:** HIGH

## Executive Summary

The OPSE name generator is a single self-contained ES module (`js/namegen.js`) that adds procedural name generation to an existing no-dependency, no-build-step GM toolkit. The recommended approach uses two complementary algorithms: an order-1 bigram Markov chain for people names (Human M/F/Surname, Elf, Dwarf, Orc/Goblin, Beastkin) and a word-combination pattern engine for places, guilds, and items. The critical design decision is to ship pre-computed Markov transition tables — not raw training name lists — baked directly as JS object literals. This eliminates runtime training cost, keeps the module compact (target: under 35 KB unminified), and matches the established data-inline pattern of the existing codebase.

The recommended Markov order is order-1 (single character states), not order-2, because each culture variant only has 80-120 training names. Order-2 chains on small corpora memorise source names rather than generate novel ones; order-1 is more generative at this data scale. Each culture must have phonologically distinct training data curated before the generator is written — cultural distinctiveness is almost entirely a data problem, not an algorithm problem. The word-combination engine for places and items uses semantically grouped word lists (terrain adjectives with terrain nouns, settlement prefixes with settlement suffixes) assembled by 2-4 pattern templates per name type, preventing nonsense pairings.

The primary risks are data quality (undertrained Markov chains that memorise source names, culturally indistinguishable outputs, semantically incoherent word combinations) and implementation safety (infinite loop on length-filter rejection, missing start/end sentinels). Both are addressed by front-loading data curation, testing chain output before any UI work, and adding a mandatory iteration cap to every generation loop. The module integrates identically to all existing tools: self-wiring on import, `insertAtCursor()` for output, and registration via the existing `Promise.all` block in `app.js`.

---

## Key Findings

### Recommended Stack

The feature requires no new dependencies. It is pure vanilla JS ES modules, consistent with the existing codebase. The only "stack decision" is which algorithms to implement.

**Core technologies:**
- Vanilla JS ES2020 modules: name generation logic — matches codebase exactly, zero CDN dependency
- `Math.random()` (built-in): weighted random selection — cryptographic entropy is unnecessary for name generation
- Order-1 bigram Markov chains: people names — generative at small corpus sizes (80-120 names per variant)
- Word-combination pattern engine: places, guilds, items — produces semantically coherent results from curated word lists
- Pre-computed transition tables (JS object literals): Markov data — eliminates runtime training, smaller than raw name arrays

See `.planning/research/STACK.md` for full algorithm specification, data format examples, and size estimates.

### Expected Features

All features defined in PROJECT.md fall within v1 scope. Nothing should be deferred — the feature set is already minimal and well-bounded.

**Must have (table stakes):**
- Per-race/culture name generation (Human M/F/Surname, Elf, Dwarf, Orc/Goblin, Beastkin) — the core value proposition
- Single-click generation with insert at cursor — matches existing tool UX; any friction breaks GM flow
- Phonemically distinct outputs per culture — distinctiveness is the entire point; generic fantasy phonemes fail this
- Place name generation (town, building, geographic feature) — second most frequent GM session-prep need
- Item name generation (weapon, armour, potion) — constant need during loot scenes
- Guild/faction name generation — session-prep staple; same engine as places, low incremental cost
- Pronounceable output — gibberish immediately destroys trust in the tool

**Should have (differentiators):**
- Beastkin as a genuinely broad/wild category blending multiple archetypes — most generators treat this as one beast type
- Compound place names with grammatical sense (semantically screened word-list pairs)
- Item names with material + form structure (not generic adjective + noun)
- Orc and Goblin sharing one blended pool (phoneme roots overlap in canonical sources)
- Gender-neutral naming for non-human races — matches lore conventions; Human is the explicit exception

**Defer (v2+):**
- Beastkin sub-type selection (feline/canine/reptile) — blended pool approach is the v1 strategy
- User-defined cultures or phoneme sets — explicit anti-feature per PROJECT.md
- Name history/favourites panel — the document is the history
- Batch generation — single-click re-generation is sufficient
- Name meaning/etymology display — impractical with Markov-generated output

See `.planning/research/FEATURES.md` for full per-culture phoneme conventions and word pool definitions.

### Architecture Approach

`namegen.js` follows the identical structural contract as every other tool module: import `insertAtCursor` and `setStatus` from `app.js`, define data as inline constants, implement pure engine functions, wire event listeners at the top level of the module (no exported init function), and register via the existing `Promise.all` import block. One file, self-contained.

**Major components (all within `namegen.js`):**
1. Data layer — inline `CULTURES`, `PLACE_DATA`, `ITEM_DATA`, `GUILD_DATA` constants (pre-computed Markov tables + word lists)
2. Markov engine — `pick(arr)`, `buildChain(tokens)`, `walkChain(chain, minLen, maxLen)` — pure functions, testable in isolation
3. Combiner engine — `combine(...parts)` — picks one element from each slot array, joins with space or separator
4. Formatter functions — `generatePersonName(culture, variant)`, `generatePlaceName(type)`, `generateItemName(type)`, `generateGuildName()` — return formatted strings, no side effects
5. UI wiring — `addEventListener` calls that read DOM state at click time and call `insertAtCursor(formattedString)`
6. `index.html` panel — `<details class="tool-section" id="section-namegen">` with two `<select>` controls and four generate buttons

The one structural divergence from other tools: the variant `<select>` (`#namegen-variant`) needs a `change` listener on `#namegen-culture` to show/hide appropriate options when a culture with no gender distinction is selected. This is the only dynamic DOM manipulation required.

See `.planning/research/ARCHITECTURE.md` for complete module structure, data format examples, and full HTML panel markup.

### Critical Pitfalls

1. **Order-2 Markov on small corpus memorises training names** — Use order-1 chains; target 80-120 names per variant; audit: if fewer than 30 unique names in 50 generates, corpus is too small or order is too high.
2. **Missing start/end sentinels produce unpronounceable fragments** — Prepend `^` and append `$` to every training name; start generation only from `^`-prefixed states; add length guard (min 3, max 14 chars) and regenerate on reject.
3. **Infinite loop on length-filter rejection** — Every generation loop must have a hard cap of 100 iterations with a hardcoded fallback name on cap hit; never return empty string or `undefined`.
4. **Word-combination names produce nonsense pairings** — Organise word lists by semantic domain, not part-of-speech; use 2-4 pattern templates per name type; test: if more than 1-in-5 manual results feel wrong, redesign the word lists.
5. **Training data size creep** — Store pre-computed transition tables only (not raw name arrays); hard budget of 35 KB unminified for the entire module; cap word lists at 30-50 entries per component.

See `.planning/research/PITFALLS.md` for the full 11-pitfall catalogue with detection warning signs per phase.

---

## Implications for Roadmap

### Phase 1: Data Curation and Markov Table Pre-computation

**Rationale:** Data quality determines output quality almost entirely. Building the generator before the data is curated results in a working but low-quality feature that requires revisiting all training sets. Front-loading curation avoids rework. This phase has no code dependencies; it can proceed in parallel with any other tooling setup.

**Delivers:** Pre-computed Markov transition tables for all 5 cultures (Human M/F/Surname, Elf, Dwarf, Orc/Goblin, Beastkin) ready to paste into the module; word lists for all place, item, and guild types; documented phonological rules per culture.

**Addresses:** Per-race name generation, phonemically distinct cultures, pronounceable output.

**Avoids:** Pitfall 1 (memorisation from small corpus), Pitfall 5 (culturally indistinguishable data), Pitfall 3 (size creep by computing tables from curated-not-bloated corpora).

**Research flag:** Needs care but no additional automated research — the phonological conventions per culture are well-documented in FEATURES.md. The work is manual curation and testing.

---

### Phase 2: Core Markov Engine and Human Names End-to-End

**Rationale:** Validate the full data-to-cursor pipeline with the highest-priority category before adding remaining cultures. Human names are the most frequently needed and have the clearest phoneme profile — an ideal canary. All engine functions can be tested in the browser console before any UI is connected.

**Delivers:** Working `namegen.js` with `pick`, `buildChain`, `walkChain`, `combine` engines; Human M/F/Surname generation; panel section in `index.html`; `app.js` registration; plain-text `insertAtCursor` output.

**Uses:** Vanilla JS ES modules, `Math.random()`, pre-computed Markov tables from Phase 1.

**Implements:** Markov engine component, formatter functions, UI wiring pattern, variant select dynamism.

**Avoids:** Pitfall 2 (sentinels), Pitfall 7 (infinite loop with iteration cap), Pitfall 11 (plain text insert, not markdown blockquote), Pitfall 6 (UI pattern audit against existing panels before building).

---

### Phase 3: Remaining People Name Cultures

**Rationale:** Once the engine and UI wiring are validated with Human names, adding Elf, Dwarf, Orc/Goblin, and Beastkin is additive data work with no structural changes. Variant normalisation (`any` fallback for cultures without gender) is wired in Phase 2; Phase 3 simply populates more data keys.

**Delivers:** Full people name generation across all 5 cultures; variant select correctly shows/hides Surname vs Male/Female based on culture.

**Addresses:** Elf, Dwarf, Orc/Goblin, Beastkin table stakes and all differentiators related to cultural distinctiveness.

**Avoids:** Pitfall 5 (verify cross-culture distinguishability before shipping — generate 5 unlabelled names per culture and confirm they sort correctly).

---

### Phase 4: Place, Guild, and Item Name Generation

**Rationale:** The word-combination engine is simpler than Markov and has no dependency on Phase 3 data. It can be built in one pass after the UI pattern is established. All three categories (places, guilds, items) use the same `combine()` engine; adding all three in one phase is efficient.

**Delivers:** Place name generation (town, building, geographic); guild name generation; item name generation (weapon, armour, potion); expanded `index.html` panel sections; `PLACE_DATA`, `ITEM_DATA`, `GUILD_DATA` constants.

**Addresses:** All place/guild/item table stakes features; item material+form differentiator; grammatically coherent compound place names.

**Avoids:** Pitfall 4 (semantically grouped word lists, 2-4 pattern templates per type), Pitfall 10 (minimum 40 entries per word list component to reduce collision rate).

---

### Phase 5: Quality Polish and Deduplication

**Rationale:** A per-session deduplication Set (Pitfall 9) and word-list size validation (Pitfall 10) are low-effort improvements that meaningfully reduce GM annoyance. Best addressed after all generation paths are working so the deduplication scope covers the full feature.

**Delivers:** Per-session deduplication with single retry across all generation types; validated word list sizes (40+ entries per component); length distribution histogram tested for Markov chains (10%+ of outputs in 4-10 char range).

**Avoids:** Pitfall 9 (session duplicates), Pitfall 10 (small-space collisions).

**Research flag:** No additional research needed — standard post-implementation polish.

---

### Phase Ordering Rationale

- Data before code: cultural distinctiveness is a data property, not an algorithm property. Curating training sets first prevents rebuilding the generator around bad data.
- Engine before UI: pure functions tested in console before DOM wiring eliminates a class of bugs where bad output is attributed to UI rather than engine errors.
- Markov before combiner: the Markov path is more complex and validates the module structure; the combiner path is simpler and follows naturally.
- All people names before places/items: keeps UI panel development sequential and tests variant normalisation before the panel grows.
- Deduplication last: only meaningful once the full output space is defined.

### Research Flags

Phases with well-established patterns (no additional research-phase needed):
- **Phase 2:** Self-wiring ES module pattern is directly observed in `dice.js`, `customtables.js`. No unknowns.
- **Phase 3:** Purely additive data work. Engine patterns established in Phase 2.
- **Phase 4:** Word-combination engine is simpler than Markov. Pattern well-documented in STACK.md.
- **Phase 5:** Standard deduplication — `Set`, single retry, cap at 10.

Phases requiring careful manual validation (not automated research, but human testing):
- **Phase 1:** Phonological curation quality cannot be verified by tooling. Requires manual test: generate 50 names per culture, audit for memorisation (Pitfall 1) and cultural distinctiveness (Pitfall 5).
- **Phase 2:** Length distribution of Markov output must be manually histogrammed (1,000 generate calls) to confirm the end-token distribution is not degenerate before proceeding.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Algorithm choice (order-1 Markov, word combination) derived from first principles and established game dev patterns. Module structure drawn from direct codebase inspection. |
| Features | HIGH (Elf/Dwarf/Orc) / MEDIUM (Beastkin, table stakes categorisation) | Canonical culture phoneme conventions are well-published. Beastkin has no single canonical source. Table stakes classification based on analysis of existing tools, not fresh user research. |
| Architecture | HIGH | Drawn entirely from direct inspection of `app.js`, `dice.js`, `deck.js`, `customtables.js`, `index.html`. No inference required. |
| Pitfalls | HIGH | Markov pitfalls are well-documented in procedural generation literature. Data size and UI consistency pitfalls grounded directly in project constraints and existing codebase. |

**Overall confidence:** HIGH

### Gaps to Address

- **Optimal Markov order for each culture:** STACK.md recommends order-1 given expected corpus sizes; PITFALLS.md notes order-2 fails below ~150 names per variant. The correct order should be validated empirically per culture by auditing uniqueness rate after table pre-computation (Phase 1). Do not commit to a single order across all cultures without testing.
- **Beastkin phoneme blend:** No canonical source defines Beastkin naming conventions. The blended-corpus approach described in FEATURES.md is a design decision, not a community standard. Quality of output depends heavily on how well the mixed archetypes are weighted in the training set. Plan extra manual testing time for this culture.
- **Insert format for names:** PITFALLS.md flags that names should insert as plain text (not markdown blockquotes). This deviates from all other tools. Confirm with project owner whether plain text is the intended convention before wiring UI in Phase 2.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection (`app.js`, `dice.js`, `deck.js`, `customtables.js`, `index.html`, `CONCERNS.md`) — module structure, self-wiring pattern, insertAtCursor signature, Promise.all registration, localStorage constraints
- Tolkien Appendix E/F — Elvish and Dwarvish phoneme conventions
- D&D 5e Player's Handbook — racial naming conventions per ancestry
- Pathfinder 2e Core Rulebook — ancestry naming conventions

### Secondary (MEDIUM confidence)
- donjon.bin.sh/fantasy/name, fantasynamegenerators.com, RinkWorks Fantasy Name Generator — community-standard feature expectations and phoneme pools
- Warcraft lore naming guides — Orc/Goblin phoneme patterns
- Procedural generation literature (multiple sources in training data) — Markov chain pitfalls and corpus size guidance

### Tertiary (LOW confidence)
- Beastkin naming conventions — synthesised from community practice across multiple RPG settings; no authoritative single source

---
*Research completed: 2026-03-18*
*Ready for roadmap: yes*
