/// <reference path="../pb_data/types.d.ts" />

// Multi-tenant fields:
//  - a `family` relation on every per-family collection (scopes data to a household)
//  - `family`, `is_superadmin`, `timezone` on users (logins)
//  - `owner` (user) on recipes, for owner-only edit of the shared recipe library
// No API rules change here — scoping is enabled in a later migration once the
// frontend stamps `family` on new records.
const FAMILY_COLLECTIONS = ["members", "events", "tasks", "adult_tasks", "meals", "grocery_items", "calendars", "gcal_skips"]

migrate((app) => {
  const families = app.findCollectionByNameOrId("families").id
  const users = app.findCollectionByNameOrId("users").id

  for (const name of FAMILY_COLLECTIONS) {
    const c = app.findCollectionByNameOrId(name)
    c.fields.add(new Field({ name: "family", type: "relation", collectionId: families, maxSelect: 1, cascadeDelete: false }))
    app.save(c)
  }

  const u = app.findCollectionByNameOrId("users")
  u.fields.add(new Field({ name: "family",        type: "relation", collectionId: families, maxSelect: 1, cascadeDelete: false }))
  u.fields.add(new Field({ name: "is_superadmin", type: "bool" }))
  u.fields.add(new Field({ name: "timezone",      type: "text" }))   // per-user; feeds the gcal import
  app.save(u)

  const r = app.findCollectionByNameOrId("recipes")
  r.fields.add(new Field({ name: "owner", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false }))
  app.save(r)
}, (app) => {
  for (const name of FAMILY_COLLECTIONS) {
    const c = app.findCollectionByNameOrId(name); c.fields.removeByName("family"); app.save(c)
  }
  const u = app.findCollectionByNameOrId("users")
  for (const f of ["family", "is_superadmin", "timezone"]) u.fields.removeByName(f)
  app.save(u)
  const r = app.findCollectionByNameOrId("recipes"); r.fields.removeByName("owner"); app.save(r)
})
