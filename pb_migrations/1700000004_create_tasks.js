/// <reference path="../pb_data/types.d.ts" />

// Task/chore items. Each kid's list = all tasks where member = that kid.
// recur_config JSON: weekly -> { "days": ["mon","wed"] }
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "tasks",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "member", type: "relation", required: true,
        collectionId: app.findCollectionByNameOrId("members").id, maxSelect: 1, cascadeDelete: true },
      { name: "title",  type: "text", required: true },
      { name: "done",   type: "bool" },
      { name: "recur_type",   type: "select", maxSelect: 1, values: ["none","daily","weekly"] },
      { name: "recur_config", type: "json", maxSize: 2000 },
      { name: "sort",   type: "number" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("tasks"))
})
