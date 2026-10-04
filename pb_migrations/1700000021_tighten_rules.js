/// <reference path="../pb_data/types.d.ts" />

// Phase 2b — enforce multi-tenant isolation. First re-tag any stragglers
// (records created between the 2a backfill and the frontend family-stamping,
// plus set recipe owners), THEN tighten every API rule so each family only
// sees/edits its own data. Recipes stay a shared library (global read, add by
// anyone, edit/delete by the owner only).
//
// IMPORTANT: deploy only AFTER the family-stamping frontend is live (it is), or
// new creates would fail the createRule.
const FAMILY_COLLECTIONS = ["members", "events", "tasks", "adult_tasks", "meals", "grocery_items", "calendars", "gcal_skips"]
const FAMILY_NAME = "Brown Family - 214 Selwyn"
const OWNER_EMAIL = "carwbrown@gmail.com"

const SCOPED = {
  listRule:   '@request.auth.id != "" && @request.auth.family = family',
  viewRule:   '@request.auth.id != "" && @request.auth.family = family',
  createRule: '@request.auth.id != "" && @request.auth.family = @request.body.family',
  updateRule: '@request.auth.id != "" && @request.auth.family = family',
  deleteRule: '@request.auth.id != "" && @request.auth.family = family',
}

migrate((app) => {
  // 1) Re-tag any per-family rows still missing a family.
  let fam = null
  try { fam = app.findFirstRecordByFilter("families", "name = {:n}", { n: FAMILY_NAME }) } catch (e) {}
  if (fam) {
    for (const name of FAMILY_COLLECTIONS) {
      for (const rec of app.findRecordsByFilter(name, 'family = ""')) { rec.set("family", fam.id); app.save(rec) }
    }
  }

  // 2) Give ownerless recipes an owner (the super-admin) so owner-only edit works.
  try {
    const owner = app.findFirstRecordByFilter("users", "email = {:e}", { e: OWNER_EMAIL })
    if (owner) for (const r of app.findRecordsByFilter("recipes", 'owner = ""')) { r.set("owner", owner.id); app.save(r) }
  } catch (e) {}

  // 3) Scope every per-family collection to the requester's family.
  for (const name of FAMILY_COLLECTIONS) {
    const c = app.findCollectionByNameOrId(name)
    Object.assign(c, SCOPED)
    app.save(c)
  }

  // 4) families — a user sees only their own family (writes stay superuser-only).
  const families = app.findCollectionByNameOrId("families")
  families.listRule = '@request.auth.id != "" && id = @request.auth.family'
  families.viewRule = '@request.auth.id != "" && id = @request.auth.family'
  app.save(families)

  // 5) recipes — shared library: anyone logged in reads/adds; only the owner edits/deletes.
  const recipes = app.findCollectionByNameOrId("recipes")
  recipes.listRule = '@request.auth.id != ""'
  recipes.viewRule = '@request.auth.id != ""'
  recipes.createRule = '@request.auth.id != ""'
  recipes.updateRule = '@request.auth.id != "" && owner = @request.auth.id'
  recipes.deleteRule = '@request.auth.id != "" && owner = @request.auth.id'
  app.save(recipes)
}, (app) => {
  // Down — reopen rules (does not un-tag data).
  const open = '@request.auth.id != ""'
  const reopen = { listRule: open, viewRule: open, createRule: open, updateRule: open, deleteRule: open }
  for (const name of [...FAMILY_COLLECTIONS, "recipes"]) {
    const c = app.findCollectionByNameOrId(name); Object.assign(c, reopen); app.save(c)
  }
  const families = app.findCollectionByNameOrId("families")
  families.listRule = open; families.viewRule = open
  families.createRule = null; families.updateRule = null; families.deleteRule = null
  app.save(families)
})
