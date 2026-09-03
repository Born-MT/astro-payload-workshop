---
name: payload-new-collection
description: Scaffold a Payload collection — fields, access control, hooks, admin config, registration in payload.config.ts, generated types, and a migration. Access control defaults to closed, because an unset access rule is a public collection.
argument-hint: "<name> (plural kebab-case slug, e.g. posts or case-studies)"
---

# Scaffold a Payload Collection

Create the collection `$1`. **Load the `payload` skill and its `reference/COLLECTIONS.md` first**; add `reference/FIELDS.md` when the fields are non-trivial and `reference/ACCESS-CONTROL.md` before writing any access rule.

1. **Collection file** — `src/collections/<PascalName>.ts` exporting a `CollectionConfig`:
   - `slug: '$1'` (must match the filename's intent and stay stable — changing a slug later is a data migration).
   - `admin: { useAsTitle: <a real text field>, defaultColumns: [...] }` — without `useAsTitle` the admin list shows opaque IDs.
   - `fields: [...]` — ask for the fields if they weren't provided. Reach for the documented helpers rather than hand-rolling: `slugField()` for slugs, `virtual: true` + a field-level `afterRead` hook for computed values, `join` fields for reverse relationships, and `admin.condition` for conditional display.

2. **Access control — decide explicitly.** Payload's default is permissive, so an omitted rule publishes the collection. State `read`, `create`, `update` and `delete` even when the answer is "admins only". Ask who should reach this data; for row-level rules return a query constraint rather than a boolean, per `reference/ACCESS-CONTROL.md`.

3. **Hooks — only if needed.** `beforeChange` for derived/stamped values, `beforeValidate` for normalisation, `afterChange` for side effects such as Next revalidation. Anything that writes back through Payload must guard against re-entry with a `req.context` check (`reference/HOOKS.md#context`), and must thread `req` so it joins the surrounding transaction.

4. **Drafts and uploads** — if this content needs a publish workflow add `versions: { drafts: true }`; if it stores files make it an upload collection instead of bolting a file field on.

5. **Register** — add the import and the entry to `collections` in `src/payload.config.ts`. An unregistered collection silently doesn't exist.

6. **Types and schema — both steps:**
   ```bash
   payload generate:types     # refresh the generated TS types
   payload migrate:create <name>   # Postgres/SQLite only; MongoDB needs no migration
   ```
   Never rely on `push: true` against a shared database.

7. **Verify.** Boot the dev server, confirm the collection appears in the admin panel, create one document through the panel, and confirm the generated type is exported and typechecks. Report the slug, fields, access rules, and the migration filename.
