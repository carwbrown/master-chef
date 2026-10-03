/**
 * Recipe quantity scaling — the single shared helper so every surface scales
 * amounts identically. Parses the first quantity (single value or "x to y"
 * range) in an ingredient line and multiplies it, keeping the rest of the text.
 */

// Decimal → friendly fraction string ("1.5" → "1 1/2", "0.5" → "1/2").
const FRAC = {
  0.25: '1/4', 0.33: '1/3', 0.34: '1/3', 0.5: '1/2', 0.66: '2/3', 0.67: '2/3',
  0.75: '3/4', 0.2: '1/5', 0.13: '1/8', 0.38: '3/8', 0.63: '5/8', 0.88: '7/8',
};
export function decToFrac(n) {
  if (n == null) return '';
  const whole = Math.floor(n), frac = +(n - whole).toFixed(2), f = FRAC[frac];
  if (frac === 0) return String(whole);
  if (f) return whole === 0 ? f : `${whole} ${f}`;
  return String(n);
}

const UNI = { '½': .5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': .25, '¾': .75, '⅛': .125,
              '⅜': .375, '⅝': .625, '⅞': .875, '⅕': .2, '⅖': .4, '⅗': .6, '⅘': .8 };

function parseNum(t) {
  t = String(t).trim();
  if (UNI[t] != null) return UNI[t];
  let m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/); if (m) return +m[1] + (+m[2]) / (+m[3]); // 1 1/2
  m = t.match(/^(\d+)\s*([½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘])$/); if (m) return +m[1] + UNI[m[2]];       // 1½
  m = t.match(/^(\d+)\/(\d+)$/); if (m) return (+m[1]) / (+m[2]);                      // 1/2
  return parseFloat(t);
}

const NUM = '\\d+\\s+\\d+\\/\\d+|\\d+\\s*[½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘]|\\d+\\/\\d+|\\d*\\.?\\d+|[½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘]';
const QTY = new RegExp(`(${NUM})(\\s*(?:to|–|-)\\s*(${NUM}))?`);

/**
 * Scale the first quantity in `raw` by `factor`. Only the first number scales,
 * so "1 (24-ounce) jar" keeps the can size. Lines with no number are unchanged.
 */
export function scaleQty(raw, factor = 1) {
  if (!raw || factor === 1) return raw;
  return raw.replace(QTY, (full, a, _range, b) => {
    const sa = decToFrac(+(parseNum(a) * factor).toFixed(3));
    return b != null ? `${sa} to ${decToFrac(+(parseNum(b) * factor).toFixed(3))}` : sa;
  });
}

// Measurement units we scale inside step text. Deliberately volume/weight only —
// NOT minutes, seconds, inches, or degrees, so times/temps/pan sizes never scale.
const UNITS = 'cups?|tablespoons?|tbsps?\\.?|teaspoons?|tsps?\\.?|ounces?|oz\\.?|pounds?|lbs?\\.?' +
              '|grams?|kg|ml|milliliters?|liters?|sticks?|cloves?|cans?|jars?|pinch(?:es)?|handfuls?';
const MEAS = new RegExp(`(${NUM})(\\s*(?:to|–|-)\\s*(${NUM}))?(\\s+)(${UNITS})\\b`, 'gi');

/**
 * Scale every "number + measurement-unit" amount in a block of step text, in
 * place. A number not directly followed by a scalable unit (a temperature,
 * time, length, or bare count) is left untouched.
 */
export function scaleMeasures(text, factor = 1) {
  if (!text || factor === 1) return text;
  return text.replace(MEAS, (full, a, _range, b, sp, unit) => {
    const sa = decToFrac(+(parseNum(a) * factor).toFixed(3));
    const scaled = b != null ? `${sa} to ${decToFrac(+(parseNum(b) * factor).toFixed(3))}` : sa;
    return `${scaled}${sp}${unit}`;
  });
}
