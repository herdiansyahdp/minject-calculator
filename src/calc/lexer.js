/**
 * Lexer for the calculator.
 * Tokenizes an infix expression string into an array of Token objects.
 *
 * Token shape: { type: string, value: string | number }
 * Token types: NUMBER, PLUS, MINUS, MUL, DIV, POW, SQRT, LPAREN, RPAREN, EOF
 */

export class CalcError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CalcError';
  }
}

/**
 * @param {string} expr
 * @returns {{ type: string, value: string|number }[]}
 */
export function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }

    // Number (integer or decimal)
    if (ch >= '0' && ch <= '9' || ch === '.') {
      let numStr = '';
      while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9' || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      continue;
    }

    // Single-character operators and symbols
    switch (ch) {
      case '+':
        tokens.push({ type: 'PLUS', value: '+' });
        i++;
        continue;
      case '-':
        tokens.push({ type: 'MINUS', value: '-' });
        i++;
        continue;
      case '*':
        tokens.push({ type: 'MUL', value: '*' });
        i++;
        continue;
      case '/':
        tokens.push({ type: 'DIV', value: '/' });
        i++;
        continue;
      case '×':
        tokens.push({ type: 'MUL', value: '×' });
        i++;
        continue;
      case '÷':
        tokens.push({ type: 'DIV', value: '÷' });
        i++;
        continue;
      case '^':
        tokens.push({ type: 'POW', value: '^' });
        i++;
        continue;
      case '√':
        tokens.push({ type: 'SQRT', value: '√' });
        i++;
        continue;
      case '(':
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      case ')':
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      default:
        throw new CalcError(`Unrecognised character: '${ch}' at position ${i}`);
    }
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}
