/**
 * Fall 2026 events to import: soccer (Miles = NCFCY Santos, Fisher = RAL ITB Red Bulls)
 * and chorus (Fisher). Transcribed from the schedule screenshots — REVIEW before importing.
 *
 * Times are 24h "HH:MM"; dates "YYYY-MM-DD"; `member` is a name the importer resolves to an id.
 * All are one-off events (recur_type none) so holiday gaps are exact.
 *   node scripts/import-events.mjs dev|prod
 */

const santosPractice = (date) =>
  ({ title: 'Santos practice', member: 'Miles', date, start_time: '17:00', end_time: '18:15', notes: 'Eastgate Park MP - C' });
const redBullsPractice = (date, end = '18:40') =>
  ({ title: 'Red Bulls practice', member: 'Fisher', date, start_time: '17:30', end_time: end, notes: 'Method Road 1 - A' });
const game = (title, member, date, start_time, place) =>
  ({ title, member, date, start_time, notes: place });

export const events = [
  // ---------- September 2026 ----------
  santosPractice('2026-09-09'),
  redBullsPractice('2026-09-09', '19:00'),
  game('Santos vs TFA Teal', 'Miles', '2026-09-12', '11:45', 'Wake Stone Athletic Park 1 D · Arrive by 11:15 AM'),
  game('Red Bulls vs RAL ITB Racers', 'Fisher', '2026-09-12', '15:15', 'Kiwanis Park 2 · Arrive by 3:00 PM'),
  santosPractice('2026-09-14'),
  redBullsPractice('2026-09-14'),
  santosPractice('2026-09-16'),
  game('Red Bulls vs RAL ITB Red Vipers', 'Fisher', '2026-09-19', '11:30', 'Kiwanis Park 2 · Arrive by 11:15 AM'),
  game('Santos vs NCFCY WF United Blue', 'Miles', '2026-09-20', '14:15', 'Wake Stone Athletic Park 1 C · Arrive by 1:45 PM'),
  santosPractice('2026-09-21'),
  redBullsPractice('2026-09-21'),
  santosPractice('2026-09-23'),
  game('Red Bulls @ Garner Gators', 'Fisher', '2026-09-26', '11:30', 'Centennial Park 1 · Arrive by 11:15 AM'),
  game('Santos @ NCFCY WF United White', 'Miles', '2026-09-27', '14:15', 'Heritage HS 4 A · Arrive by 1:45 PM'),
  game('Red Bulls vs Garner Geckos', 'Fisher', '2026-09-27', '16:45', 'Kiwanis Park 1 · Arrive by 4:30 PM'),
  santosPractice('2026-09-28'),
  redBullsPractice('2026-09-28'),
  santosPractice('2026-09-30'),

  // ---------- October 2026 ----------
  game('Red Bulls @ Garner Golden Hawks', 'Fisher', '2026-10-03', '10:15', 'Centennial Park 1 · Arrive by 10:00 AM'),
  game('Santos @ FWSC United Lightning', 'Miles', '2026-10-03', '11:30', 'Heritage HS 4 B · Arrive by 11:00 AM'),
  game('Santos vs NCFCY Fluminense', 'Miles', '2026-10-04', '13:00', 'WRAL Soccer Park 15 A · Arrive by 12:30 PM'),
  santosPractice('2026-10-05'),
  redBullsPractice('2026-10-05'),
  santosPractice('2026-10-07'),
  santosPractice('2026-10-12'),
  redBullsPractice('2026-10-12'),
  santosPractice('2026-10-14'),
  game('Red Bulls @ RAL ITB Panthers', 'Fisher', '2026-10-17', '12:45', 'Kiwanis Park 2 · Arrive by 12:30 PM'),
  game('Santos @ NCFCY Internacional', 'Miles', '2026-10-18', '16:15', 'WRAL Soccer Park 15 B · Arrive by 3:45 PM'),
  santosPractice('2026-10-19'),
  redBullsPractice('2026-10-19'),
  santosPractice('2026-10-21'),
  game('Red Bulls vs RAL ITB Republic', 'Fisher', '2026-10-24', '15:15', 'Kiwanis Park 2 · Arrive by 3:00 PM'),
  game('Santos vs NCFCY Palmeiras', 'Miles', '2026-10-25', '14:15', 'Wake Stone Athletic Park 1 C · Arrive by 1:45 PM'),
];

// ---------- Chorus (Fisher) — Wednesdays 4:15–5:15 PM ----------
const CHORUS_DATES = [
  '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30',
  '2026-10-07', '2026-10-14', '2026-10-21', '2026-10-28',
  '2026-11-04', '2026-11-18',                                 // Nov 11 was canceled
  '2026-12-02', '2026-12-09', '2026-12-16',
  '2027-01-13', '2027-01-20', '2027-01-27',
  '2027-02-03', '2027-02-10', '2027-02-17', '2027-02-24',
  '2027-03-03', '2027-03-17', '2027-03-24',
  '2027-04-07', '2027-04-14', '2027-04-21', '2027-04-28',
  '2027-05-05', '2027-05-12',
];
for (const date of CHORUS_DATES) {
  events.push({ title: 'Chorus practice', member: 'Fisher', date, start_time: '16:15', end_time: '17:15' });
}
events.push({ title: 'Chorus concert', member: 'Fisher', date: '2026-12-15', start_time: '18:15', end_time: '19:15', notes: 'Concert' });
