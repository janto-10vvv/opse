# Domain Pitfalls

**Domain:** Procedural name generation — Markov chain (people) + word combination (places/items)
**Project:** OPSE Name Generator
**Researched:** 2026-03-18

---

## Critical Pitfalls

Mistakes that require rewrites or produce fundamentally broken output.

---

### Pitfall 1: Order-2 Markov on a Tiny Training Set Memorises Instead of Generates

**What goes wrong:** A trigram (order-2) Markov chain trained on fewer than ~80-100 names per culture/variant doesn't interpolate — it reproduces source names almost verbatim. The output sounds realistic because it IS the training data, slightly scrambled. GMs notice after a few clicks when "Thorin" and "Gimli" appear with minor letter swaps.

**Why it happens:** With a small corpus, most bigram states have only one or two successors. The chain has almost no branching; it follows the single observed continuation every time. Order-2 chains need enough training data that each 2-character state has several real successors before generation feels generative.

**Consequences:** The name generator becomes a list shuffler with extra steps. Cultural distinctiveness is lost — output can blend across cultures if transition tables overlap. Players/GMs feel the repetition within a single session.

**Prevention:**
- Use order-1 (bigram) chains for small corpora (fewer than 100 names). Order-1 is more generative because each single character has more successors.
- Use order-2 only when corpus per variant reaches ~150+ names.
- For this project's 5 cultures × 2-3 variants, order-1 is almost certainly the correct default.
- After building the chain, manually audit: how many unique names does it produce in 50 tries? If fewer than 30 are unique, the corpus is too small for the chosen order.

**Detection warning signs:**
- Generating the same name twice in 10 attempts.
- Output names that are exact substrings or one-letter variants of training names.
- Transition table with many states having `successors.length === 1`.

**Phase to address:** Data curation phase (building training sets). Set order and test coverage before writing the generator loop.

---

### Pitfall 2: No Start/End Markers Produces Unpronounceable Fragments

**What goes wrong:** Building a Markov chain from raw character sequences without explicit start (`^`) and end (`$`) tokens means the chain can begin mid-syllable and end mid-syllable. Output like `"rthnik"` or `"orveth"` with no vowel start and abrupt endings feels broken even if the individual transitions are valid.

**Why it happens:** The chain learns transitions across word boundaries when trained on concatenated or boundary-unaware data, or it simply picks any bigram as a start state. Starting states are drawn from the middle of names because no sentinel value restricted them.

**Consequences:** High rate of unpronounceable or obviously-clipped output. Generator feels buggy rather than random. Worse for consonant-heavy cultures (Dwarf, Orc) where valid names already push pronounceability limits.

**Prevention:**
- Prepend `^` and append `$` (or equivalent sentinel strings) to every training name before building the transition table.
- Start generation only from states beginning with `^`. End generation when the `$` token is selected as successor.
- Add a minimum and maximum length guard: discard names shorter than 3 characters or longer than 14 characters and regenerate.

**Detection warning signs:**
- Output names that start with consonant clusters uncommon in the training set.
- Names that end on a weak or unfinished phoneme (e.g., trailing `"th"`, `"rk"` without a vowel resolution common in the culture).
- High reject rate when testing with a length guard — suggests start/end tokens missing or training data boundary errors.

**Phase to address:** Generator implementation, before integrating with UI.

---

### Pitfall 3: Training Data Size Creep Makes the Module Too Heavy

**What goes wrong:** The instinct to improve name quality by adding more training names, more cultures, or more word-list entries causes `namegen.js` to balloon. A file that starts at 15 KB becomes 80 KB as "just a few more names" are added per culture. Combined with the no-build-step constraint, this is included verbatim in the browser's JS parse budget.

**Why it happens:** Each culture × variant pair (Human Male, Human Female, Human Surname, Elf, Dwarf, Orc, Beastkin) is a separate training set. If each has 150 names at ~8 characters average, that's ~8,400 characters of raw data before the transition tables are even computed. Then place-name word lists add more. Without a hard size budget set upfront, additions feel harmless individually.

