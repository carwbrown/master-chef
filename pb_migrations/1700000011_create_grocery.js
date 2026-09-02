/// <reference path="../pb_data/types.d.ts" />

// Grocery lists. One collection, two lists via `list`:
//   staples -> recurring weekly items; `checked` = "send to Instacart" (persist)
//   adhoc   -> one-off trip items; `checked` = "purchased" (cleared in bulk)
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "grocery_items",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "list",    type: "select", required: true, maxSelect: 1, values: ["staples", "adhoc"] },
      { name: "name",    type: "text", required: true },
      { name: "qty",     type: "text" },
      { name: "checked", type: "bool" },
      { name: "sort",    type: "number" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("grocery_items"))
})
