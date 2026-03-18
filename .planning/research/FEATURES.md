# Feature Landscape: Fantasy Name Generator

**Domain:** Procedural fantasy name generation for tabletop RPG GM toolkit
**Researched:** 2026-03-18
**Confidence note:** Web access was unavailable during this research session. All findings are drawn from training data covering D&D 5e, Pathfinder 2e, Tolkien's linguistic appendices, established tabletop community conventions, and published name generator implementations (donjon, fantasynamegenerators.com, Seventh Sanctum, RinkWorks). Confidence is HIGH for phoneme conventions (extensively published) and MEDIUM for "what users expect" feature categorization (well-established but not freshly verified).

---

## Table Stakes

Features users expect from any fantasy name generator. Missing these makes the tool feel incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Per-race name generation | Every fantasy game has races; names must feel culturally distinct | Low–Med | The core value proposition |
| Human M/F/Surname split | GMs instantly think "I need a male innkeeper's name" — unsplit feels lazy | Low | Industry standard since at least donjon (2000s) |
| Single-click generation | GM flow is interrupted by friction; one click per name is the expected UX pattern | Low | Matches existing dice/deck UX in OPSE |
| Insert at cursor | Names land where the GM is writing — copy-paste is friction | Low | Already established by existing tools |
| Phonemically distinct cultures | Elf names must not sound like Orc names; distinctness is the entire point | Med | Requires careful Markov training data |
| Place name generation | Towns, taverns, rivers — nearly as frequent a need as people names | Med | Word-combination patterns work well here |
| Item name generation | Weapon/armour/potion naming is constant during loot scenes | Med | Adjective + noun compound works well |
| Guild/faction name generation | Factions are session-prep staples | Low | Same word-combination method as places |
| Names that are pronounceable | Gibberish output destroys trust in the tool immediately | Med | Constraining Markov chains solves this |
| Consistent cultural flavour per output | Each generated name should feel like it belongs in the same culture | Med | Achieved by tight, curated training sets |

---

## Differentiators

Features that go beyond the baseline. Not expected, but meaningfully increase value when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Beastkin as a genuinely broad/wild category | Most generators model one beast-person type; covering the whole bestial spectrum in one generator is unusual | Med | Achieved by high variance in Markov model — mix short harsh syllables with long animal-inspired clusters |
| Gender-neutral convention for non-human races | Elves especially: many settings treat elf names as ungendered; matching this is authentic | Low | Simply omit M/F split for Elf, Dwarf, Orc — one pool each |
| Place name components reflect geography | "Ironhold" reads differently than "Silverbrook" — built-in semantic word lists matter | Med | Categorise adjective/noun lists by theme (stone, water, wood, shadow, etc.) |
| Compound place names with grammatical sense | "Bridgemoor" not "ShieldWater" — avoiding nonsense compounds | Low–Med | Pre-screened word-list pairs rather than fully random combination |
| Item names with material + form + epithet structure | "Ashen Longsword of the Hollow" beats "sharp sword" | Med | Layered word-combination: [material] [type] [optional epithet] |
| Potion names with ingredient + effect flavour | "Tincture of Brackwater" feels alchemical; random adjective + "potion" does not | Low | Small curated ingredient/effect word lists |
| Orc and Goblin as one pool with sub-flavour | They share phoneme roots in most settings; one pool with configurable register (Orc = heavier, Goblin = shriller) is tidy | Med | Two biased Markov models sharing a corpus |

---

## Anti-Features

