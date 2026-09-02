/**
 * Importer: pushes recipes/*.json into the PocketBase `recipes` collection.
 *
 * Reads a .env file (repo root) with: PB_URL_DEV, PB_URL_PROD, PB_EMAIL, PB_PASSWORD.
 *
 * Usage:
 *   npm run import:dev     # imports to PB_URL_DEV  (local)
 *   npm run import:prod    # imports to PB_URL_PROD (production)
 * Or directly:
 *   node scripts/import-recipes.mjs dev
 *   node scripts/import-recipes.mjs prod
 * Env vars set in the shell still override .env, e.g. PB_URL=... node scripts/import-recipes.mjs
 *
 * Auth is your PocketBase ADMIN (superuser) account — the same email/password you
 * use for the admin UI at /_/. Superusers can write to any collection.
 *
 * By default this is CREATE-ONLY: a recipe whose title already exists is SKIPPED,
 * so recipes you've edited in the app are never overwritten. Re-running only adds
 * brand-new recipe files. Pass --force to overwrite existing recipes from their
 * JSON (a deliberate re-seed): `node scripts/import-recipes.mjs prod --force`.
 *
 * Requires Node 18+ (built-in fetch). No dependencies.
 */
import { readdir, readFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load .env from repo root (simple parser; shell env vars take precedence).
(function loadEnv() {
  const p = join(root, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const args = process.argv.slice(2);
const force = args.includes('--force');
const target = (args.find(a => !a.startsWith('--')) || 'dev').toLowerCase();
const PB_URL = process.env.PB_URL
  || (target === 'prod' ? process.env.PB_URL_PROD : process.env.PB_URL_DEV)
  || 'http://127.0.0.1:8090';
const EMAIL = process.env.PB_EMAIL;
const PASSWORD = process.env.PB_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Missing PB_EMAIL / PB_PASSWORD (set them in .env — your PocketBase admin account).');
  process.exit(1);
}
console.log(`Importing to ${target.toUpperCase()}: ${PB_URL}${force ? '  (FORCE: overwriting existing)' : ''}`);

const recipesDir = join(root, 'recipes');

async function main() {
  // 1. Authenticate as a superuser (admin).
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  });
  if (!authRes.ok) {
    console.error('Auth failed:', authRes.status, await authRes.text());
    process.exit(1);
  }
  const { token } = await authRes.json();
  const authHeaders = { 'Content-Type': 'application/json', Authorization: token };

  // 2. Read local recipe files.
  const files = (await readdir(recipesDir)).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} recipe files in recipes/`);

  let created = 0, updated = 0, skipped = 0, failed = 0;
  for (const file of files) {
    let recipe;
    try { recipe = JSON.parse(await readFile(join(recipesDir, file), 'utf8')); }
    catch (e) { console.warn(`  ✗ ${file}: bad JSON (${e.message})`); failed++; continue; }

    // Look up an existing recipe by title.
    const q = new URLSearchParams({ filter: `title="${recipe.title.replace(/"/g, '\\"')}"`, perPage: '1' });
    const existing = await fetch(`${PB_URL}/api/collections/recipes/records?${q}`, { headers: authHeaders });
    const existingData = await existing.json();

    let res, verb;
    if (existingData.totalItems > 0) {
      if (!force) { console.log(`  • skip (exists — in-app edits preserved): ${recipe.title}`); skipped++; continue; }
      const id = existingData.items[0].id;
      res = await fetch(`${PB_URL}/api/collections/recipes/records/${id}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify(recipe),
      });
      verb = 'overwrote';
    } else {
      res = await fetch(`${PB_URL}/api/collections/recipes/records`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(recipe),
      });
      verb = 'created';
    }
    if (res.ok) { console.log(`  ✓ ${verb}: ${recipe.title}`); verb === 'created' ? created++ : updated++; }
    else { console.warn(`  ✗ ${recipe.title}: ${res.status} ${await res.text()}`); failed++; }
  }

  console.log(`\nDone. Created ${created}, ${force ? 'overwrote' : 'skipped-existing'} ${force ? updated : skipped}, failed ${failed}.`);
}

main().catch(e => { console.error(e); process.exit(1); });
