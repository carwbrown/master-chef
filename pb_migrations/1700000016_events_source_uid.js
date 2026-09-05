/// <reference path="../pb_data/types.d.ts" />

// Tracks where an event came from when imported from a Google Calendar feed.
// Holds the feed's per-occurrence key (e.g. "<UID>::2026-09-09") so re-syncing
// the same calendar never creates a duplicate. Blank for hand-made events.
migrate((app) => {
  const c = app.findCollectionByNameOrId("events")
  c.fields.add(new Field({ id: "events_source_uid", name: "source_uid", type: "text" }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("events")
  c.fields.removeByName("source_uid")
  app.save(c)
})
