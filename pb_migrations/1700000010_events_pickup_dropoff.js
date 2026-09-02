/// <reference path="../pb_data/types.d.ts" />

// Add optional pickup / dropoff person (relations to members) on events.
migrate((app) => {
  const c = app.findCollectionByNameOrId("events")
  const members = app.findCollectionByNameOrId("members").id
  c.fields.add(new Field({ id: "event_pickup",  name: "pickup",  type: "relation", collectionId: members, maxSelect: 1, cascadeDelete: false }))
  c.fields.add(new Field({ id: "event_dropoff", name: "dropoff", type: "relation", collectionId: members, maxSelect: 1, cascadeDelete: false }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("events")
  c.fields.removeByName("pickup")
  c.fields.removeByName("dropoff")
  app.save(c)
})
