/// <reference path="../pb_data/types.d.ts" />

// Multi-tenant: the `families` collection (one per household). Reads are allowed
// for any logged-in user (so the app can show its own family name); writes are
// superuser-only for now — families are provisioned through the admin console
// (a Netlify function acting as a PocketBase superuser), not by regular users.
migrate((app) => {
  const read = "@request.auth.id != \"\""
  const users = app.findCollectionByNameOrId("users").id
  const c = new Collection({
    type: "base",
    name: "families",
    listRule: read, viewRule: read,
    createRule: null, updateRule: null, deleteRule: null,   // superuser-only
    fields: [
      { name: "name",  type: "text", required: true },
      { name: "owner", type: "relation", collectionId: users, maxSelect: 1, cascadeDelete: false },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(c)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("families"))
})
