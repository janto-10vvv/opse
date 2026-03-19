# Roadmap: OPSE Name Generator

## Overview

Three phases deliver the complete name generator module. Phase 1 builds the Markov engine foundation and proves the full data-to-cursor pipeline with Human names. Phase 2 adds the remaining four cultures, completing all people name generation. Phase 3 adds the word-combination engine and delivers place, guild, and item names — completing the feature.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Engine and Human Names** - Markov engine, curated data, Human M/F/Surname generation, full UI panel wired end-to-end (completed 2026-03-19)
- [ ] **Phase 2: Remaining Cultures** - Elf, Dwarf, Orc/Goblin, Beastkin generation; variant selector adapts per culture; all corpora expanded to ~200 names
- [ ] **Phase 3: Places, Guilds, and Items** - Word-combination engine; town/building/geographic/guild/weapon/armour/potion generation

## Phase Details

### Phase 1: Engine and Human Names
**Goal**: The GM can generate Human names (Male, Female, Surname) from a working sidebar panel, inserted at cursor — proving the full pipeline from curated Markov data to editor output.
**Depends on**: Nothing (first phase)
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-05, PEOP-01, PEOP-02, PEOP-03, UI-01, UI-02, UI-03, UI-05, DATA-01
**Success Criteria** (what must be TRUE):
  1. User can open the Name Generator panel in the sidebar alongside existing tool panels
  2. User can select "People > Human > Male/Female/Surname" and click Generate to insert a name at the editor cursor
  3. Generated Human names are pronounceable and recognisably Nordic/Germanic/Latin in phoneme character
  4. The app never freezes or produces an empty/undefined result regardless of how many times Generate is clicked
  5. No external data files exist in the repo — all generation data is inline in `namegen.js`
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md — Markov engine, curated transition tables, and generation functions (js/namegen.js)
- [x] 01-02-PLAN.md — HTML panel in sidebar and app.js bootstrap wiring
- [x] 01-03-PLAN.md — Gap closure: fix doubled-letter assembly bug and expand training data to ~200 names per variant

### Phase 2: Remaining Cultures
**Goal**: All five people-name cultures are available; each produces phonemically distinct output with rich variation from ~200-name corpora; the variant selector correctly adapts to show or hide Male/Female/Surname controls per culture.
**Depends on**: Phase 1
**Requirements**: PEOP-04, PEOP-05, PEOP-06, PEOP-07, PEOP-08, UI-04
**Success Criteria** (what must be TRUE):
  1. User can generate Elf names (gender-neutral, melodic phonemes) from the same panel
  2. User can generate Dwarf names (hard consonants, Germanic/Nordic feel) from the same panel
  3. User can generate Orc/Goblin names (guttural/sibilant) from the same panel
  4. User can generate Beastkin names (broad, unpredictable blend) from the same panel
  5. Selecting a non-Human culture hides the Male/Female/Surname variant selector (or shows only a single option); selecting Human shows the full three-variant control
**Plans:** 3/4 plans executed

Plans:
- [x] 02-01-PLAN.md — Elf and Dwarf Markov tables, generalised generatePersonName, UI culture options and variant selector toggle
- [x] 02-02-PLAN.md — Orc, Goblin, and Beastkin Markov tables
- [ ] 02-03-PLAN.md — Gap closure: expand Dwarf personal and clan name corpora to ~200 names each
- [ ] 02-04-PLAN.md — Gap closure: expand Elf, Orc, and Goblin corpora to ~200 names each

### Phase 3: Places, Guilds, and Items
**Goal**: The GM can generate names for every non-person category — settlements, buildings, geographic features, guilds, weapons, armour, and potions — with semantically coherent word-combination output inserted at cursor.
**Depends on**: Phase 2
**Requirements**: ENG-04, PLAC-01, PLAC-02, PLAC-03, PLAC-04, ITEM-01, ITEM-02, ITEM-03, DATA-02
**Success Criteria** (what must be TRUE):
  1. User can generate a town/village name, a building/location name, and a geographic feature name from the Place sub-type selector
  2. User can generate a guild name (article + adjective + object pattern, e.g. "The Gilded Quill")
  3. User can generate a weapon name, armour name, and potion name from the Item sub-type selector
  4. Generated place and item names read as coherent fantasy names — not random adjective/noun nonsense — across repeated generation
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Engine and Human Names | 3/3 | Complete   | 2026-03-19 |
| 2. Remaining Cultures | 3/4 | In Progress|  |
| 3. Places, Guilds, and Items | 0/TBD | Not started | - |
