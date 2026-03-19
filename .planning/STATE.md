---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 02-04-PLAN.md
last_updated: "2026-03-19T03:53:50.345Z"
last_activity: 2026-03-18 — Roadmap created
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 7
  completed_plans: 7
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** A GM can generate a believable, flavourful name for any character, place, or item in one click — without uploading data files or leaving the app.
**Current focus:** Phase 1 — Engine and Human Names

## Current Position

Phase: 1 of 3 (Engine and Human Names)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-18 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-engine-and-human-names P01 | 3 | 1 tasks | 1 files |
| Phase 01-engine-and-human-names P02 | 1 | 2 tasks | 2 files |
| Phase 01-engine-and-human-names P03 | 6 | 1 tasks | 1 files |
| Phase 02-remaining-cultures P01 | 3 | 2 tasks | 2 files |
| Phase 02-remaining-cultures P02 | 5 | 2 tasks | 1 files |
| Phase 02-remaining-cultures P03 | 8m | 2 tasks | 1 files |
| Phase 02-remaining-cultures P04 | 6m | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Markov order-1 for people names (generative at 80-120 names per variant; order-2 memorises at this scale)
- Word-combination engine for places/guilds/items (compact data, predictably structured output)
- All data baked inline into `namegen.js` (no external files, no runtime training)
- Built-in cultures only — no user-defined phoneme sets
- [Phase 01-engine-and-human-names]: ^ used as start sentinel key in Markov tables; fallback arrays co-located with variant data in CULTURES object
- [Phase 01-engine-and-human-names]: generatePersonName hardcodes Human label in Phase 1; Phase 2 will generalise when other cultures are added
- [Phase 01-engine-and-human-names]: Panel placed after section-generators (before section-custom-tables) to group it with generation tools
- [Phase 01-engine-and-human-names]: Culture select has only Human option in Phase 1; Phase 2 will add more cultures
- [Phase 01-engine-and-human-names]: Bigram Markov assembly fix: append token[1] per step (second char only) — adjacent states share boundary character, appending full bigram duplicates it
- [Phase 02-remaining-cultures]: Separate dwarf.name and dwarf.clan Markov tables for phonemically distinct personal vs compound clan output
- [Phase 02-remaining-cultures]: generatePersonName dispatches by culture string: human unchanged, dwarf builds personal+clan, all others use data.name single pool
- [Phase 02-remaining-cultures]: Variant selector uses variantEl.hidden attribute on culture change — no CSS, matches codebase hidden attribute pattern
- [Phase 02-remaining-cultures]: Separate Orc/Goblin Markov tables with distinct start-token arrays as primary phonemic differentiator
- [Phase 02-remaining-cultures]: Beastkin 90-name mixed corpus (18 per archetype) enables cross-archetype Markov transitions for deliberately chaotic output
- [Phase 02-remaining-cultures]: Computed bigram tables programmatically from curated name lists for deterministic reproducible tables
- [Phase 02-remaining-cultures]: Elf/Orc/Goblin corpora expanded to ~180-200 names each; all cultures now match ~200-name standard for adequate Markov variation

### Pending Todos

None yet.

### Blockers/Concerns

- Confirm with project owner: names insert as plain text (not markdown blockquote) — PITFALLS.md flags this as a deviation from other tools; resolve before wiring UI in Phase 1.
- Beastkin phoneme blend has no authoritative source — plan extra manual testing time for this culture (Phase 2).

## Session Continuity

Last session: 2026-03-19T03:53:50.343Z
Stopped at: Completed 02-04-PLAN.md
Resume file: None