Features to deliberately NOT build for v1. Each has a reason and a lighter alternative where relevant.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User-defined cultures / custom phoneme sets | Scope creep; requires UI for training data input, validation, storage, and edge-case handling. PROJECT.md explicitly calls this out of scope | Provide high-quality built-in cultures; users wanting custom sets can use the existing custom tables tool for word lists |
| Name history / favourites panel | Requires persistent state management for a list of strings, adds UI complexity, and conflicts with the insert-at-cursor philosophy | Insert lands in editor = history is the document itself |
| Batch generation (generate 10 at once) | Encourages skimming over a list rather than generating on demand; adds UI complexity | Single-click re-generation is fast enough |
| Pronounceability filters / regenerate-if-bad logic | Fragile, language-specific, hard to maintain; better to fix the training data so bad outputs don't occur | Curate training corpora tightly; test Markov chains before shipping |
| Name meaning / etymology display | Interesting but requires a lookup table per name (impractical with Markov output) or a large embedded dictionary | Out of scope; meaning lives in lore, not the generator |
| Gender options for non-human races | Most canonical sources treat non-human races as gender-neutral in naming conventions; adding a split adds UI noise for no lore gain | Single pool per race; Human is the explicit exception |
| External API / online database calls | App is fully offline by design; any network dependency breaks the core value | All data baked into JS module |
| Separate data files (JSON, CSV) | Adds repo payload and an import/fetch step; violates the "compact baked-in" constraint | Embed all tables and Markov chains as JS object literals |
| Settings/configuration panel for name style | Adds UI surface area; flavour is the responsibility of the training data, not the user | Craft training data to produce good defaults every time |

---

## Per-Culture Phoneme and Naming Convention Notes

These notes directly inform training data curation and Markov chain design.

### Human — Male

**Canonical register:** Broad; must cover northern European (Germanic, Norse), southern European (Latin, Romance), and vaguely eastern/Slavic registers to serve diverse game settings.

**Phoneme patterns:**
- Consonant clusters: str-, br-, al-, th-, wil-, ed-, har-, gar-, ron-
- Common endings: -an, -en, -on, -ar, -ald, -ric, -bert, -win, -mund
- Vowel ratio: roughly 40% — names feel grounded, not overly musical
- Avoid: apostrophes, double-vowel clusters (these read as Elf), heavy sibilance

**Examples from tradition:** Aldric, Brennan, Thormund, Gareth, Edvard, Willem, Ronan, Halvard

**Training data guidance:** Mix ~30 names from each of: Norse (Gunnar, Leif, Bjorn style), Germanic/medieval (Aldric, Gerwin, Bertram style), and Latinic fantasy (Corvin, Marius, Tavian style). ~90 names total is sufficient for a 2-gram Markov chain.

---

### Human — Female

**Canonical register:** Softer endings than male; still grounded and pronounceable.

**Phoneme patterns:**
- Common endings: -a, -ia, -ine, -elle, -wyn, -eth, -isa, -ora
- Openings: el-, mar-, syl-, bri-, lir-, al-, cal-
- Avoid: same Elf markers (over-musical); avoid names that are identical to male names minus one letter

**Examples from tradition:** Maren, Elise, Aldara, Brienne, Sigrid, Liora, Corwyn, Tessa, Halvana

**Training data guidance:** Similar blend to male — Norse feminine (Astrid, Sigrid style), medieval Romance (Elise, Margot style), fantasy-Latin (Lyara, Coriana style). ~90 names.

---

### Human — Surname

**Canonical register:** Occupational, topographic, or patronymic patterns. Must read as English-adjacent.

**Phoneme patterns:**
- Compound types: [place feature] + [suffix]: Stonefield, Blackmoor, Ashford
- Patronymic types: [given stem] + son/sen/dall: Erikson, Halvdal
- Occupational types: Smith, Fletcher, Cooper, Thatcher, Ward
- Avoid: Elf-style compounds (Moonwhisper etc.) — those are surnames only in high-fantasy parody

**Training data guidance:** 40–50 surnames split across the three types. For Markov purposes, treat as a word-combination table (prefix pool + suffix pool) rather than Markov chain — results are more predictable and controllable.

---

### Elf

**Canonical register:** Tolkien Sindarin/Quenya is the definitive reference. Musical, flowing, liquid consonants, many vowels.

**Phoneme patterns:**
- Consonant preference: l, r, n, th, v, s, f, c (soft)
- Vowel heavy: 50–60% vowel ratio; double vowels common (ae, ai, ia, ie, eo)
- Common patterns: [vowel][l/r/n]-[vowel ending]: Elara, Aerin, Lirien, Sylvael
- Endings: -iel, -ael, -iel, -aen, -wyn, -is, -ara, -ion (masc), -iel (fem) — but gender distinction is optional
- Avoid: hard stops (k, g, b, d, p), consonant clusters, short brutal syllables
- Syllable count: 2–4 syllables; elves have long names

