# Testing

## Current State
**No automated testing.** Manual browser testing only.

No test framework, no test files, no assertion library, no CI pipeline.

## Testable Code (Pure/Near-Pure)

| File | What's testable |
|------|----------------|
| `dice.js` | Roll functions are pure — deterministic lookup given a fixed random seed |
| `deck.js` | Shuffle, draw, reshuffle logic — stateful but isolatable |
| `customtables.js` | Table parsing and weighted random selection |
| `tools.js` | Any pure transformation functions |

## Current Gaps
- No tests for localStorage edge cases (quota exceeded, corrupted data)
- No tests for card draw logic (deck exhaustion, Joker reshuffle)
- No tests for data integrity across tab operations
- No tests for import/export flows
- No UI interaction tests

## DOM Coupling Issue
Most modules mix pure logic with direct DOM manipulation, making unit testing difficult without refactoring. Pattern to enable testing:

```js
// Current (hard to test)
export function rollDice(type) {
  const result = Math.floor(Math.random() * type) + 1;
  document.getElementById('output').textContent = result; // DOM side-effect
}

// Testable (separate concerns)
export function computeRoll(type, random = Math.random) {
  return Math.floor(random() * type) + 1; // pure, injectable
}
```

## Recommended Future Stack
- **Framework:** Vitest (works without a bundler, fast, ESM-native)
- **Test file location:** Co-located (`deck.test.js` next to `deck.js`)
- **Strategy:** Unit test pure logic first, integration tests for localStorage flows

## Mocking Notes
- localStorage can be mocked with a simple in-memory Map
- DOM manipulation requires jsdom or Playwright for E2E
- No external APIs to mock
