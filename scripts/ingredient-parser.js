/**
 * Best-effort parse of a raw ingredient line into { amount, unit, name }.
 * Used to auto-fill the structured fields in the recipe editor.
 */
const UNITS = new Set([
  'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp',
  'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs', 'gram', 'grams', 'g', 'kg', 'ml', 'l',
  'clove', 'cloves', 'can', 'cans', 'stick', 'sticks', 'slice', 'slices', 'pinch', 'handful',
  'package', 'packages', 'pkg', 'bunch', 'sprig', 'sprigs', 'head', 'heads',
]);
const FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };

function parseAmount(str) {
  str = str.trim();
  if (FRAC[str] != null) return FRAC[str];
  if (/\s/.test(str)) { const [w, f] = str.split(/\s+/); return (Number(w) || 0) + parseAmount(f); }
  if (str.includes('/')) { const [a, b] = str.split('/'); return +(Number(a) / Number(b)).toFixed(2); }
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export function parseIngredient(raw) {
  const s = (raw || '').trim();
  let amount = null, rest = s;

  // leading amount: "1 1/2", "1/2", "1.5", "2", or a unicode fraction
  const m = s.match(/^(\d+\s+\d\/\d|\d+\/\d|\d*\.?\d+|[½¼¾⅓⅔⅛⅜⅝⅞])\s*/);
  if (m) { amount = parseAmount(m[1]); rest = s.slice(m[0].length); }

  // unit (only if it's a known cooking unit)
  let unit = null;
  const um = rest.match(/^([a-zA-Z]+)\.?\s+/);
  if (um && UNITS.has(um[1].toLowerCase())) { unit = um[1].toLowerCase(); rest = rest.slice(um[0].length); }

  // name: the rest up to the first comma (drops prep notes like ", minced")
  const name = rest.split(',')[0].trim().toLowerCase();
  return { amount, unit, name };
}
