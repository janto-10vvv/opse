---
phase: 02-remaining-cultures
plan: 04
subsystem: ui
tags: [markov, namegen, elf, orc, goblin, bigram]

# Dependency graph
requires:
  - phase: 02-remaining-cultures
    provides: Initial Elf/Orc/Goblin Markov tables (~70/~55/~45 names each)
provides:
  - Expanded Elf bigram table from ~182 curated melodic names
  - Expanded Orc bigram table from ~181 curated guttural names
  - Expanded Goblin bigram table from ~191 curated sibilant names
  - All three cultures now match the ~200-name standard established in Phase 01
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Bigram table rebuilt by computing all consecutive 2-char transitions from curated corpus
    - Frequency encoding: tokens appear multiple times proportional to corpus frequency
    - Start sentinel "^" populated once per name (opening bigram)

key-files:
  created: []
  modified:
    - js/namegen.js

key-decisions:
  - "Elf corpus expanded to ~182 names preserving melodic profile: ae/el/ri/ir dominant transitions, soft consonants (l,r,n,s,th,v,f), flowing vowel sequences"
  - "Orc corpus expanded to ~181 names preserving guttural profile: gr/ur/kr/th/br dominant starts, hard stops (-ak/-ok/-ash/-oth)"
  - "Goblin corpus expanded to ~191 names preserving sibilant profile: sn/sk/ni/gr/tr/zi/pi starts, doubled consonants (kk/bb/zz), short clipped endings"

patterns-established:
  - "~200-name corpus standard: all culture name tables built from ~180-200 curated entries for adequate Markov variation"

requirements-completed: [PEOP-04, PEOP-06]

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 02 Plan 04: Expand Elf, Orc, and Goblin Name Corpora to ~200 Names Summary

**Rebuilt Elf (~182), Orc (~181), and Goblin (~191) Markov bigram tables from curated corpora, matching the ~200-name standard established in Phase 01 while preserving each culture's distinct phonemic character.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T03:47:03Z
- **Completed:** 2026-03-19T03:53:03Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Elf name table expanded from ~70 to ~182 training names: 182 start tokens (was 72), 23 unique starting bigrams (was 15), richer melodic variation
- Orc name table expanded from ~55 to ~181 training names: 181 start tokens, guttural dominance maintained (gr/ur/kr/th lead)
- Goblin name table expanded from ~45 to ~191 training names: 191 start tokens, sibilant/sharp character preserved (sn/sk/ni lead)
- All 6 cultures intact, markovName engine and assembly fix untouched, no localStorage, no console.log

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand Elf name corpus to ~200 names and rebuild bigram table** - `c28b1f4` (feat)
2. **Task 2: Expand Orc and Goblin corpora to ~200 names each and rebuild bigram tables** - `ff47521` (feat)

**Plan metadata:** (see final commit)

## Files Created/Modified
- `js/namegen.js` - Rebuilt CULTURES.elf.name, CULTURES.orc.name, CULTURES.goblin.name tables with expanded corpora

## Decisions Made
- Elf corpus: 182 names with melodic vowel flows (ae/el/ri), soft consonants — fallbacks updated to Lirien/Aerin/Thalion/Aelinor/Vaelith
- Orc corpus: 181 names with guttural clusters (gr/ur/kr/th/br/du/mo/zu) — fallbacks updated to include Throk
- Goblin corpus: 191 names with sibilant/shrill starts (sn/sk/ni/gr/tr/zi/pi) — fallbacks updated to Nix/Skrit/Grikket/Trix/Ziknik
- Programmatically computed bigram tables from curated lists to ensure deterministic, reproducible results

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 6 culture name generators now operate from ~180-200 name corpora — variation standard met
- Phase 02 is complete; no remaining blockers

---
*Phase: 02-remaining-cultures*
*Completed: 2026-03-19*
