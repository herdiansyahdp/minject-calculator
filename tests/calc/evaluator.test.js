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
