import { canAppend } from '../../src/ui/inputValidator.js';

test('digit always allowed on empty', () => expect(canAppend('', '5')).toBe(true));

test('operator not allowed as first char (except minus, sqrt, lparen)', () => {
  expect(canAppend('', '+')).toBe(false);
  expect(canAppend('', '*')).toBe(false);
  expect(canAppend('', '-')).toBe(true);
  expect(canAppend('', '√')).toBe(true);
  expect(canAppend('', '(')).toBe(true);
});

test('double binary operator rejected', () => {
  expect(canAppend('3+', '+')).toBe(false);
  expect(canAppend('3+', '*')).toBe(false);
  expect(canAppend('3*', '/')).toBe(false);
});

test('minus after operator allowed (unary)', () => {
  expect(canAppend('3+', '-')).toBe(true);
  expect(canAppend('3*', '-')).toBe(true);
});

test('two decimals in same number rejected', () => {
  expect(canAppend('3.1', '.')).toBe(false);
});

test('decimal allowed in new number after operator', () => {
  expect(canAppend('3.1+2', '.')).toBe(true);
  expect(canAppend('3.1+', '.')).toBe(true);
});

test('closing paren when no open → rejected', () => {
  expect(canAppend('3+4', ')')).toBe(false);
  expect(canAppend('', ')')).toBe(false);
});

test('closing paren when open paren exists → allowed', () => {
  expect(canAppend('(3+4', ')')).toBe(true);
});

test('unknown char rejected', () => {
  expect(canAppend('3', '@')).toBe(false);
  expect(canAppend('3', '!')).toBe(false);
});

test('√ allowed mid-expression (prefix)', () => {
  expect(canAppend('2+', '√')).toBe(true);
});