**Consequences:**
- Noticeably slower parse time on low-end devices and mobile browsers.
- `namegen.js` becomes the largest file in the project by a wide margin, violating the "compact and baked inline" constraint from PROJECT.md.
- Repo history accumulates large JS blobs that are hard to diff and review.

**Prevention:**
- Set a hard budget before writing data: the entire `namegen.js` module must stay under 20 KB minified. Raw source under 35 KB is a reasonable limit.
- **Store precomputed transition tables, not raw training names.** Training names serve only to build the table. Once the table is built, the raw names are not needed at runtime. Build the table offline (even a one-time script in a scratch file), paste the compact JSON object into the module as a constant. This is significantly smaller than storing 150 names per variant.
- For word-combination lists, cap each list at 30-50 entries. A 40-word adjective list and 40-word noun list produce 1,600 combinations — more than sufficient for a GM tool.

**Detection warning signs:**
- `namegen.js` exceeds 25 KB.
- Any single culture's raw training array contains more than 200 strings.
- Word lists for place/item generation have more than 60 entries per list.

**Phase to address:** Data design (before writing the module). Establish the precompute-then-embed pattern on day one.

---

### Pitfall 4: Word-Combination Place Names Produce Nonsense Pairings

**What goes wrong:** A word-combination system that joins adjective + noun from two independent random draws frequently produces incoherent or comedic results: "Wet Crown", "Silent Mud", "Ancient Outhouse". When the lists are designed without semantic grouping, the combinations feel random in a bad way rather than flavourful.

**Why it happens:** Pure random draw ignores semantic compatibility. Fantasy place-name conventions use specific word classes together: geographic terms pair with natural features or states ("Ironpeak", "Coldwater", "Ashwood"), not arbitrary descriptors.

**Consequences:** GMs stop using the generator because results need more editing than just typing a name. The differentiating value of the feature disappears.

**Prevention:**
- Organise word lists by semantic category, not just part-of-speech. For geographic features: `[terrain-adjective] + [terrain-noun]` (e.g., "Stone" + "Fell", "Black" + "Mere"). For settlements: `[settlement-adjective] + [settlement-noun]` (e.g., "Upper" + "Crossing", "Old" + "Mill").
- Use 2-4 different patterns per name type rather than one universal pattern. Settlements could use `Adjective+Noun`, `Noun+Noun` (compound), or `Noun's + Noun` (possessive). Vary the pattern randomly.
- Curate lists by domain: a geographic feature list and a settlement list share almost no words — keep them separate even if it means duplication.

**Detection warning signs:**
- Manual testing produces more than 1 in 5 results that feel wrong or funny.
- The same word appears across multiple generated names in a short session (small list problem).
- Output names are not distinguishable by type (a dungeon name sounds like a village name).

**Phase to address:** Word list design, before or during feature implementation.

---

## Moderate Pitfalls

---

### Pitfall 5: Culture-Specific Data Uses Generic Fantasy Tropes

**What goes wrong:** The training data for distinct cultures (Elf, Dwarf, Orc, Beastkin) gets populated with whatever feels vaguely fantasy-appropriate, producing names that are culturally indistinguishable. The Elf chain outputs the same phoneme patterns as the Human Female chain because both were trained on soft vowel-heavy names from the same fantasy trope pool.

**Why it happens:** Training data is assembled quickly from common fantasy name generators online or from a small mental model. The distinctive phonology of each culture isn't consciously encoded in the corpus.

**Prevention:**
- Before building each corpus, write down the defining phonological rules for that culture: permitted consonant clusters, dominant vowels, typical syllable count range, allowed endings. Use these as a filter when selecting training names.
- Test cross-culture distinguishability: generate 5 names from each culture and show them unlabelled to someone. Can they sort them into cultures? If not, the training data is too similar.
- Beastkin is explicitly "broad and highly random" per PROJECT.md — its training set should mix conflicting phoneme patterns intentionally.

**Detection warning signs:**
- Output from two different cultures shares the same suffix patterns (e.g., both Elf and Human Female often end in "-iel", "-ara").
- Generated names pass as plausible for the wrong culture.