**Examples from tradition:** Legolas, Galadriel, Elrond, Arwen, Celeborn, Tauriel; D&D: Erevan, Araleth, Felosial, Quelenna

**Training data guidance:** 60–80 names drawn from Tolkien-inspired fantasy names (avoid direct Tolkien IP names). Focus on ae/ai/el/ar/in clusters. Two-gram Markov will naturally generate musical names from this corpus.

---

### Dwarf

**Canonical register:** Tolkien Khuzdul plus Norse/Old German influence. Short, hard, consonant-heavy. Names feel carved, not sung.

**Phoneme patterns:**
- Consonant clusters: br-, gr-, th-, dr-, kh-, nd-, rk-, gn-
- Common endings: -in, -in, -ur, -nar, -or, -gar, -mund, -dim, -bur
- Vowel ratio: ~30% — sparse vowels between heavy consonants
- Common vowels: i, u, o (short sounds); avoid long open vowels (a, ae, ia)
- Syllable count: 1–3 syllables; dwarves have short powerful names
- Avoid: l, soft s, f, flowing vowel clusters — these feel Elvish

**Examples from tradition:** Gimli, Thorin, Balin, Dwalin, Gloin, Oin; D&D: Bruenor, Dagnabbet, Tordek, Mordred; Pathfinder: Gunnloda, Kogra

**Training data guidance:** 60–80 names. Emphasise th/br/gr clusters, -in/-ur/-or endings. Markov on this corpus reliably produces convincing Dwarf names.

---

### Orc

**Canonical register:** Tolkien's Black Speech plus Warcraft and D&D conventions. Aggressive, guttural, harsh stops and fricatives.

**Phoneme patterns:**
- Consonant clusters: gr-, kr-, zg-, urg-, thrak-, grom-, brul-
- Common vowels: u, o, a (short, harsh); avoid i, e, ae
- Endings: -ug, -ak, -uk, -rog, -ash, -gar, -gul, -tur
- Common patterns: CVC or CVCC — short and brutal
- Syllable count: 1–2 syllables strongly preferred; 3 is an Orc chieftain
- Avoid: soft consonants, flowing vowels, musical quality of any kind

**Examples from tradition:** Thrall, Garrosh, Grom, Durotan; D&D: Gruumsh-flavoured: Gorash, Ulgreth, Karg; traditional: Grignr, Urgoth

**Training data guidance:** 50–70 names. Heavy CVC patterns. Markov chain needs a small corpus biased toward stops (k/g/r/sh) to produce consistently guttural output.

---

### Goblin

**Canonical register:** Shares Orcish roots but lighter, shriller, occasionally comic. Short, high-frequency sounds.

**Phoneme patterns:**
- Similar stops to Orc but higher register: ik-, nik-, snik-, grik-
- Endings: -ix, -ik, -ip, -nix, -et, -ot, -nik
- More sibilance than Orc (s, z, sh sounds)
- Syllable count: 1–2 syllables; Goblins have short names
- Optional: double-consonant clusters that feel "scrabbling": skrit, knib, skvip

**Examples from tradition:** Reck, Nix, Snirk, Zibbit, Grik, Skitter, Pib

**Training data guidance:** 40–60 names. Can share Orc Markov model with a different initialisation bias, or be a separate small model. Distinct enough from Orc to justify separation.

**Note for implementation:** PROJECT.md specifies "Orc/Goblin" as a single category. Recommend one generation pool with the Orc register as default, or a single blended Markov corpus that naturally produces both registers depending on the random walk.

---

### Beastkin

**Canonical register:** No single canonical reference — Beastkin covers catfolk, wolfkin, lizardfolk, minotaurs, and more. This is intentionally the most varied and wild generator.

