/// <reference path="../pb_data/types.d.ts" />

// Optional free-text "who's watching" on an event (babysitter, grandparent, etc.).
// Left blank on most events; shown on the day/week views only when filled.
migrate((app) => {
  const c = app.findCollectionByNameOrId("events")
  c.fields.add(new Field({ id: "event_caregiver", name: "caregiver", type: "text" }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("events")
  c.fields.removeByName("caregiver")
  app.save(c)
})