**Phase to address:** Data curation. Fix before building the generator — can't be fixed by tweaking the algorithm.

---

### Pitfall 6: UI Panel Adds New Interaction Pattern That Breaks Sidebar Consistency

**What goes wrong:** The name generator needs culture selection, name type selection (Male/Female/Surname for humans), and a generate button. If this is implemented as a cascade of dropdowns or a nested menu, it introduces interaction patterns that don't exist in the other tool panels (dice, deck, tables) and feels foreign.

**Why it happens:** The design is done in isolation. The developer reaches for the natural UI affordance (dropdowns for categories) without checking how the existing tools handle selection.

**Consequences:** Visual inconsistency. Users learn the panel more slowly. The sidebar starts to feel like an uncoordinated collection of widgets.

**Prevention:**
- Audit all existing panels before designing the name generator panel. Document the interaction patterns: how does dice handle multiple configurations? How does the custom tables panel list items?
- The existing pattern uses single-action buttons with minimal pre-selection. Prefer a flat list of buttons per culture (e.g., "Human Name", "Elf Name") over a dropdown — consistent with how dice buttons work.
- If dropdowns are needed for culture+type, use a single `<select>` followed by the generate button, not nested selects.

**Detection warning signs:**
- The panel requires more than 2 interactions to generate a name.
- The panel introduces a `<details>` or accordion that no other panel uses.

**Phase to address:** UI implementation. Review CONCERNS.md note on imperative DOM construction — don't add to that debt.

---

### Pitfall 7: Infinite Loop Risk When Length Constraints Discard Too Many Results

**What goes wrong:** The generator applies a length filter (min 3, max 14 characters) and regenerates on reject. If the Markov chain's end-token probabilities are misconfigured — for example, the `$` token has very low weight from all states — the chain generates almost no names within the length window and the while-loop spins indefinitely or hits a browser timeout.

**Why it happens:** End-token probability is implicitly set by how many training names end at each state. If training names are all long (8+ characters), the chain learns to suppress endings in short names, and short-name requests loop forever. Without an iteration cap, this locks the browser.

**Prevention:**
- Every generation loop must have a hard iteration cap (e.g., 100 attempts). On cap hit, return the best available result or a known-good fallback name rather than returning empty.
- After building transition tables, test the length distribution: generate 1,000 names and histogram the lengths. If fewer than 10% fall in the 4-10 character range, the training data or end-token weighting needs adjustment.
- Store 2-3 hardcoded fallback names per culture variant to use when the generator fails — consistent with the existing module error-handling pattern (silent fallback, no crash).

**Detection warning signs:**
- Browser freezes or tab becomes unresponsive during testing.
- Empty string or `undefined` returned from the name generator in any test case.
- Length histogram is heavily skewed to one end.

**Phase to address:** Generator implementation, in the same pass as start/end token handling.

---

### Pitfall 8: localStorage Budget Impact Not Considered

**What goes wrong:** The name generator module itself stores no state, but the `namegen.js` file being loaded inline means its transition tables and word lists are parsed into memory on every page load and occupy JS heap. More importantly: if any future version stores generator preferences (last-used culture, etc.) in localStorage, it collides with the existing `opse_` key namespace without coordination.

**Why it happens:** The CONCERNS.md already flags localStorage quota pressure from documents and custom tables. Adding generator state without awareness of the existing budget creates silent write failures.

**Prevention:**
- Name generator is insert-only for v1 (confirmed in PROJECT.md). Make no localStorage writes in the initial implementation.
- If preferences are added in future, use the existing `opse_settings` key as an umbrella rather than a new top-level key, to reduce namespace clutter.
- The precomputed transition tables live only in JS module scope — they are never serialised to localStorage.

**Detection warning signs:**
- Any `localStorage.setItem()` call in `namegen.js` that isn't covered by the existing CONCERNS.md budget analysis.

**Phase to address:** Implementation. Enforce as a code review checklist item.

---

## Minor Pitfalls

---

