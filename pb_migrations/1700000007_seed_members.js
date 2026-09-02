/// <reference path="../pb_data/types.d.ts" />

// Seed the five family members with muted, black-text-a11y-safe colors.
migrate((app) => {
  const members = app.findCollectionByNameOrId("members")
  const seed = [
    ["Carson", "#93B8DE", true],
    ["Breck",  "#BEDBBF", true],
    ["Fisher", "#CFE6F2", false],
    ["Miles",  "#E9BABA", false],
    ["Hayden", "#EFC6DD", false],
  ]
  seed.forEach(([name, color, is_parent], i) => {
    const r = new Record(members)
    r.set("name", name)
    r.set("color", color)
    r.set("is_parent", is_parent)
    r.set("sort", i)
    app.save(r)
  })
}, (app) => {
  const members = app.findCollectionByNameOrId("members")
  app.findRecordsByFilter("members", "id != ''").forEach((r) => app.delete(r))
})
