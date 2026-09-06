# Multi-Family (Multi-Tenant) Plan

> Status: **planning only** — no code written yet. Captures the agreed design so we can build it deliberately, ideally before more production data accumulates.

## Goal
Let multiple families each use master-chef with a fully **private** hub. **Only recipes are shared** across all families; everything else is per-family.

## Private vs shared

| Per-family (private) | Shared (global) |
|---|---|
| `members` (kids + parents), `events` (schedule), `tasks` (kids' chores / "kids today"), `adult_tasks`, `meals` (meal plan), `grocery_items`, `calendars` + `gcal_skips` (Google Calendar setup) | **`recipes`** — one library everyone draws from |

`scores` (legacy gaming) is out of scope — leave per-user or drop.

## 1. Data model changes
- **New `families` collection** (the tenant): `name`, `owner` (relation → users), timestamps.
- **`users`** (logins) gains:
  - `family` (relation → families) — each login belongs to exactly one family.
  - `is_superadmin` (bool) — gates the family-management console (true for `carwbrown@gmail.com`).
  - `timezone` (text, e.g. `America/New_York`) — **per-user**, editable on the Settings page; used for Google Calendar parsing/display.
- **Add `family` (relation → families) to every private collection**: `members`, `events`, `tasks`, `adult_tasks`, `meals`, `grocery_items`, `calendars`, `gcal_skips`.
- **`recipes` stays global** (no `family` field). Add `owner` (relation → users, keep-on-delete) for "uploaded by" and edit scoping.
- Kids remain `members` with no login (unchanged). Multiple logins can share one family (e.g. `carwbrown@` + `breck.fisher@`).

## 2. Security core — PocketBase API rules
Rules filter rows server-side, so the frontend can't leak data across families. This is the highest-risk part; a wrong rule = one family sees another's data. **Must be tested with two real families.**

For each **private** collection:
- list / view / update / delete: `@request.auth.family = family`
- create: `@request.auth.family = @request.data.family` (can only write into your own family)

For **`recipes`** (shared):
- list / view: `@request.auth.id != ""` (any logged-in user reads all)
- create: `@request.auth.id != ""`
- update / delete: `@request.auth.id != "" && owner = @request.auth.id` (only the uploader) — pending decision, could be "any logged-in user"

## 3. Onboarding — super-admin family-management console
Provisioning is done by the super-admin (`carwbrown@gmail.com`) through an in-app console, not the PocketBase admin UI.

**The console can:**
- Create a **family** (name).
- **Tie emails to a family** (one or many emails per family).
- **Create logins with generated passwords** — generate a strong password per adult email, reveal it **once** to copy and hand off (passwords are hashed; "generate/reset" = set new + reveal once). Kids get no login.
- List families + their emails; reset a password; move an email to another family.
- **Delete a family** — cascade-deletes all its private data (members, events, chores, meals, grocery, calendars, gcal_skips). Recipes always survive.

**Why it needs a privileged backend:** a normal logged-in user — even the super-admin — **cannot create users or set their passwords from the browser**; in PocketBase only a **superuser** can. So the console calls a **Netlify function** (reusing the functions surface added for gcal) that:
1. Holds PocketBase **superuser credentials** in server-side env vars (never in the browser).
2. Verifies **server-side** that the caller is the super-admin (validates their auth token → user → `is_superadmin`), and refuses everyone else.
3. Performs the privileged ops with the superuser token and returns any generated password once.

The `admin.html` page is also hidden from non-admins on the frontend, but the real gate is the server-side check + superuser creds living only in the function.

## 4. Frontend changes
- Read the logged-in user's family once (`pb.authStore.record.family`) and **stamp `family` onto every create**: events, tasks, adult_tasks, meals, grocery_items, members, calendars, gcal_skips (~8 places, incl. `sync.html`'s event creation and `settings.html`).
- **Reads mostly "just work"** once rules scope by family — existing `getFullList` calls return only your family's rows.
- The gcal **function** needs no tenant logic (it only parses an .ics; the page assigns the family). It takes the caller's `timezone` as a parameter (from the user's Settings), defaulting to `America/New_York`.
- **Settings page** gains a per-user **timezone** picker (used by the gcal import), alongside the existing People + Calendars management.

## 5. Data migration (one-time)
1. Create your **"Family 1"** record.
2. Backfill `family = Family 1` on all existing `members`, `events`, `tasks`, `adult_tasks`, `meals`, `grocery_items`, `calendars`, `gcal_skips`, and on the existing logins (`carwbrown@gmail.com`, `breck.fisher@gmail.com`).
3. Set `is_superadmin = true` on `carwbrown@gmail.com`.
4. Recipes untouched (stay global); set `owner` where derivable.

Doing this **now, with one family, is clean** — much harder once more families join.

## 6. Recipes-shared specifics
- Global read for all logged-in users (the list already fetches all recipes).
- `owner` (user) enables author-only edit/delete; anyone can add.
- Recipes must **not** cascade-delete when a user or family is removed (shared library survives) → `owner` uses keep-on-delete.
- "Uploaded by" will show names across families (pending decision).
- Future per-user recipe ratings/notes would be scoped by user — cross-family-safe.

## 7. Effort & sequencing
Medium-large but well-bounded. Phases:
1. **Decisions** (open questions below).
2. **Schema + migration** — `families`, `users.family`/`is_superadmin`, `family` on 8 collections, `recipes.owner`, backfill to Family 1.
3. **API rules** — scope all private collections; recipes global.
4. **Frontend** — stamp `family` on every create.
5. **Admin console** — `admin.html` + privileged Netlify function (superuser creds, caller verification).
6. **Test isolation** with a second family (critical).
Later: billing if it becomes SaaS; per-user recipe ratings.

## Decisions (resolved)
1. **Recipe edit rights:** owner-only — anyone can add a recipe, only its `owner` (uploader) can edit/delete.
2. **Billing:** none — free.
3. **Cross-family authorship:** show **first names** on recipe "uploaded by".
4. **Timezone:** a **per-user** setting on the Settings page (not per-family); the gcal function receives it as a parameter, defaulting to `America/New_York`.
5. **Deleting a family:** supported in the admin console — cascade-deletes the family's private data; recipes survive.
6. **Super-admin gate:** an `is_superadmin` flag on the user (not a hardcoded email).
7. **Password delivery:** reveal-on-creation (shown once) in the console; no email/SMTP.

_All planning questions resolved — ready to convert into a phased build plan when we start._
