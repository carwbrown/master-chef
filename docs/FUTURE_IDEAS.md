# Future Ideas (deferred — not building now)

A parking lot for larger directions. None of these are scheduled; captured so we don't lose them.

## Multi-tenant / multi-family (biggest architectural change)
Turn the app from a single-family hub into a product multiple families can use.
- New `families` (tenant) collection; every user belongs to a family.
- Add a `family` relation to `members`, `events`, `tasks`, `meals` (and per-user data).
- API rules scope every read/write to the requesting user's family.
- Onboarding: create-a-family flow, invite members.
- **Effort: large.** Touches the whole data model, all API rules, and auth. Best done deliberately, ideally before there's much production data to migrate.

## Shared recipe library
- Recipes become shared across families (a global library) rather than per-family, OR a mix: global "official" recipes + a family's private ones.
- Decouples recipes from the tenant scoping above (recipes stay global; everything else is per-family).

## Per-user recipe ratings & notes
- New `recipe_ratings` collection: `user`, `recipe`, `stars` (1–5), optional `notes`.
- Show average rating on the recipe list/cards; let each user rate independently.
- Pairs naturally with the shared recipe library.

## Meal-prep enrichments
- Assign meal-prep entries to specific days (the week planner is the first step), and optionally to specific people/kids.
- Link tasks to meals ("thaw chicken", "prep salad") and to kids.

## Monetization (SaaS)
- Charge other families ~$2–3/month.
- Requires: per-family subscription state, a billing integration (e.g. Stripe), and gating access when unpaid.
- Depends on multi-tenant being in place first.

## Instacart "Shop the recipe" (deferred)
Add a button on the cook view that pushes the ingredient list to an Instacart cart (like Half Baked Harvest).
- Needs **Instacart Developer Platform** access + an API key, plus a small serverless function to turn the
  ingredients into an Instacart shopping list / recipe link.
- Feasible if Instacart approves developer access; the integration itself is modest.

## PWA (installable / offline) — deferred, but assessed
**How hard: the "installable" version is easy; full offline is hard.**
- **Easy (roughly half a day):** add a `manifest.json` (name, icons, `display: standalone`, theme color) + app icons, and a basic service worker that caches the app shell (HTML/CSS/JS + theme). Result: installs to the iPad/phone home screen, launches full-screen, loads instantly, works while online. HTTPS is already in place (Netlify + prod backend), which PWAs require.
- **Hard:** true offline use — caching PocketBase API responses, and especially **offline writes with sync** (queueing edits made while offline and reconciling on reconnect). This is real complexity and only worth it if the wall/iPad is regularly offline.
- **Recommendation when we do it:** ship the easy installable version first (manifest + shell cache); treat offline data as a separate, later effort.
