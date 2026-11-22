/**
 * Recursive descent parser for the calculator.
 * Grammar:
 *   expr    = term (('+' | '-') term)*
 *   term    = power (('*' | '/') power)*
 *   power   = unary ('^' unary)*   // right-assoc via right-recursion
 *   unary   = '-' unary | '√' unary | primary
 *   primary = NUMBER | '(' expr ')' | implicit-mul
 *
 * Implicit multiplication: `2(3+4)` → `2 * (3+4)`.
 * Throws CalcError for unbalanced parens or incomplete expressions.
 */

import { CalcError } from './lexer.js';

/**
 * @param {{ type: string, value: string|number }[]} tokens
 * @returns {object} AST node
 */
export function parse(tokens) {
  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }

  function expect(type) {
    const tok = peek();
    if (tok.type !== type) {
      throw new CalcError(`Ekspektasi '${type}' tapi menemukan '${tok.type}' (nilai: '${tok.value}')`);
    }
    return consume();
  }

  function parseExpr() {
    let node = parseTerm();
    while (peek().type === 'PLUS' || peek().type === 'MINUS') {
      const op = consume().type === 'PLUS' ? '+' : '-';
      node = { type: 'BinaryOp', op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parsePower();
    while (peek().type === 'MUL' || peek().type === 'DIV') {
      const op = consume().type === 'MUL' ? '*' : '/';
      node = { type: 'BinaryOp', op, left: node, right: parsePower() };
    }
    return node;
  }

  // Right-associative: recurse into parsePower on the right
  function parsePower() {
    const left = parseUnary();
    if (peek().type === 'POW') {
      consume();
      const right = parsePower(); // right-recursive = right-assoc
      return { type: 'BinaryOp', op: '^', left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === 'MINUS') {
      consume();
      return { type: 'UnaryOp', op: '-', operand: parseUnary() };
    }
    if (peek().type === 'SQRT') {
      consume();
      return { type: 'UnaryOp', op: '√', operand: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = peek();

    if (tok.type === 'NUMBER') {
      consume();
      const node = { type: 'Number', value: tok.value };
      // implicit multiplication: `2(...)` → `2 * (...)`
      if (peek().type === 'LPAREN') {
        const right = parsePrimary();
        return { type: 'BinaryOp', op: '*', left: node, right };
      }
      return node;
    }

    if (tok.type === 'LPAREN') {
      consume();
      const node = parseExpr();
      expect('RPAREN');
      // implicit multiplication after closing paren: `(a)(b)` → `(a) * (b)`
      if (peek().type === 'LPAREN') {
        const right = parsePrimary();
        return { type: 'BinaryOp', op: '*', left: node, right };
      }
      return node;
    }

    if (tok.type === 'EOF') {
      throw new CalcError('Ekspresi tidak lengkap atau kosong');
    }

    throw new CalcError(`Token tidak terduga: '${tok.value}'`);
  }

  if (tokens.length === 0 || (tokens.length === 1 && tokens[0].type === 'EOF')) {
    throw new CalcError('Ekspresi kosong');
  }

  const result = parseExpr();

  if (peek().type !== 'EOF') {
    throw new CalcError(`Karakter tidak terduga setelah ekspresi: '${peek().value}'`);
  }

  return result;
}
