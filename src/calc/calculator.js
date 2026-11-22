/**
 * Public API for the calculator.
 * Wraps tokenize → parse → evaluate → formatResult in one call.
 *
 * @param {string} expr - raw expression string from user input
 * @returns {{ result: string, error: null } | { result: null, error: string }}
 */

import { tokenize, CalcError } from './lexer.js';
import { parse } from './parser.js';
import { evaluate } from './evaluator.js';
import { formatResult } from '../utils/format.js';

export function calculate(expr) {
  try {
    const tokens = tokenize(expr);
    const ast = parse(tokens);
    const value = evaluate(ast);
    return { result: formatResult(value), error: null };
  } catch (err) {
    if (err instanceof CalcError) {
      return { result: null, error: err.message };
    }
    // unexpected JS error — surface generic message, not raw stack
    return { result: null, error: 'Terjadi kesalahan tidak terduga' };
  }
}
