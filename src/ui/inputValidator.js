/**
 * Input validator — decides whether a character can be appended to the
 * current expression string.
 *
 * Rules (from FR-10 + Open Question decisions):
 *   - Allowed whitelist: 0-9, ., +, -, *, /, ×, ÷, ^, √, (, )
 *   - Operator at start → rejected (except -, √, ()
 *   - Two consecutive binary operators → rejected
 *   - Minus after operator → allowed (unary minus)
 *   - Two decimal points in the same number token → rejected
 *   - Closing ) when paren balance would go negative → rejected
 *
 * @param {string} expr - current expression string
 * @param {string} char - single character to append
 * @returns {boolean}
 */

const ALLOWED = new Set([
  '0','1','2','3','4','5','6','7','8','9',
  '.', '+', '-', '*', '/', '×', '÷', '^', '√', '(', ')',
]);

const BINARY_OPS = new Set(['+', '-', '*', '/', '×', '÷', '^', '√']);
// operators that act as binary (not allowed doubled, except - for unary)
const BINARY_ONLY = new Set(['+', '*', '/', '×', '÷', '^']);

function lastMeaningfulChar(expr) {
  for (let i = expr.length - 1; i >= 0; i--) {
    if (expr[i] !== ' ') return expr[i];
  }
  return null;
}

function isOperator(ch) {
  return ch !== null && BINARY_OPS.has(ch);
}

function countDecimals(expr) {
  // count '.' in the current number token (from the right until non-digit/non-dot)
  let count = 0;
  for (let i = expr.length - 1; i >= 0; i--) {
    const ch = expr[i];
    if (ch >= '0' && ch <= '9') continue;
    if (ch === '.') { count++; continue; }
    break; // hit an operator or paren — stop
  }
  return count;
}

function parenBalance(expr) {
  let balance = 0;
  for (const ch of expr) {
    if (ch === '(') balance++;
    else if (ch === ')') balance--;
  }
  return balance;
}

export function canAppend(expr, char) {
  // 1. Whitelist check
  if (!ALLOWED.has(char)) return false;

  const last = lastMeaningfulChar(expr);
  const isEmpty = last === null;

  // 2. Operators not allowed as first character (except -, √, ()
  if (isEmpty) {
    return char === '-' || char === '√' || char === '(' || (char >= '0' && char <= '9') || char === '.';
  }

  // 3. Double binary operator (not -)
  if (BINARY_ONLY.has(char) && isOperator(last)) return false;

  // 4. Closing ) when balance would go negative
  if (char === ')') {
    return parenBalance(expr) > 0;
  }

  // 5. Two decimal points in the same number token
  if (char === '.') {
    return countDecimals(expr) === 0;
  }

  return true;
}
