import { formatResult } from '../../src/utils/format.js';

test('integer stays integer', () => expect(formatResult(42)).toBe('42'));
test('0.1+0.2 rounds to 0.3', () => expect(formatResult(0.1 + 0.2)).toBe('0.3'));
test('pi truncates to 10 sig digits', () => expect(formatResult(Math.PI)).toBe('3.141592654'));
test('large number uses exponential', () => expect(formatResult(1.23e18)).toMatch(/e/));
test('trailing zeros stripped', () => expect(formatResult(1.5)).toBe('1.5'));
test('negative number', () => expect(formatResult(-6)).toBe('-6'));
test('zero', () => expect(formatResult(0)).toBe('0'));
test('√2 ≈ 1.414213562', () => expect(formatResult(Math.SQRT2)).toBe('1.414213562'));
test('small number uses exponential', () => expect(formatResult(1.5e-9)).toMatch(/e/));
