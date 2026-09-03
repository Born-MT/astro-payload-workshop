---
name: payload-migrate
description: Create and run Payload database migrations safely — generate from schema changes, review the SQL before applying, and never rely on push against a shared database. Use after any collection, global, block, or field change on Postgres or SQLite.
argument-hint: "[name for a new migration, e.g. add-posts-status — omit to just apply pending ones]"
---

# Payload Migrations

Manage the schema for this Payload project. **Load the `payload` skill and its `reference/ADAPTERS.md`** for the adapter and transaction details.

1. **Check the adapter first.** MongoDB is schemaless and needs no migrations — if that's the adapter, report it and stop. Postgres and SQLite do need them.

2. **Confirm `push` is off for shared databases.** `push: true` mutates the schema on boot by inference; it is fine for a scratch local database and dangerous anywhere shared, because it can drop or rewrite columns without a review step. Production and staging must run migrations instead. If you find `push: true` in a config that points at a shared database, flag it rather than quietly working around it.

3. **Create the migration** (when `$1` was given):
   ```bash
   payload migrate:create $1
   ```
   Run this *after* the config change (new collection, global, block, or field) is saved, so the generated diff reflects it.

4. **Review the generated SQL — do not skip.** Open the migration and read both directions before applying:
   - Does anything **drop** a column or table that holds data? A rename often generates as drop + add, which silently loses content. Rewrite it as a real rename, or add a data-copy step.
   - Is a new non-nullable column added without a default? That fails on a non-empty table — add a default or backfill first.
   - Is the `down` migration actually the inverse? An unreviewed `down` is how a rollback becomes an outage.

5. **Apply:**
   ```bash
   payload migrate          # apply pending migrations
   payload migrate:status   # confirm what ran
   ```
   For anything destructive or on a shared database, take a backup first and say so explicitly.

6. **Regenerate types** — `payload generate:types` after the schema settles, and commit the generated file if the project tracks it.

7. **Verify.** Boot the dev server, confirm affected collections load in the admin panel and that existing documents still read correctly (a bad migration usually shows up as missing field values, not an error). Report which migrations ran, anything destructive you found in review, and whether types changed.

Useful related commands: `payload migrate:down` (roll back the last), `payload migrate:fresh` (drop everything and re-run — **local only**, confirm with the user before ever running it).