### Pitfall 9: Duplicate or Near-Duplicate Names in the Same Session

**What goes wrong:** With a small corpus and Markov order-1, the same name can be generated twice in a short session. For example: a GM clicks "Elf Name" five times to populate a party and gets "Aelindra" twice. This is annoying but not broken.

**Prevention:**
- Keep a per-session Set of recently generated names (cleared on page reload — no persistence needed).
- On collision, regenerate once. If the second attempt also collides, return it anyway rather than looping.
- Cap the deduplication memory at the last 10 names to avoid stale state issues.

**Phase to address:** Generator implementation, as a simple post-processing step.

---

### Pitfall 10: Word-Combination Names Produce Identical Results Repeatedly

**What goes wrong:** With word lists of 30-40 entries each and 2-pattern combination, the output space is 900-1,600 combinations per name type. This sounds large but when a GM generates 20 place names in a session, collisions become noticeable.

**Prevention:**
- Same per-session deduplication Set as Pitfall 9, applied to the word-combination generator.
- Ensure word lists are not too small: 30 entries per component is a minimum; 50 is better.

**Phase to address:** Word list design + generator implementation.

---

### Pitfall 11: `insertAtCursor()` Adds Formatting the GM Doesn't Want

**What goes wrong:** The existing dice and table tools insert formatted strings with markdown (`> 🎲 1d6: [3] = 3`). If the name generator blindly follows the same pattern, names appear as blockquotes with labels in the editor, which is wrong — a GM inserting a name mid-sentence doesn't want a blockquote.

**Prevention:**
- Names should insert as plain text only — no markdown prefix, no label, no surrounding punctuation.
- The insertion string for a name is exactly the name string itself: `insertAtCursor("Aelindra")`.
- Review dice.js and customtables.js insert patterns and confirm name gen deviates intentionally.

**Phase to address:** UI wiring, before first test in the editor.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Training data curation | Memorisation from small corpus (Pitfall 1) | Use order-1; target 80-120 names per variant |
| Training data curation | Cultural indistinguishability (Pitfall 5) | Define phonological rules per culture before selecting names |
| Data embedding | Size creep (Pitfall 3) | Precompute transition tables; embed JSON object, not raw name arrays |
| Markov generator implementation | Missing start/end tokens (Pitfall 2) | Add `^`/`$` sentinels and test output boundary quality immediately |
| Markov generator implementation | Infinite loop on length filter (Pitfall 7) | Always cap generation loop at 100 iterations with fallback |
| Word-list design | Nonsense pairings (Pitfall 4) | Semantic grouping per name type; 2-4 pattern templates per type |
| Word-list design | Small-space collisions (Pitfall 10) | Minimum 40 entries per list component |
| UI panel implementation | Inconsistent interaction pattern (Pitfall 6) | Audit existing panels first; match button-centric pattern |
| Editor integration | Wrong insert format (Pitfall 11) | Plain text only — no markdown formatting on name output |
| Any phase | Session duplicates (Pitfall 9) | Per-session deduplication Set with single retry |

---

## Sources

- Confidence on Markov chain pitfalls (Pitfalls 1, 2, 7): HIGH — well-documented in procedural generation literature and name generator post-mortems; consistent across multiple independent sources in training data.
- Confidence on data size pitfalls (Pitfall 3): HIGH — derives directly from the project constraint ("compact and baked inline") stated in PROJECT.md and the no-build-step architecture.
- Confidence on word-combination quality pitfalls (Pitfalls 4, 10): HIGH — direct consequence of combinatorial math and fantasy name generator community experience.
- Confidence on cultural distinctiveness (Pitfall 5): MEDIUM — specific phonological requirements depend on the target setting; the pitfall pattern is universal but the fix is setting-specific.
- Confidence on UI consistency (Pitfall 6): HIGH — directly grounded in the existing codebase's interaction patterns observed in dice.js, customtables.js, and CONCERNS.md.
- Confidence on localStorage impact (Pitfall 8): HIGH — grounded in CONCERNS.md explicit callouts about localStorage quota and the project's insert-only v1 scope.
