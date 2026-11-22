import { calculate } from '../../src/calc/calculator.js';

test('2+3*4 = 14', () => {
  expect(calculate('2+3*4')).toEqual({ result: '14', error: null });
});
test('(2+3)*4 = 20', () => {
  expect(calculate('(2+3)*4')).toEqual({ result: '20', error: null });
});
test('div by zero returns error object', () => {
  const r = calculate('5/0');
  expect(r.error).toBeTruthy();
  expect(r.result).toBeNull();
});
test('empty string returns error', () => {
  expect(calculate('').error).toBeTruthy();
});
test('sqrt of negative returns error', () => {
  expect(calculate('√(-4)').error).toBeTruthy();
});
test('unbalanced paren returns error', () => {
  expect(calculate('(2+3').error).toBeTruthy();
});
test('0.1+0.2 = 0.3', () => {
  expect(calculate('0.1+0.2').result).toBe('0.3');
});
test('2^10 = 1024', () => {
  expect(calculate('2^10').result).toBe('1024');
});
test('2^3^2 = 512 (right-assoc)', () => {
  expect(calculate('2^3^2').result).toBe('512');
});
test('√16 = 4', () => {
  expect(calculate('√16').result).toBe('4');
});
test('-5+3 = -2', () => {
  expect(calculate('-5+3').result).toBe('-2');
});
