# apps/cms — Payload 3

Payload 3 runs inside a Next.js app. You will only ever touch `src/`:

| Path | What it is | WordPress equivalent |
| --- | --- | --- |
| `src/payload.config.ts` | Registers collections, DB adapter, editor | `functions.php` + `wp-config.php` |
| `src/collections/*.ts` | One file per content type | `register_post_type()` + ACF field group |
| `src/seed.ts` | Creates admin user + demo content | WP importer / `wp post create` |
| `src/payload-types.ts` | **Generated.** Run `pnpm generate:types` after changing fields | — |
| `media/` | Uploaded files (git-ignored) | `wp-content/uploads` |
| `payload.db` | SQLite database (git-ignored) | MySQL |

Admin: <http://localhost:3300/admin> · REST: <http://localhost:3300/api/services>

Login: `admin@webee.local` / `workshop123`
