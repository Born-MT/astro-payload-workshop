---
name: database-migrations
description: Safe schema and data migrations — zero-downtime patterns, rollbacks, and ORM-specific workflows across PostgreSQL, MySQL, Prisma, Drizzle, Kysely, Django, and golang-migrate. Use before any schema change or data backfill.
metadata:
  origin: ECC
---

# Database Migrations

Ship schema and data changes safely, without downtime or data loss.

## When to Activate

- Adding, altering, or dropping columns/tables/indexes
- Backfilling or transforming existing data
- Planning a zero-downtime deploy that touches the schema
- Reviewing a migration before it hits production

## Core Principles

1. **Every change is a migration.** Never alter a production database by hand.
2. **Forward-only in production.** To undo, write a new forward migration — don't rely on running a `down` against prod.
3. **Schema and data migrations are separate.** Don't mix DDL (`ALTER TABLE`) and DML (`UPDATE`) in one step.
4. **Test at production scale.** A migration that's instant on 100 rows can lock a table for minutes on 100M.
5. **Migrations are immutable once deployed.** Never edit a migration that has already run in production — add a new one.

## Zero-downtime: the expand–contract pattern

Never rename or retype a column in place while old code is running. Expand, migrate, then contract across deploys:

1. **Expand** — add the new nullable column (no default backfill on the DDL).
2. **Backfill** — copy data in batches (separate data migration).
3. **Migrate** — deploy code that writes/reads the new column.
4. **Contract** — once no code uses the old column, drop it in a later migration.

## PostgreSQL safety

- Add columns **nullable** (or with a constant default on PG 11+) to avoid a full table rewrite.
- Create indexes with `CREATE INDEX CONCURRENTLY` — a plain `CREATE INDEX` locks writes.
- Backfill in **batches** (e.g. 10k rows) with commits between, so you never hold a long lock.
- Adding `NOT NULL` on a big table: add the column nullable, backfill, add a validated `CHECK`, then set `NOT NULL`.

```sql
-- safe, non-blocking index
CREATE INDEX CONCURRENTLY idx_orders_user ON orders (user_id);
```

## ORM workflows

- **Prisma** — `prisma migrate dev` (local) / `migrate deploy` (prod); drop to raw SQL for `CONCURRENTLY` and batched backfills.
- **TypeORM** — `migration:generate` then `migration:run`. Keep `synchronize: false` in **every** environment; it drops columns without warning. The generator diffs entities against the live schema, so review the emitted SQL before committing — it won't produce `CONCURRENTLY` or batched backfills on its own.
- **Drizzle** — `drizzle-kit generate` then `migrate`; review the emitted SQL before applying.
- **Kysely** — migration files with explicit `up`/`down` functions.
- **Django** — `makemigrations`; use `RunPython` (with a reverse func) for data migrations, kept in their own migration.
- **golang-migrate** — paired `NNN_name.up.sql` / `.down.sql` files.

## Rollback strategy

Prefer a **forward fix** over a down-migration in production. Keep `down` migrations for local/CI reversibility, but the production plan is: deploy a new migration that corrects the state. Always document the rollback path before deploying.

## Anti-patterns

| Anti-pattern | Fix |
| --- | --- |
| Manual `ALTER TABLE` on prod | Write a migration and deploy it |
| Editing an already-deployed migration | Add a new migration |
| `NOT NULL` column with no default on a big table | Add nullable → backfill → validate → set NOT NULL |
| Plain `CREATE INDEX` on a large table | `CREATE INDEX CONCURRENTLY` |
| Schema + data change in one migration | Split DDL and DML |
| Single `UPDATE` over millions of rows | Batch with commits between |
| Dropping a column before removing its code | Contract only after code stops using it |

## Checklist

- [ ] DDL and data changes are in separate migrations
- [ ] New columns nullable or constant-defaulted; no surprise table rewrite
- [ ] Indexes on large tables created `CONCURRENTLY`
- [ ] Large backfills batched with commits between
- [ ] Renames/retypes use expand–contract across deploys
- [ ] Tested against production-scale data
- [ ] Rollback path documented (forward-fix plan)
- [ ] No secrets or environment-specific values baked into the migration
