/**
 * Importer: pushes scripts/events-data.mjs into the PocketBase `events` collection.
 *
 * Reads .env (repo root): PB_URL_DEV, PB_URL_PROD, PB_EMAIL, PB_PASSWORD (admin/superuser).
 *
 * Usage:
 *   node scripts/import-events.mjs dev       # local
 *   node scripts/import-events.mjs prod      # production
 *   node scripts/import-events.mjs prod --dry # print what would be created, write nothing
 *
 * CREATE-ONLY + idempotent: an event with the same title AND date is skipped, so
 * re-running never duplicates. Requires Node 18+ (built-in fetch). No dependencies.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { events } from './events-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

(function loadEnv() {
  const p = join(root, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    if (!(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const target = (args.find(a => !a.startsWith('--')) || 'dev').toLowerCase();
const PB_URL = process.env.PB_URL
  || (target === 'prod' ? process.env.PB_URL_PROD : process.env.PB_URL_DEV)
  || 'http://127.0.0.1:8090';
const EMAIL = process.env.PB_EMAIL;
const PASSWORD = process.env.PB_PASSWORD;

if (!dry && (!EMAIL || !PASSWORD)) {
  console.error('Missing PB_EMAIL / PB_PASSWORD (set them in .env — your PocketBase admin account).');
  process.exit(1);
}

const toPBDate = (v) => `${v} 00:00:00.000Z`;
const q = (s) => String(s).replace(/"/g, '\\"');

async function main() {
  console.log(`Importing ${events.length} events to ${target.toUpperCase()}: ${PB_URL}${dry ? '  (DRY RUN)' : ''}`);
  if (dry) {
    for (const e of events) console.log(`  · ${e.date} ${e.start_time || 'all day'}  ${e.title}  [${e.member}]`);
    console.log(`\nDry run — nothing written. ${events.length} events.`);
    return;
  }

  // 1. Authenticate as superuser.
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  });
  if (!authRes.ok) { console.error('Auth failed:', authRes.status, await authRes.text()); process.exit(1); }
  const { token } = await authRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: token };

  // 2. Resolve member names -> ids.
  const memRes = await fetch(`${PB_URL}/api/collections/members/records?perPage=200`, { headers });
  const members = (await memRes.json()).items || [];
  const idByName = Object.fromEntries(members.map(m => [m.name, m.id]));

  let created = 0, skipped = 0, failed = 0;
  for (const e of events) {
    const memberId = idByName[e.member];
    if (!memberId) { console.warn(`  ✗ ${e.title}: no member named "${e.member}"`); failed++; continue; }

    // Dedupe on title + date.
    const filter = encodeURIComponent(`title="${q(e.title)}" && date="${toPBDate(e.date)}"`);
    const dupRes = await fetch(`${PB_URL}/api/collections/events/records?perPage=1&filter=${filter}`, { headers });
    if (((await dupRes.json()).totalItems || 0) > 0) { console.log(`  • skip (exists): ${e.date} ${e.title}`); skipped++; continue; }

    const body = {
      title: e.title,
      notes: e.notes || '',
      date: toPBDate(e.date),
      all_day: false,
      start_time: e.start_time || '',
      end_time: e.end_time || '',
      member: memberId,
      recur_type: 'none',
      recur_config: {},
      recur_until: '',
    };
    const res = await fetch(`${PB_URL}/api/collections/events/records`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.ok) { console.log(`  ✓ ${e.date} ${e.title}`); created++; }
    else { console.warn(`  ✗ ${e.title}: ${res.status} ${await res.text()}`); failed++; }
  }

  console.log(`\nDone. Created ${created}, skipped-existing ${skipped}, failed ${failed}.`);
}

main().catch(e => { console.error(e); process.exit(1); });
