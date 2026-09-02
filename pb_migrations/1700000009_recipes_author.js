/// <reference path="../pb_data/types.d.ts" />

// Add `author` to recipes so cookbook / site recipes can be attributed.
migrate((app) => {
  const c = app.findCollectionByNameOrId("recipes")
  c.fields.add(new Field({
    id: "recipe_author",
    name: "author",
    type: "text",
  }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("recipes")
  c.fields.removeByName("author")
  app.save(c)
})
