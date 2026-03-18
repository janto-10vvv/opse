# Concerns

## Tech Debt

### Monolithic CSS
`style.css` handles all styling with no component separation. As the app grows, specificity conflicts will increase.
- **File:** `style.css`
- **Fix:** Split into logical sections or adopt CSS custom properties more aggressively

### Imperative DOM Construction
UI is built with string concatenation and `innerHTML` rather than templates or a framework.
- **Fix:** Extract reusable DOM builder helpers; consider tagged template literals

### Scattered Global State
Module-level variables act as implicit global state. No central state store.
- **Fix:** Consider a simple observable state object shared via import

## Known Bugs / Risk Areas

### localStorage Quota
No quota exceeded handling. If user writes many large documents, writes will silently fail.
- **File:** `app.js` (save functions)
- **Fix:** Wrap `localStorage.setItem()` in try/catch, notify user on quota error

### Unsafe File Import
Importing a file replaces current document without confirmation prompt.
- **Fix:** Add "unsaved changes" guard before overwriting

### Recursive Joker Draw Risk
When the deck is exhausted and reshuffled, drawing a Joker immediately could trigger infinite recursion if not guarded.
- **File:** `deck.js`
- **Fix:** Add recursion depth guard or iterative reshuffle-and-draw loop

### Unchecked Table Lookups
If a custom table has malformed syntax, the parser may return `undefined` silently.
- **File:** `customtables.js`
- **Fix:** Validate table format on save, surface parse errors to user

## Security

### CDN Dependencies
CodeMirror loaded from CDN (jsDelivr). A compromised CDN could inject malicious code.
- **Fix:** Pin to a specific CDN hash (`integrity` attribute) or self-host

### Unencrypted localStorage
All user documents stored in plaintext localStorage. Accessible to any JS on the same origin.
- **Note:** Single-origin app with no user accounts — acceptable risk for current scope

### Unvalidated File Imports
File content from disk is inserted into the editor without sanitization.
- **Note:** Content goes into CodeMirror (plain text), not `innerHTML` — low XSS risk currently

## Performance

### Editor Destruction on Theme Change
Switching dark/light mode destroys and recreates the CodeMirror instance.
- **File:** `app.js`
- **Fix:** Use CodeMirror's theme reconfiguration API instead of recreating the editor

### Full DOM Re-renders on Tab Switch
Tab switching may rebuild the entire tab bar DOM on each switch.
- **Fix:** Diff and update only changed tab elements

### String Concatenation for Output
Results built via string concatenation. Minor concern at current scale.

## Fragile Code

### Deck Persistence Format
Deck state serialized as JSON to localStorage. If format changes between versions, existing decks silently corrupt.
- **File:** `deck.js`
- **Fix:** Add a version field to the serialized format

### Table Parsing
Custom table parsing relies on line-by-line string splitting with no formal grammar. Edge cases (blank lines, special characters, Unicode) may produce unexpected results.
- **File:** `customtables.js`

### Tab Serialization
Tab metadata (names, order) stored separately from content. Desync possible if one write succeeds and another fails.
- **File:** `app.js`

## Scaling Limits

### localStorage Cap (~5–10 MB)
All documents + deck + tables share a single 5–10 MB localStorage budget. Power users with many large documents will hit this.
- **Fix:** Warn when approaching limit; long-term: offer export/import as primary persistence

### Custom Table Growth
No limit on number or size of custom tables. Could contribute to localStorage overflow.

## Test Gaps
- No automated tests (see TESTING.md)
- All of the above bugs are undetected by any automated check
