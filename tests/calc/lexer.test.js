import { tokenize, CalcError } from '../../src/calc/lexer.js';

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
  const toks = tokenize('-5');
  expect(toks[0].type).toBe('MINUS');
  expect(toks[1].value).toBe(5);
});

test('throws CalcError on unknown character', () => {
  expect(() => tokenize('3 @ 4')).toThrow();
});

test('maps × to MUL and ÷ to DIV', () => {
  expect(tokenize('3×4').map(t=>t.type)).toEqual(['NUMBER','MUL','NUMBER','EOF']);
  expect(tokenize('8÷2').map(t=>t.type)).toEqual(['NUMBER','DIV','NUMBER','EOF']);
});

test('tokenizes parentheses', () => {
  expect(tokenize('(2+3)').map(t=>t.type)).toEqual(['LPAREN','NUMBER','PLUS','NUMBER','RPAREN','EOF']);
});
