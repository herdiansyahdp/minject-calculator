# Web Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based calculator (HTML/CSS/JS) with arithmetic operators, parentheses, power, square root, calculation history, keyboard support, dark/light mode — all without eval().

**Architecture:** Vanilla JS with ES modules; `src/calc/` holds pure logic (lexer → parser → evaluator) with no DOM access; `src/ui/` holds the UI controller; `index.html` ties everything together. Jest (via JSDOM) tests all logic modules; no build tool required beyond npm scripts.

**Tech Stack:** Vanilla JS (ES Modules, no framework, no bundler), Jest + JSDOM for unit tests.

**Spec:** d:\User\HDP\Downloads\PRD.md

## Global Constraints

- No `eval()` or `new Function()` on user input (FR-07).
- All user data written to DOM via `textContent`, never `innerHTML` (Security).
- Language: Bilingual Bahasa Indonesia / English (messages in Indonesian, UI labels in Indonesian).
- Storage: `localStorage` for history (max 50 items) and theme preference.
- History click: inserts **result** into input.
- Precision: max 10 significant digits displayed; `0.1 + 0.2` → `0.3`.
- Duplicate/double operators are **rejected** (input ignored, not replaced).
- Implicit multiplication: `2(3+4)` treated as `2 × (3+4)`.
- Operator precedence: parentheses → power (right-assoc) → `√` (prefix unary) → `*` `/` → `+` `-`.
- Target touch size ≥ 44×44 px (Usability).
- No external runtime dependencies — `devDependencies` only (Jest + JSDOM).
- Runs in latest Chrome, Firefox, Safari, Edge via native ES Modules (no transpile).

## Review Focus

1. **Floating-point display** — `0.1 + 0.2` must show `0.3`, not `0.30000000000000004`; `toPrecision(10)` with trailing-zero strip covers this.
2. **Right-associative power** — `2^3^2` must equal `512` (= `2^9`), not `64` (= `8^2`).
3. **Unbalanced parentheses** — `(2 + 3` and `2 + 3)` must show a clear error, not a wrong result.
4. **Square root of negative** — `√(-4)` must show an error, not `NaN`.
5. **Division by zero** — `5 ÷ 0` must show an error, not `Infinity`.

---

## Task 1: Project Scaffold & Test Infrastructure

**Files:**
- Create: `package.json`
- Create: `jest.config.js`
- Create: `.gitignore`
- Create: `src/calc/index.js` (barrel, empty export)
- Create: `src/ui/index.js` (barrel, empty export)
- Create: `src/utils/format.js` (empty export)
- Create: `tests/calc/.gitkeep`

**Interfaces:**
- Produces: npm test script (`npm test`) running Jest; all future test files discovered under `tests/`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "minject-calculator",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/.bin/jest"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

- [ ] **Step 2: Create `jest.config.js`**

```js
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  extensionsToTreatAsEsm: [],
};
```

- [ ] **Step 3: Create `.gitignore`**

Contents: `node_modules/`, `coverage/`, `.superpowers/`

- [ ] **Step 4: Create barrel files** (`src/calc/index.js`, `src/ui/index.js`, `src/utils/format.js`) each exporting empty object for now.

- [ ] **Step 5: Run `npm install`**

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Run `npm test`**

Expected: "No tests found" or passes with 0 suites — no crash.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold project + jest config"
```

---

## Task 2: Lexer

**Files:**
- Create: `src/calc/lexer.js`
- Create: `tests/calc/lexer.test.js`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `tokenize(expr: string): Token[]`
  - `Token` shape: `{ type: string, value: string | number }`
  - Token types: `'NUMBER'`, `'PLUS'`, `'MINUS'`, `'MUL'`, `'DIV'`, `'POW'`, `'SQRT'`, `'LPAREN'`, `'RPAREN'`, `'EOF'`
  - Throws `CalcError` with `.message` for unrecognised characters.

- [ ] **Step 1: Write failing tests**

```js
// tests/calc/lexer.test.js
import { tokenize } from '../../src/calc/lexer.js';

