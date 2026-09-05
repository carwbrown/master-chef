/// <reference path="../pb_data/types.d.ts" />

// Shared household to-do list for the adults. No member relation — one list for
// the whole family (distinct from `tasks`, which is per-kid chores).
// `done_at` records when an item was checked, so the UI can move items that have
// been done for more than 3 days into a separate "Done" tab.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "adult_tasks",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "title",   type: "text", required: true },
      { name: "done",    type: "bool" },
      { name: "done_at", type: "date" },   // set when checked, cleared when unchecked
      { name: "sort",    type: "number" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("adult_tasks"))
})
