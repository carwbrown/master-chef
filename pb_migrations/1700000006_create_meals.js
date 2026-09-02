/// <reference path="../pb_data/types.d.ts" />

// Meal assignments: a recipe placed on a day + slot. `notes` holds sides/extras.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "meals",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "date",   type: "date", required: true },
      { name: "slot",   type: "select", maxSelect: 1, required: true, values: ["lunch","dinner"] },
      { name: "recipe", type: "relation",
        collectionId: app.findCollectionByNameOrId("recipes").id, maxSelect: 1, cascadeDelete: false },
      { name: "notes",  type: "text" }, // sides / extras
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("meals"))
})
