/// <reference path="../pb_data/types.d.ts" />

// Add `done_date` to tasks so recurring chores reset per day:
// a daily/weekly task is "done" only on the date it was checked.
migrate((app) => {
  const c = app.findCollectionByNameOrId("tasks")
  c.fields.add(new Field({
    id: "task_done_date",
    name: "done_date",
    type: "date",
  }))
  app.save(c)
}, (app) => {
  const c = app.findCollectionByNameOrId("tasks")
  c.fields.removeByName("done_date")
  app.save(c)
})
