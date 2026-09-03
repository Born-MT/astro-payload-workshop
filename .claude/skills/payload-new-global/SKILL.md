---
name: payload-new-global
description: Scaffold a Payload global — a single-document config object such as site settings, navigation, or a footer, with access control and registration. Use for content that exists exactly once, where a collection would be wrong.
argument-hint: "<name> (kebab-case slug, e.g. site-settings or main-navigation)"
---

# Scaffold a Payload Global

Create the global `$1`. **Load the `payload` skill first**; add `reference/ACCESS-CONTROL.md` before writing the access rules.

1. **Is a global right?** Globals hold exactly one document — site settings, a header, a footer, a single navigation tree. If there could ever be more than one of these, use a collection instead (`/payload-new-collection`). Confirm before scaffolding, because converting a global into a collection later is a data migration.

2. **Global file** — `src/globals/<PascalName>.ts` exporting a `GlobalConfig`:
   - `slug: '$1'`.
   - `fields: [...]` — ask for the fields if they weren't provided. Group related fields (`type: 'group'`) or use tabs so the editing screen stays navigable; globals accumulate fields fast.
   - `admin: { group: ... }` if the project groups admin nav.

3. **Access control — set it explicitly.** `read` is usually public for something like site settings that the frontend fetches, but `update` must be restricted. Don't leave either implicit; Payload's default is permissive.

4. **Versioning** — add `versions: { drafts: true }` if editors need to stage changes to this global before publishing.

5. **Register** — add the import and entry to `globals` in `src/payload.config.ts`.

6. **Types and schema** — `payload generate:types`, then `payload migrate:create <name>` for Postgres/SQLite.

7. **Consume it** — show the frontend fetch: `payload.findGlobal({ slug: '$1' })` via the Local API, cached appropriately for the framework. If the frontend caches aggressively, add an `afterChange` hook that revalidates — with a `req.context` guard so it can't loop (`reference/HOOKS.md#context`).

8. **Verify.** Boot the dev server, confirm the global appears in the admin panel and saves, and confirm the frontend reads the value. Report the slug, fields, access rules, and where it's consumed.
