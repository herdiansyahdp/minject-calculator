/**
 * Formats a raw number for display.
 * Rules:
 *   - Max 10 significant digits
 *   - Trailing zeros stripped
 *   - 0.1+0.2 → '0.3' (floating-point rounding artefact suppressed)
 *   - Very large (abs > 1e15) or very small (abs < 1e-7, non-zero) → exponential
 */

/**
 * @param {number} n
 * @returns {string}
 */
export function formatResult(n) {
  if (!isFinite(n)) {
    // evaluator should catch div-by-zero before here, but guard anyway
    return n > 0 ? 'Infinity' : '-Infinity';
  }

  const abs = Math.abs(n);

  // exponential range
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-7)) {
    // strip trailing zeros from mantissa, keep 'e+N' notation
    return n.toExponential(9).replace(/\.?0+(e)/, '$1');
  }

  // toPrecision(10) then strip trailing zeros via parseFloat
  return String(parseFloat(n.toPrecision(10)));
}
