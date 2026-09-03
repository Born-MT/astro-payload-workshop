---
name: payload-setup
description: Scaffold Payload CMS into an existing Next.js app or repository — install, wire the config and admin route, choose a database adapter, run the first migration, and verify the admin panel boots. Use when adding a CMS to a project that already exists.
argument-hint: "[directory, e.g. apps/cms — default: the Next.js app, or apps/cms in a monorepo]"
---

# Add Payload CMS to an Existing Project

Install and wire Payload into this repository at `$1`, leaving existing code working. **Load the `payload` skill first** — it carries the config, collection and access-control patterns this command assumes.

1. **Pick the target.** If `$1` was given, use it. Otherwise find the Next.js app (a `next.config.*` alongside a `next` dependency). Payload 3 is Next-native and mounts *inside* a Next app, so prefer installing into the existing one over creating a parallel app. In a monorepo with no Next app, scaffold `apps/cms` and say so. If a `payload.config.*` already exists anywhere in the target, report that it's already a Payload project and stop.

2. **Install.** `payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, and one database adapter (below). Match the Payload major to the installed Next major, and **pin every `@payloadcms/*` package to the same exact version** — mismatched minors across those packages are a known source of cryptic admin build failures.

3. **Choose the adapter — ask, don't assume:**
   - `@payloadcms/db-postgres` — the default choice for relational data and required if the team needs real migrations.
   - `@payloadcms/db-mongodb` — schemaless, no migration step.
   - `@payloadcms/db-sqlite` — local/simple deployments.
   Reuse a Postgres service the repo already declares (check `docker-compose.yml`) rather than adding a second one. Set `DATABASE_URI` and `PAYLOAD_SECRET` in the app's `.env` — generate the secret, never invent a placeholder, and never commit `.env` (the kit's hooks block it).

4. **Config** — create `src/payload.config.ts`: `buildConfig({ secret, db: <adapter>, editor: lexicalEditor(), collections: [Users, Media], typescript: { outputFile } })`. Start with an auth collection (`Users`) and an upload collection (`Media`); see `reference/COLLECTIONS.md` for both shapes.

5. **Admin route** — add the Payload route group so the panel mounts: `src/app/(payload)/` with the layout, admin pages and API routes from `@payloadcms/next`, plus `withPayload()` wrapping the export in `next.config.*`. Keep the existing app's routes in their own group so nothing collides.

6. **Types and schema** — `payload generate:types` (wire it as a `generate:types` script). For Postgres, set `push: false` and create the initial migration with `payload migrate:create` — do **not** ship `push: true` to a shared or production database.

7. **Verify — do not skip.** Start the dev server, confirm `/admin` loads, create the first user through the panel, and confirm the generated types file exists and typechecks. Then stop the server. Report the adapter chosen, the env vars the team must set, and the migration workflow.

8. **Refresh the kit** — re-run `claude-kit --update --stack .` from the repo root so the payload stack's skills install for every future session.

Day-to-day work then uses `/payload-new-collection`, `/payload-new-block`, `/payload-new-global`, `/payload-new-endpoint` and `/payload-migrate`. Migrating content in from another CMS is the `cms-migration` skill.
