/// <reference path="../pb_data/types.d.ts" />

// Disable public signup: only superusers may create user accounts.
// The two family logins (Carson, Breck) are created by hand in the admin UI.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  users.createRule = null
  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")
  users.createRule = ""
  app.save(users)
})
