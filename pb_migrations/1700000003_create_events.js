/// <reference path="../pb_data/types.d.ts" />

// Calendar events, optionally assigned to a member, with recurrence.
// recur_config JSON holds only what recur_type needs:
//   weekly  -> { "days": ["mon","wed","fri"] }
//   monthly -> { "monthly": { "kind": "day_of_month", "day": 15 } }
//           or { "monthly": { "kind": "nth_weekday", "nth": 3, "weekday": "wed" } }  // nth:-1 = last
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "events",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "title",        type: "text", required: true },
      { name: "notes",        type: "text" },
      { name: "date",         type: "date", required: true },  // anchor / first occurrence day
      { name: "all_day",      type: "bool" },
      { name: "start_time",   type: "text" },                  // "HH:MM"
      { name: "end_time",     type: "text" },                  // "HH:MM"
      { name: "member",       type: "relation",
        collectionId: app.findCollectionByNameOrId("members").id, maxSelect: 1, cascadeDelete: false },
      { name: "recur_type",   type: "select", maxSelect: 1, values: ["none","daily","weekly","monthly"] },
      { name: "recur_config", type: "json", maxSize: 2000 },
      { name: "recur_until",  type: "date" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("events"))
})
