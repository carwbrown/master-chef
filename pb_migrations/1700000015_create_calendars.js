/// <reference path="../pb_data/types.d.ts" />

// Google Calendar feeds to import events from. `ics_url` is the calendar's
// *Secret address in iCal format* (private). `member` is the default person
// imported events from this feed are assigned to.
migrate((app) => {
  const rule = "@request.auth.id != \"\""
  const c = new Collection({
    type: "base",
    name: "calendars",
    listRule: rule, viewRule: rule, createRule: rule, updateRule: rule, deleteRule: rule,
    fields: [
      { name: "label",   type: "text", required: true },
      { name: "ics_url", type: "text", required: true },   // secret iCal (.ics) address
      { name: "member",  type: "relation",
        collectionId: app.findCollectionByNameOrId("members").id, maxSelect: 1, cascadeDelete: false },
      { name: "active",  type: "bool" },
      { name: "sort",    type: "number" },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("calendars"))
})
