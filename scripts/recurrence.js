/**
 * Pure recurrence helpers — no PocketBase dependency, easy to reason about/test.
 * An event stores: date (anchor), recur_type, recur_config, recur_until.
 */

export const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Timezone-safe calendar day. Strings are read as their literal YYYY-MM-DD
 *  (PocketBase returns e.g. "2026-08-30 00:00:00.000Z") so a UTC-midnight value
 *  never shifts to the previous day in a US timezone. */
export function ymd(d) {
  if (typeof d === 'string') {
    const [y, m, day] = d.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const sameDay = (a, b) => ymd(a).getTime() === ymd(b).getTime();

/** The nth (1..5, or -1 for last) `weekdayIdx` of the given month. */
export function nthWeekdayDate(year, month, weekdayIdx, nth) {
  if (nth === -1) {
    const last = new Date(year, month + 1, 0);
    const offset = (last.getDay() - weekdayIdx + 7) % 7;
    return new Date(year, month, last.getDate() - offset);
  }
  const first = new Date(year, month, 1);
  const offset = (weekdayIdx - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

/** Does `event` occur on calendar day `date`? */
export function occursOn(event, date) {
  const day = ymd(date);
  const anchor = ymd(event.date);
  if (day < anchor) return false;
  if (event.recur_until) {
    const until = ymd(event.recur_until);
    if (day > until) return false;
  }

  const type = event.recur_type || 'none';
  const cfg = event.recur_config || {};

  if (type === 'none') return sameDay(anchor, day);
  if (type === 'daily') return true;
  if (type === 'weekly') {
    const days = (cfg.days && cfg.days.length) ? cfg.days : [WD[anchor.getDay()]];
    return days.includes(WD[day.getDay()]);
  }
  if (type === 'monthly') {
    const m = cfg.monthly || {};
    if (m.kind === 'day_of_month') return day.getDate() === (m.day || anchor.getDate());
    if (m.kind === 'nth_weekday') {
      const wIdx = WD.indexOf(m.weekday);
      const target = nthWeekdayDate(day.getFullYear(), day.getMonth(), wIdx, m.nth);
      return sameDay(target, day);
    }
    return day.getDate() === anchor.getDate();
  }
  return false;
}
