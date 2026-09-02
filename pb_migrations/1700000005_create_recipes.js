/// <reference path="../pb_data/types.d.ts" />

// Recipes. ingredients/instructions/tags stored as JSON to match the
// recipe-to-json skill output.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "recipes",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "title",        type: "text", required: true },
      { name: "source_url",   type: "url" },
      { name: "ingredients",  type: "json", maxSize: 200000 }, // [{raw,amount,unit,name}]
      { name: "instructions", type: "json", maxSize: 200000 }, // [{step,text}]
      { name: "prep_time",    type: "text" },
      { name: "cook_time",    type: "text" },
      { name: "servings",     type: "number" },
      { name: "tags",         type: "json", maxSize: 5000 },   // ["italian","quick"]
      { name: "image",        type: "file", maxSelect: 1, maxSize: 5242880 },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("recipes"))
})
