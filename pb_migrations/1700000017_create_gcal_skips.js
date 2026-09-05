/// <reference path="../pb_data/types.d.ts" />

// "Skip" list for the Google Calendar sync view. `key` is the feed's
// per-occurrence key (same format as events.source_uid). A skipped event is
// hidden from the upcoming list so it doesn't keep reappearing.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "gcal_skips",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "key",     type: "text", required: true },   // "<UID>::YYYY-MM-DD"
      { name: "summary", type: "text" },                    // kept for reference / undo UI
      { name: "created", type: "autodate", onCreate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_gcal_skips_key ON gcal_skips (key)"],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("gcal_skips"))
})