**Phoneme patterns by archetype (all feed one blended pool):**
- Feline: soft sibilance + click-like stops: Ssira, Khet, Mrrak, Variss, Thann
- Canine/Wolf: hard consonants + howl-vowels (ow, au, ar): Barash, Haur, Gravar, Naulor
- Reptile/Lizard: sibilant-heavy, drawn vowels: Sssith, Vizash, Krethis, Saraxes
- Bird/Avian: sharp, short, high-frequency: Krek, Avith, Pirra, Tessik
- Bovine/Heavy: broad, low, heavy: Murg, Tharr, Bolden, Grauth

**Strategy for the blended pool:** Train a single Markov corpus on 80–100 names mixing all archetypes. The natural variance of the Markov walk will produce the "broad and wild" output the PROJECT.md specifies. The lack of dominant register is a feature — each name feels like it could belong to a different Beastkin species.

**Avoid:** A homogeneous pool that just sounds like generic fantasy. Deliberately seed with phonemes from multiple registers above.

---

### Towns and Villages (Place)

**Canonical register:** English-adjacent compound names. Topographic or descriptive.

**Structure:** [Modifier] + [Geographic noun], or [Proper stem] + [settlement suffix]

**Word pools:**
- Modifiers: colour (Black-, Silver-, Red-), material (Iron-, Stone-, Ash-), nature (Oak-, Thorn-, Mist-), direction (North-, East-)
- Geographic nouns: -ford, -haven, -moor, -vale, -bridge, -mill, -wick, -stead, -hollow, -crossing
- Standalone stems: proper-name style (Elder-, Winter-, Crown-)

**Examples:** Ashford, Ironhaven, Thorn Moor, Silverwick, Crow's Hollow, Mistbridge

---

### Buildings and Locations

**Canonical register:** Evocative descriptive compounds. Named after function, founder, or notable feature.

**Structure:** [Adjective/Modifier] + [Building type], or [Epithet] + "of the" + [noun]

**Word pools:**
- Adjectives: Broken, Gilded, Crooked, Silent, Ancient, Sunken, Burning
- Building types: Tower, Inn, Hall, Keep, Forge, Mill, Temple, Vault, Shrine, Bridge, Gate
- "The X of Y" pattern: The Eye of Storms, The Hand of the King

**Examples:** The Gilded Tower, Crooked Bridge Inn, The Silent Hall, Sunken Vault

---

### Geographic Features

**Canonical register:** Tolkien-influenced descriptive names. Larger, more imposing than settlement names.

**Structure:** [Descriptor] + [Feature type], or inverted [Feature type] + "of" + [Descriptor]

**Word pools:**
- Descriptors: Storm-, Iron-, Shadow-, Silver-, Bone-, Ember-, Frost-, Ashen-, Crystal-
- Feature types: -peaks, -ridge, -fen, -mere, -gorge, -pass, -wastes, -forest, -sea, -bay, -cape
- Epithets: The Howling X, The Shattered X, The Sunken X

**Examples:** Stormridge, Bonefell Fen, Ironpeaks, The Shattered Gorge, Frost Mere

---

### Guild Names

**Canonical register:** Either trade-guild style (functional, formal) or adventuring-company style (evocative, boastful).

**Structure:** "The [Adjective] [Symbol/Animal/Tool]" or "[Trade noun] Guild of [Place/Epithet]"

**Word pools:**
- Adjectives: Silver, Iron, Scarlet, Broken, Golden, Black, Gilded, Hollow
- Symbols/Animals: Hand, Crow, Serpent, Hammer, Shield, Eye, Coin, Fang, Lantern
- Trade nouns: Merchant, Alchemist, Thief, Blade, Scribe

**Examples:** The Silver Crow, Iron Hand Guild, The Broken Fang, Scarlet Serpent Company

---

### Weapons

**Canonical register:** Material + type, optionally with epithet or name.

**Structure:** [Material] [Weapon type] — optionally "the [Name/Epithet]"

**Word pools:**
- Materials: Iron, Steel, Ashen, Bone, Shadow, Flame, Frost, Silver, Rusted, Obsidian
- Weapon types: Blade, Sword, Axe, Spear, Dagger, Bow, Hammer, Maul, Cleaver, Halberd
- Epithets (optional): "of the Fallen", "of Sorrow", "the Undying", "the Hollow"

