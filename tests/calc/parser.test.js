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

test('parses right-assoc power: 2^3^2 — right child is also ^', () => {
  const node = parseExpr('2^3^2');
  expect(node.op).toBe('^');
  expect(node.right.op).toBe('^');
});

test('parses unary minus', () => {
  const node = parseExpr('-5');
  expect(node.type).toBe('UnaryOp');
  expect(node.op).toBe('-');
});

test('parses sqrt', () => {
  const node = parseExpr('√16');
  expect(node.type).toBe('UnaryOp');
  expect(node.op).toBe('√');
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
