'use strict';

// Minimal java.math.BigDecimal stand-in for the values the Gosu rules and record builders handle.
// Values are kept as strings so the scale (e.g. "610.00") survives into log lines as BigDecimal.toString() would.

const DECIMAL_RE = /^([+-])?(\d+)(?:\.(\d+))?$/;

class NumberFormatError extends Error {
  constructor(value) {
    super(`Character array is missing "exponent" mark 'e' or 'E'. (NumberFormatException for ${JSON.stringify(value)})`);
    this.name = 'NumberFormatException';
  }
}

function parse(value) {
  if (value === null || value === undefined) return null;
  const s = typeof value === 'number' ? String(value) : value;
  if (typeof s !== 'string') {
    const err = new Error(`ClassCastException: ${typeof value} cannot be cast to java.math.BigDecimal`);
    err.name = 'ClassCastException';
    throw err;
  }
  const m = DECIMAL_RE.exec(s.trim());
  if (!m) throw new NumberFormatError(value);
  const frac = m[3] || '';
  let unscaled = BigInt(m[2] + frac);
  if (m[1] === '-') unscaled = -unscaled;
  return { unscaled, scale: frac.length, text: s.trim() };
}

function rescale(d, scale) {
  return d.unscaled * 10n ** BigInt(scale - d.scale);
}

/** BigDecimal.compareTo semantics: -1, 0, 1. Null is not accepted. */
function compare(a, b) {
  const da = typeof a === 'object' ? a : parse(a);
  const db = typeof b === 'object' ? b : parse(b);
  const scale = Math.max(da.scale, db.scale);
  const x = rescale(da, scale);
  const y = rescale(db, scale);
  return x === y ? 0 : x > y ? 1 : -1;
}

/** n.movePointRight(2).setScale(0, RoundingMode.HALF_UP) as a BigInt. */
function toCentsHalfUp(value) {
  const d = typeof value === 'object' ? value : parse(value);
  if (d.scale <= 2) return d.unscaled * 10n ** BigInt(2 - d.scale);
  const divisor = 10n ** BigInt(d.scale - 2);
  const neg = d.unscaled < 0n;
  const abs = neg ? -d.unscaled : d.unscaled;
  let q = abs / divisor;
  const r = abs % divisor;
  if (r * 2n >= divisor) q += 1n; // HALF_UP rounds ties away from zero
  return neg ? -q : q;
}

/** BigDecimal.toString() of the parsed value (plain notation for the values used here). */
function toText(value) {
  if (value === null || value === undefined) return null;
  return typeof value === 'object' ? value.text : parse(value).text;
}

module.exports = { parse, compare, toCentsHalfUp, toText, NumberFormatError };
