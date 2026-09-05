/// <reference path="../pb_data/types.d.ts" />

// Free-text meal name, for meals that aren't a saved recipe (e.g. "carbonara",
// "salmon"). When `recipe` is set it wins; otherwise `title` is the meal name and
// `notes` holds the sides. Legacy rows with only `notes` still render (notes-as-name).
migrate((app) => {
  const c = app.findCollectionByNameOrId("meals")
  c.fields.add(new Field({ id: "meals_title", name: "title", type: "text" }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("meals")
  c.fields.removeByName("title")
  app.save(c)
})
