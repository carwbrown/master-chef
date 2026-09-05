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

## Instacart "Shop the recipe" — researched Sep 2026, PARKED (no viable free path for our workflow)
Goal: a "Shop ingredients" / "Send grocery list to cart" button (like Half Baked Harvest's).

**How HBH actually does it:** its button hits **Jupiter** (`jupiter.recipes`), which mints an Instacart
**shopping-list page** — the redirect chain is `…jupiter.recipes/checkout/<uuid>/instacart` →
`instacart.com/store/shopping_lists/<id>`. That page is the output of Instacart's Developer Platform (IDP)
`products_link` / `recipe` endpoints. **Key limit of the whole model:** you can only generate a *hosted
Instacart page the user opens themselves* — there is **no API to push items into an active/existing cart.**

**Why we can't use it (our workflow = Instacart → Food Lion pickup, for free pickup + no % markup):**
- **Instacart IDP** (`POST /idp/v1/products/products_link` or `/recipe`, Bearer API key, base
  `connect.instacart.com`): the right product and *self-serve keys exist in the dashboard* — BUT **new
  Developer Platform applications are currently CLOSED, with no waitlist** (`company.instacart.com/business/developers`).
  Not an email issue; a business email doesn't change it. Revisit only if applications reopen — it would then
  support Food Lion pickup exactly.
- **Food Lion / Ahold Delhaize** add-to-cart exists only via **SmartCommerce (Click2Cart) / Pear Commerce /
  Chicory** — all brand/publisher, contact-sales, not self-serve, not for a private app.
- **Jupiter** = free but a *creator-website* product (publish recipes on their monetizable site); no embeddable
  API for a private app. **Chicory** (`chicory.co`) = free "Recipe Activation" tier but publisher-only,
  manual approval. Neither fits a private family hub.
- **Kroger API** is the *only* free, self-serve, real add-to-cart (`cart.basic:write`, OAuth2; adds to the
  user's cart, can't remove on the free tier) and it **covers Harris Teeter** (a Kroger banner) — but we avoid
  Harris Teeter for cost, so it doesn't match our shopping.

**Conclusion:** keep grocery/staples as a checklist. Cheap conveniences if wanted: a "Copy list" button, or a
deep link to the Food Lion storefront. Reassess if Instacart reopens IDP.

## PWA (installable / offline) — deferred, but assessed
**How hard: the "installable" version is easy; full offline is hard.**
- **Easy (roughly half a day):** add a `manifest.json` (name, icons, `display: standalone`, theme color) + app icons, and a basic service worker that caches the app shell (HTML/CSS/JS + theme). Result: installs to the iPad/phone home screen, launches full-screen, loads instantly, works while online. HTTPS is already in place (Netlify + prod backend), which PWAs require.
- **Hard:** true offline use — caching PocketBase API responses, and especially **offline writes with sync** (queueing edits made while offline and reconciling on reconnect). This is real complexity and only worth it if the wall/iPad is regularly offline.
- **Recommendation when we do it:** ship the easy installable version first (manifest + shell cache); treat offline data as a separate, later effort.
