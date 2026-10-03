/**
 * admin-families — privileged family/user management for the super-admin console.
 *
 * The browser CANNOT create users or set passwords; only a PocketBase superuser
 * can. So this function holds the superuser login (PB_EMAIL / PB_PASSWORD env
 * vars, set in Netlify) and, on every request, FIRST verifies the caller is a
 * super-admin (validates THEIR token → checks is_superadmin) before doing
 * anything privileged. Uses the PB REST API over fetch (no SDK dependency).
 *
 * POST { action, ... } with header  Authorization: <caller's PocketBase token>
 *   list                                      -> { families, users }
 *   createFamily { name }                     -> { family }
 *   createUser   { email, familyId, isSuperadmin? } -> { user, password }  (password shown once)
 *   resetPassword{ userId }                   -> { password }              (shown once)
 *   setUserFamily{ userId, familyId }         -> { ok }
 *   deleteFamily { familyId }                 -> { ok, deleted, detachedUsers }
 */
const PB_URL = (process.env.PB_URL || process.env.PB_URL_PROD || 'https://mcc-pb.carwbrown.com').replace(/\/$/, '');
const EMAIL = process.env.PB_EMAIL;
const PASSWORD = process.env.PB_PASSWORD;
const FAMILY_COLLECTIONS = ['members', 'events', 'tasks', 'adult_tasks', 'meals', 'grocery_items', 'calendars', 'gcal_skips'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: CORS });

function genPassword() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64').replace(/[+/=]/g, '').slice(0, 16);
}

async function pb(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;
  const r = await fetch(`${PB_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!r.ok) throw new Error(data?.message || `${r.status} ${text}`);
  return data;
}

const q = (s) => encodeURIComponent(s);

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!EMAIL || !PASSWORD) return json({ error: 'Server is missing PB_EMAIL / PB_PASSWORD env vars.' }, 500);

  // 1) Verify the caller is a super-admin, using THEIR token.
  const callerToken = (req.headers.get('authorization') || '').trim();
  if (!callerToken) return json({ error: 'Not signed in.' }, 401);
  let caller;
  try { caller = (await pb('/api/collections/users/auth-refresh', { method: 'POST', token: callerToken })).record; }
  catch { return json({ error: 'Invalid session.' }, 401); }
  if (!caller?.is_superadmin) return json({ error: 'Not authorized.' }, 403);

  // 2) Authenticate as the PocketBase superuser for privileged operations.
  let adminToken;
  try { adminToken = (await pb('/api/collections/_superusers/auth-with-password', { method: 'POST', body: { identity: EMAIL, password: PASSWORD } })).token; }
  catch (e) { return json({ error: 'Server admin auth failed: ' + e.message }, 500); }
  const T = { token: adminToken };

  let body; try { body = await req.json(); } catch { return json({ error: 'Bad JSON body.' }, 400); }

  try {
    switch (body.action) {
      case 'list': {
        const families = (await pb('/api/collections/families/records?perPage=200&sort=name', T)).items;
        const users = (await pb('/api/collections/users/records?perPage=500&fields=id,email,family,is_superadmin', T)).items;
        return json({ families, users });
      }
      case 'createFamily': {
        const name = String(body.name || '').trim();
        if (!name) return json({ error: 'Family name required.' }, 400);
        return json({ family: await pb('/api/collections/families/records', { method: 'POST', body: { name }, ...T }) });
      }
      case 'createUser': {
        const email = String(body.email || '').trim().toLowerCase();
        if (!email) return json({ error: 'Email required.' }, 400);
        const password = genPassword();
        const user = await pb('/api/collections/users/records', {
          method: 'POST',
          body: { email, password, passwordConfirm: password, family: body.familyId || null, is_superadmin: !!body.isSuperadmin, verified: true, emailVisibility: true },
          ...T,
        });
        return json({ user: { id: user.id, email: user.email }, password });
      }
      case 'resetPassword': {
        if (!body.userId) return json({ error: 'userId required.' }, 400);
        const password = genPassword();
        await pb(`/api/collections/users/records/${body.userId}`, { method: 'PATCH', body: { password, passwordConfirm: password }, ...T });
        return json({ password });
      }
      case 'setUserFamily': {
        if (!body.userId) return json({ error: 'userId required.' }, 400);
        await pb(`/api/collections/users/records/${body.userId}`, { method: 'PATCH', body: { family: body.familyId || null }, ...T });
        return json({ ok: true });
      }
      case 'deleteFamily': {
        const fid = body.familyId;
        if (!fid) return json({ error: 'familyId required.' }, 400);
        let deleted = 0;
        for (const col of FAMILY_COLLECTIONS) {
          for (;;) {
            const page = await pb(`/api/collections/${col}/records?perPage=200&filter=${q(`family="${fid}"`)}`, T);
            for (const rec of page.items) { await pb(`/api/collections/${col}/records/${rec.id}`, { method: 'DELETE', ...T }); deleted++; }
            if (page.items.length < 200) break;
          }
        }
        // Detach logins from the family (don't delete the accounts).
        const users = (await pb(`/api/collections/users/records?perPage=500&filter=${q(`family="${fid}"`)}`, T)).items;
        for (const u of users) await pb(`/api/collections/users/records/${u.id}`, { method: 'PATCH', body: { family: null }, ...T });
        await pb(`/api/collections/families/records/${fid}`, { method: 'DELETE', ...T });
        return json({ ok: true, deleted, detachedUsers: users.length });
      }
      default:
        return json({ error: 'Unknown action: ' + body.action }, 400);
    }
  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
};