**Examples:** Ashen Blade, Frost Hammer, Iron Cleaver, Shadow Spear of the Fallen

---

### Armour

**Canonical register:** Material + form, optionally with provenance or title.

**Structure:** [Material] [Armour type] — same epithet pattern as weapons

**Word pools:**
- Materials: Iron, Hardened, Gilded, Bone, Shadow, Blessed, Ruined, Ancient, Tarnished
- Armour types: Plate, Mail, Hauberk, Breastplate, Shield, Helm, Pauldron, Cuirass, Greaves, Coif
- Epithets (optional): "of the Vanguard", "of the Fallen King"

**Examples:** Tarnished Hauberk, Gilded Plate, Bone Shield of the Fallen King

---

### Potions

**Canonical register:** Alchemical and herbal; should feel like they came from an apothecary, not a video game shop.

**Structure:** [Container/Form] + "of" + [Ingredient/Effect] — optionally "Tincture/Draught/Elixir/Brew of [X]"

**Word pools:**
- Forms: Vial, Tincture, Draught, Elixir, Brew, Distillation, Essence, Phial
- Ingredients/Effects: Brackwater, Ember Root, Shadow Moss, Moonpetal, Ironbark, Foxglove, Pale Ash, Thornblood, Cinder, Goldleaf, Stillwater
- Modifier pairs: "the [Adjective] [Ingredient]" for rarer potions

**Examples:** Tincture of Brackwater, Elixir of Ember Root, Draught of Pale Ash, Brew of Thornblood

---

## Feature Dependencies

```
Human M/F/Surname → insertAtCursor() (existing)
Elf / Dwarf / Orc / Goblin / Beastkin names → insertAtCursor() (existing)
Place names (towns/buildings/geo) → word-combination tables → insertAtCursor()
Guild names → word-combination tables → insertAtCursor()
Item names (weapons/armour/potions) → word-combination tables → insertAtCursor()

Markov chain model → curated training corpus (embedded in module)
Word combination → curated word-list pools (embedded in module)
All features → namegen.js module → index.html panel registration
```

---

## MVP Recommendation

**Build all defined categories in v1** — the scope is already tight and well-defined by PROJECT.md. The features are bounded, the generation methods are determined (Markov for people, word-combination for places/items), and all are compact enough for a single module.

**Priority order within the milestone:**

1. Human names (M/F/Surname) — highest session-prep frequency; validates the Markov approach
2. Elf / Dwarf — most commonly needed non-human cultures; clear phoneme profiles
3. Orc/Goblin and Beastkin — more exotic; validate word-combination approach works
4. Place names (towns, buildings, geographic) — fills a different need; word-combination is simpler to implement
5. Guild names — same mechanism as places; low incremental effort
6. Item names (weapons, armour, potions) — completes the toolset; word-combination

**Defer for after v1:**
- Nothing in scope should be deferred — scope is already minimal and well-chosen
- The one post-v1 candidate would be Beastkin sub-type selection (feline / canine / reptile) but the blended-pool approach deliberately avoids this complexity

---

## Sources

All findings from training data knowledge. Key reference works informing these conventions:

- Tolkien, J.R.R. — "The Lord of the Rings" Appendix E and F (language and naming conventions for Elvish/Dwarvish)
- D&D 5e Player's Handbook — racial naming conventions sections per race
- Pathfinder 2e Core Rulebook — ancestry naming conventions
- RinkWorks Fantasy Name Generator (rinkworks.com/namegen) — established community reference for phoneme rule sets
- donjon.bin.sh/fantasy/name — long-standing community reference implementation
- fantasynamegenerators.com — most comprehensive public reference; uses per-race phoneme pools matching conventions documented here
- "The Tough Guide to Fantasyland" (Diana Wynne Jones) — documents cliches to be aware of
- Warcraft naming conventions (World of Warcraft lore guides) — Orc/Troll phoneme patterns

**Confidence:** HIGH for Elf/Dwarf/Orc phoneme profiles (multiple canonical published sources). MEDIUM for Beastkin (no single canonical source; synthesised from community practice). MEDIUM for "table stakes vs differentiators" categorisation (based on analysis of existing tools, not fresh user research).
