/// <reference path="../pb_data/types.d.ts" />

// Seed the first family and tag all existing data to it. Idempotent: safe to
// re-run (skips rows that already have a family). Assigns the two known logins,
// flags carwbrown@gmail.com as super-admin, and backfills every per-family row.
const FAMILY_NAME = "Brown Family - 214 Selwyn"
const SUPERADMIN_EMAIL = "carwbrown@gmail.com"
const FAMILY_COLLECTIONS = ["members", "events", "tasks", "adult_tasks", "meals", "grocery_items", "calendars", "gcal_skips"]

migrate((app) => {
  const families = app.findCollectionByNameOrId("families")

  // Find-or-create the family.
  let fam = null
  try { fam = app.findFirstRecordByFilter("families", "name = {:n}", { n: FAMILY_NAME }) } catch (e) {}
  if (!fam) {
    fam = new Record(families)
    fam.set("name", FAMILY_NAME)
    app.save(fam)
  }
  const famId = fam.id

  // Logins → family; super-admin flag; family owner.
  const users = app.findRecordsByFilter("users", "id != ''")
  for (const u of users) {
    if (!u.get("family")) u.set("family", famId)
    if (u.get("email") === SUPERADMIN_EMAIL) {
      u.set("is_superadmin", true)
      if (!fam.get("owner")) { fam.set("owner", u.id); app.save(fam) }
    }
    app.save(u)
  }

  // Backfill family on every existing per-family row.
  for (const name of FAMILY_COLLECTIONS) {
    for (const rec of app.findRecordsByFilter(name, "id != ''")) {
      if (!rec.get("family")) { rec.set("family", famId); app.save(rec) }
    }
  }
}, (app) => {
  for (const name of FAMILY_COLLECTIONS) {
    for (const rec of app.findRecordsByFilter(name, "id != ''")) { rec.set("family", ""); app.save(rec) }
  }
  try {
    const fam = app.findFirstRecordByFilter("families", "name = {:n}", { n: FAMILY_NAME })
    if (fam) app.delete(fam)
  } catch (e) {}
})
