/// <reference path="../pb_data/types.d.ts" />

// Family members (people) for assignment + colors.
// Distinct from `users` (login accounts): kids are members but not logins.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "members",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "name",      type: "text", required: true },
      { name: "color",     type: "text", required: true }, // hex, e.g. "#93B8DE"
      { name: "is_parent", type: "bool" },
      { name: "sort",      type: "number" },
      { name: "user",      type: "relation",               // optional link to a login
        collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1, cascadeDelete: false },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("members"))
})