test('tokenizes simple addition', () => {
  const tokens = tokenize('3 + 4');
  expect(tokens.map(t => t.type)).toEqual(['NUMBER','PLUS','NUMBER','EOF']);
  expect(tokens[0].value).toBe(3);
  expect(tokens[2].value).toBe(4);
});

test('tokenizes √ operator', () => {
  expect(tokenize('√16').map(t=>t.type)).toEqual(['SQRT','NUMBER','EOF']);
});

test('tokenizes ^ operator', () => {
  expect(tokenize('2^10').map(t=>t.type)).toEqual(['NUMBER','POW','NUMBER','EOF']);
});

test('tokenizes decimal number', () => {
  expect(tokenize('3.14')[0].value).toBeCloseTo(3.14);
});

test('tokenizes unary minus sign at start', () => {
  // '-5' → MINUS, NUMBER(5) — parser decides unary vs binary
  const toks = tokenize('-5');
  expect(toks[0].type).toBe('MINUS');
  expect(toks[1].value).toBe(5);
});

test('throws CalcError on unknown character', () => {
  expect(() => tokenize('3 @ 4')).toThrow();
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/calc/lexer.test.js`

- [ ] **Step 3: Implement `tokenize(expr)` in `src/calc/lexer.js`**

Whitelist characters: `0-9`, `.`, `+`, `-`, `*`, `/`, `^`, `√`, `(`, `)`, whitespace.
Map `×` → MUL, `÷` → DIV so the UI can pass display symbols.
Export named class `CalcError extends Error`.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/calc/lexer.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/calc/lexer.js tests/calc/lexer.test.js
git commit -m "feat(calc): lexer with token types and CalcError"
```

---

## Task 3: Parser & AST

**Files:**
- Create: `src/calc/parser.js`
- Create: `tests/calc/parser.test.js`

**Interfaces:**
- Consumes: `tokenize`, `CalcError` from `src/calc/lexer.js`
- Produces:
  - `parse(tokens: Token[]): ASTNode`
  - `ASTNode` shapes:
    - `{ type: 'Number', value: number }`
    - `{ type: 'BinaryOp', op: string, left: ASTNode, right: ASTNode }`
    - `{ type: 'UnaryOp', op: string, operand: ASTNode }` (for unary minus and `√`)
  - Throws `CalcError` for unbalanced parens, incomplete expressions.
  - Grammar (recursive descent):
    ```
    expr    = term (('+' | '-') term)*
    term    = power (('*' | '/') power)*
    power   = unary ('^' unary)*   // right-assoc: parsed right-recursively
    unary   = '-' unary | '√' unary | primary
    primary = NUMBER | '(' expr ')' | implicit-mul
    ```
  - Implicit multiplication: after a closing `)` or a number, if next token is `LPAREN`, insert virtual `MUL`.

- [ ] **Step 1: Write failing tests**

```js
import { tokenize } from '../../src/calc/lexer.js';
import { parse } from '../../src/calc/parser.js';

function parseExpr(str) { return parse(tokenize(str)); }

test('parses simple number', () => {
  expect(parseExpr('42')).toEqual({ type: 'Number', value: 42 });
});

test('parses addition', () => {
  const node = parseExpr('1 + 2');
  expect(node.type).toBe('BinaryOp');
  expect(node.op).toBe('+');
});

test('parses precedence: 2+3*4 gives + at root', () => {
  expect(parseExpr('2+3*4').op).toBe('+');
});

test('parses parentheses override precedence', () => {
  expect(parseExpr('(2+3)*4').op).toBe('*');
});

test('parses right-assoc power: 2^3^2', () => {
  const node = parseExpr('2^3^2');
  // root is ^, right child is also ^
  expect(node.op).toBe('^');
  expect(node.right.op).toBe('^');
});

test('parses unary minus', () => {
  const node = parseExpr('-5');
  expect(node.type).toBe('UnaryOp');
  expect(node.op).toBe('-');
});

test('parses sqrt', () => {
  expect(parseExpr('√16').type).toBe('UnaryOp');
  expect(parseExpr('√16').op).toBe('√');
});

test('implicit multiplication 2(3+4)', () => {
  const node = parseExpr('2(3+4)');
  expect(node.op).toBe('*');
});

test('throws on unbalanced left paren', () => {
  expect(() => parseExpr('(2+3')).toThrow();
});

test('throws on empty expression', () => {
  expect(() => parseExpr('')).toThrow();
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/calc/parser.test.js`

- [ ] **Step 3: Implement `parse(tokens)` in `src/calc/parser.js`**

Recursive descent following the grammar. Right-associative power: in `parsePower`, after consuming left operand and `^`, recurse as `parsePower()` (not `parseUnary()`).

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/calc/parser.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/calc/parser.js tests/calc/parser.test.js
git commit -m "feat(calc): recursive descent parser with AST"
```

---

## Task 4: Evaluator

**Files:**
- Create: `src/calc/evaluator.js`
- Create: `tests/calc/evaluator.test.js`

**Interfaces:**
- Consumes: `ASTNode` from parser; `CalcError` from lexer.
- Produces:
  - `evaluate(node: ASTNode): number` — throws `CalcError` for div-by-zero, sqrt-of-negative, overflow.
  - Result is a raw JS `number`; formatting happens in `src/utils/format.js`.

- [ ] **Step 1: Write failing tests**

```js
import { tokenize } from '../../src/calc/lexer.js';
import { parse } from '../../src/calc/parser.js';
import { evaluate } from '../../src/calc/evaluator.js';

function calc(str) { return evaluate(parse(tokenize(str))); }

test('7 + 5 = 12', () => expect(calc('7+5')).toBe(12));
test('9 - 15 = -6', () => expect(calc('9-15')).toBe(-6));
test('6 * 7 = 42', () => expect(calc('6*7')).toBe(42));
test('20 / 8 = 2.5', () => expect(calc('20/8')).toBe(2.5));
test('2 + 3 * 4 = 14 (precedence)', () => expect(calc('2+3*4')).toBe(14));
test('(2+3)*4 = 20', () => expect(calc('(2+3)*4')).toBe(20));
test('((1+2)*(3+4)) = 21', () => expect(calc('((1+2)*(3+4))')).toBe(21));
test('2^10 = 1024', () => expect(calc('2^10')).toBe(1024));
test('2^3^2 = 512 (right-assoc)', () => expect(calc('2^3^2')).toBe(512));
test('√16 = 4', () => expect(calc('√16')).toBe(4));
test('√2 ≈ 1.4142135624', () => expect(calc('√2')).toBeCloseTo(1.4142135624, 9));
test('-5 + 3 = -2', () => expect(calc('-5+3')).toBe(-2));
test('3 * (-2) = -6', () => expect(calc('3*(-2)')).toBe(-6));
test('2(3+4) = 14 (implicit mul)', () => expect(calc('2(3+4)')).toBe(14));
test('division by zero throws', () => expect(() => calc('5/0')).toThrow());
test('sqrt of negative throws', () => expect(() => calc('√(-4)')).toThrow());
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/calc/evaluator.test.js`

- [ ] **Step 3: Implement `evaluate(node)` in `src/calc/evaluator.js`**

Walk AST recursively. For `BinaryOp` `/`: check divisor === 0 → throw `CalcError('Pembagian dengan nol tidak diizinkan')`. For `UnaryOp` `√`: check operand < 0 → throw `CalcError('Akar dari bilangan negatif tidak terdefinisi')`.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/calc/evaluator.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/calc/evaluator.js tests/calc/evaluator.test.js
git commit -m "feat(calc): AST evaluator with error handling"
```

---

## Task 5: Number Formatter

**Files:**
- Create: `src/utils/format.js`
- Create: `tests/utils/format.test.js`

**Interfaces:**
- Consumes: raw `number` from evaluator.
- Produces:
  - `formatResult(n: number): string` — returns display string.
  - Rules:
    - Max 10 significant digits.
    - Strip trailing zeros after decimal point.
    - `0.1 + 0.2` → `'0.3'` (not `'0.30000000000000004'`).
    - Very large/small numbers use `toExponential()` when `abs > 1e15` or `abs < 1e-7` (and non-zero).
    - `Infinity` or `-Infinity` → throw or return error string (align with evaluator, evaluator should catch div-by-zero before this).

- [ ] **Step 1: Write failing tests**

```js
import { formatResult } from '../../src/utils/format.js';

test('integer stays integer', () => expect(formatResult(42)).toBe('42'));
test('0.1+0.2 rounds to 0.3', () => expect(formatResult(0.1+0.2)).toBe('0.3'));
test('pi truncates to 10 sig digits', () => expect(formatResult(Math.PI)).toBe('3.141592654'));
test('large number uses exponential', () => expect(formatResult(1.23e18)).toMatch(/e/));
test('trailing zeros stripped', () => expect(formatResult(1.50000)).toBe('1.5'));
test('negative number', () => expect(formatResult(-6)).toBe('-6'));
test('zero', () => expect(formatResult(0)).toBe('0'));
test('√2 ≈ 1.414213562', () => expect(formatResult(Math.SQRT2)).toBe('1.414213562'));
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/utils/format.test.js`

- [ ] **Step 3: Implement `formatResult(n)` in `src/utils/format.js`**

Use `n.toPrecision(10)` then `parseFloat()` to strip trailing zeros, then convert back to string. Handle exponential cases with `toExponential(9)` when magnitude exceeds thresholds.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/utils/format.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/utils/format.js tests/utils/format.test.js
git commit -m "feat(utils): number formatter with 10 sig-digit precision"
```

---

## Task 6: Calculator Facade (calc API)

**Files:**
- Create: `src/calc/calculator.js`
- Create: `tests/calc/calculator.test.js`
- Modify: `src/calc/index.js` — re-export `calculate`, `CalcError`

**Interfaces:**
- Consumes: `tokenize` (lexer), `parse` (parser), `evaluate` (evaluator), `formatResult` (format), `CalcError`.
- Produces:
  - `calculate(expr: string): { result: string, error: null } | { result: null, error: string }`
  - On success: `{ result: '14', error: null }`.
  - On error: `{ result: null, error: 'Pesan error dalam bahasa Indonesia' }`.
  - Handles all `CalcError` → error object; unexpected JS errors also caught.

- [ ] **Step 1: Write failing tests**

```js
import { calculate } from '../../src/calc/calculator.js';

test('2+3*4 = 14', () => {
  expect(calculate('2+3*4')).toEqual({ result: '14', error: null });
});
test('(2+3)*4 = 20', () => {
  expect(calculate('(2+3)*4')).toEqual({ result: '20', error: null });
});
test('div by zero returns error', () => {
  const r = calculate('5/0');
  expect(r.error).toBeTruthy();
  expect(r.result).toBeNull();
});
test('empty string returns error', () => {
  expect(calculate(''). error).toBeTruthy();
});
test('sqrt negative returns error', () => {
  expect(calculate('√(-4)').error).toBeTruthy();
});
test('unbalanced paren returns error', () => {
  expect(calculate('(2+3').error).toBeTruthy();
});
test('0.1+0.2 = 0.3', () => {
  expect(calculate('0.1+0.2').result).toBe('0.3');
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/calc/calculator.test.js`

- [ ] **Step 3: Implement `calculate(expr)` in `src/calc/calculator.js`**

Wrap tokenize→parse→evaluate→formatResult in try/catch. Return object literal matching the interface.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/calc/calculator.test.js`

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: all suites pass.

- [ ] **Step 6: Commit**

```bash
git add src/calc/calculator.js src/calc/index.js tests/calc/calculator.test.js
git commit -m "feat(calc): calculator facade — tokenize→parse→evaluate→format"
```

---

## Task 7: History Manager

**Files:**
- Create: `src/ui/history.js`
- Create: `tests/ui/history.test.js`

**Interfaces:**
- Consumes: `localStorage` (accessed via injected storage interface for testability).
- Produces:
  - `createHistoryManager(storage = localStorage): HistoryManager`
  - `HistoryManager.add(entry: { expr: string, result: string }): void` — prepend; cap at 50; persist.
  - `HistoryManager.getAll(): Array<{ expr: string, result: string }>` — newest first.
  - `HistoryManager.clear(): void` — empty list; persist.
  - Key used in storage: `'calc_history'`.

- [ ] **Step 1: Write failing tests**

```js
import { createHistoryManager } from '../../src/ui/history.js';

function mockStorage() {
  const store = {};
  return {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; },
  };
}

test('starts empty', () => {
  expect(createHistoryManager(mockStorage()).getAll()).toEqual([]);
});

test('add one entry', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '2+2', result: '4' });
  expect(h.getAll()).toEqual([{ expr: '2+2', result: '4' }]);
});

test('newest entry is first', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '1+1', result: '2' });
  h.add({ expr: '3+3', result: '6' });
  expect(h.getAll()[0].expr).toBe('3+3');
});

test('capped at 50 items', () => {
  const h = createHistoryManager(mockStorage());
  for (let i = 0; i < 55; i++) h.add({ expr: `${i}+1`, result: `${i+1}` });
  expect(h.getAll().length).toBe(50);
});

test('clear empties history', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '1+1', result: '2' });
  h.clear();
  expect(h.getAll()).toEqual([]);
});

test('persists to storage', () => {
  const s = mockStorage();
  const h = createHistoryManager(s);
  h.add({ expr: '5*5', result: '25' });
  expect(s.getItem('calc_history')).toBeTruthy();
  // reload
  const h2 = createHistoryManager(s);
  expect(h2.getAll()[0].expr).toBe('5*5');
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/ui/history.test.js`

- [ ] **Step 3: Implement `createHistoryManager(storage)` in `src/ui/history.js`**

Initialize by reading `storage.getItem('calc_history')` → `JSON.parse` (default `[]`). `add` unshifts and slices to 50 before `JSON.stringify` back.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/ui/history.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/ui/history.js tests/ui/history.test.js
git commit -m "feat(ui): history manager with localStorage + 50-item cap"
```

---

## Task 8: Input Validator (pre-typing guard)

**Files:**
- Create: `src/ui/inputValidator.js`
- Create: `tests/ui/inputValidator.test.js`

**Interfaces:**
- Consumes: current expression string, incoming character.
- Produces:
  - `canAppend(expr: string, char: string): boolean`
  - Rules (from FR-10, US-08, Open Question decisions):
    - Allowed char whitelist: `0-9`, `.`, `+`, `-`, `*`, `/`, `×`, `÷`, `^`, `√`, `(`, `)`.
    - Two consecutive operators (not `-` after operator for unary minus) → `false`.
    - Two decimal points in the same number token → `false`.
    - Operator at start (except `-` or `√` or `(`) → `false`.
    - Closing `)` when open-paren count would go negative → `false`.

- [ ] **Step 1: Write failing tests**

```js
import { canAppend } from '../../src/ui/inputValidator.js';

test('digit always allowed on empty', () => expect(canAppend('', '5')).toBe(true));
test('operator not allowed as first char (except minus, sqrt, lparen)', () => {
  expect(canAppend('', '+')).toBe(false);
  expect(canAppend('', '-')).toBe(true);
  expect(canAppend('', '√')).toBe(true);
  expect(canAppend('', '(')).toBe(true);
});
test('double operator rejected', () => {
  expect(canAppend('3+', '+')).toBe(false);
  expect(canAppend('3+', '*')).toBe(false);
});
test('minus after operator allowed (unary)', () => {
  expect(canAppend('3+', '-')).toBe(true);
});
test('two decimals in same number rejected', () => {
  expect(canAppend('3.1', '.')).toBe(false);
  expect(canAppend('3.1+2', '.')).toBe(true); // new number token
});
test('closing paren when no open → rejected', () => {
  expect(canAppend('3+4', ')')).toBe(false);
  expect(canAppend('(3+4', ')')).toBe(true);
});
test('unknown char rejected', () => {
  expect(canAppend('3', '@')).toBe(false);
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npm test -- tests/ui/inputValidator.test.js`

- [ ] **Step 3: Implement `canAppend(expr, char)` in `src/ui/inputValidator.js`**

Pure function, no DOM. Track paren balance and "last token type" by scanning `expr` string.

- [ ] **Step 4: Run to verify PASS**

Run: `npm test -- tests/ui/inputValidator.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/ui/inputValidator.js tests/ui/inputValidator.test.js
git commit -m "feat(ui): input validator — prevents invalid char sequences"
```

---

## Task 9: Theme Manager

**Files:**
- Create: `src/ui/theme.js`
- (No test file — purely side-effect DOM/localStorage; tested in browser)

**Interfaces:**
- Consumes: `document`, `localStorage`.
- Produces:
  - `createThemeManager(): ThemeManager`
  - `ThemeManager.init(): void` — reads saved preference or `prefers-color-scheme`; applies `data-theme` attribute to `<html>`.
  - `ThemeManager.toggle(): void` — flips theme, saves to `localStorage` key `'calc_theme'`.
  - `ThemeManager.getCurrent(): 'dark' | 'light'`

- [ ] **Step 1: Implement `src/ui/theme.js`**

On `init`: read `localStorage.getItem('calc_theme')`; fall back to `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`. Set `document.documentElement.setAttribute('data-theme', theme)`. On `toggle`: flip, save, re-apply attribute.

- [ ] **Step 2: Commit**

```bash
git add src/ui/theme.js
git commit -m "feat(ui): theme manager — dark/light with localStorage persistence"
```

---

## Task 10: HTML Entry Point + README

**Files:**
- Create: `index.html`
- Create: `src/ui/app.js` (UI controller wiring keyboard, buttons, display, history panel)
- Create: `src/ui/app.js` — imports `calculate`, `createHistoryManager`, `createThemeManager`, `canAppend`
- Create: `README.md`

**Interfaces:**
- Consumes: all modules from Tasks 2–9.
- Produces: a fully working calculator page. No CSS (UI/UX out of scope for this run).

**Note:** UI/UX (CSS, styling) is explicitly deferred per user instruction. The HTML uses semantic elements and ARIA attributes per NFR. A minimal inline style ensures basic usability (e.g., `display: block` on sections).

- [ ] **Step 1: Create `index.html`**

Semantic structure:
```html
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kalkulator Web</title>
</head>
<body>
  <!-- display area: two lines (expression + result) -->
  <!-- button grid: 0-9, ., +, -, ×, ÷, ^, √, (, ), =, C, ⌫ -->
  <!-- history panel: list + clear button -->
  <!-- theme toggle button -->
  <script type="module" src="src/ui/app.js"></script>
</body>
</html>
```
All interactive elements get `aria-label`. Result area gets `aria-live="polite"`.

- [ ] **Step 2: Create `src/ui/app.js`**

Wire:
1. Import modules.
2. `themeManager.init()`, bind toggle button.
3. `historyManager = createHistoryManager(localStorage)`, render initial history.
4. Expression state: `let expr = ''`.
5. Button clicks: call `canAppend`; if allowed, `expr += char`; update display.
6. `C` → `expr = ''`; `⌫` → `expr = expr.slice(0, -1)`; display update.
7. `=` / `Enter` → `calculate(expr)`; on success: render result, add to history; on error: render error message.
8. Keyboard listener: map keys to button actions; `Escape` = clear, `Backspace` = backspace, `Enter`/`=` = calculate.
9. History click: set `expr = item.result`; update display.
10. History clear button: `historyManager.clear()`; re-render history.

- [ ] **Step 3: Create `README.md`**

Sections: Deskripsi, Fitur, Cara Menjalankan (buka `index.html` di browser), Cara Menjalankan Test (`npm install` then `npm test`), Tech Stack, Keputusan Desain.

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add index.html src/ui/app.js README.md
git commit -m "feat: HTML entry point + UI controller + README"
```
