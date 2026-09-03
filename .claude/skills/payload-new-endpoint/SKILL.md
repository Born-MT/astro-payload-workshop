---
name: payload-new-endpoint
description: Scaffold a Payload custom endpoint — a REST handler on a collection, global, or the root config, with auth checks, transaction-safe Local API calls, and typed responses. Use when the generated CRUD API isn't enough.
argument-hint: "<METHOD> <path> (e.g. POST /subscribe, or GET /posts/:id/related)"
---

# Scaffold a Payload Endpoint

Create the endpoint `$1 $2`. **Load the `payload` skill and its `reference/ENDPOINTS.md` first**; add `reference/QUERIES.md` for the data access and `reference/ADAPTERS.md#transactions` for anything that writes.

1. **Do you need it?** Payload already generates full REST and GraphQL CRUD per collection, with rich `where` operators. Custom endpoints are for genuinely custom behaviour — a webhook receiver, a third-party callback, an aggregate, a multi-step action. If the generated API plus a `where` query covers it, say so and stop rather than adding surface area.

2. **Placement** — decide where it belongs and mirror that in the path:
   - Collection-scoped (`endpoints` on the collection config) → mounted under `/api/<collection-slug>$2`.
   - Global-scoped → under that global.
   - Root (`endpoints` on `buildConfig`) → `/api$2`, for things that belong to no single collection.

3. **Handler** — add `{ path: '$2', method: '<lowercased $1>', handler: async (req) => { ... } }`:
   - **Authenticate explicitly.** `req.user` is populated but nothing enforces it — an endpoint that forgets to check is public. Reject unauthenticated or unauthorised callers up front with the right status.
   - **Validate the input.** Parse and validate body and params before use; never trust `req.body` shape.
   - **Respect access control.** Local API calls default to `overrideAccess: true`, which bypasses your collection rules. When acting on behalf of the caller, pass `{ user: req.user, overrideAccess: false }`.
   - **Thread `req`** through every `payload.*` call so the work joins the surrounding transaction and rolls back together.
   - Return `Response.json(...)` with an accurate status.

4. **Register** — add it to the `endpoints` array in the right config, and export types for the request/response shape so callers aren't guessing.

5. **Verify.** Boot the dev server and exercise it: the happy path, an invalid payload (expect a 4xx from validation, not a 500), an unauthenticated request (expect 401/403), and — if it writes — confirm a mid-way failure leaves no partial data. Report the mounted path, auth rule, and an example curl.
