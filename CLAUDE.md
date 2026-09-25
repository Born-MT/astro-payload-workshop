# Project Instructions

<!--
  Sections wrapped in `claude-kit:begin:<id>` / `claude-kit:end:<id>` markers are managed by
  claude-kit: `claude-kit --update --sync-config .` replaces their contents with the current
  template, so upstream rule changes reach this project. Anything OUTSIDE the markers — the
  Commands section below, and anything you add — is yours and is never touched.
  To take a block over permanently, delete its two marker lines.
-->

<!-- claude-kit:begin:skills -->
## Skills — use the one that fits (do this first)

This project ships a curated skill library in `.claude/skills/`. Each skill carries vetted, domain-specific procedure. **When a task matches a skill's domain, using that skill is required, not optional** — it is a blocking step, not a suggestion.

- **Match before you act.** Before starting any non-trivial task, check whether an installed skill covers it (security scanning, API design, database migrations, testing, framework patterns, deployment, etc.). If one fits, invoke it — do **not** work ad hoc when a skill exists for the job.
- **Invoke it, don't paraphrase it.** Actually run the skill (its `/slash-command`); don't reconstruct its steps from memory or skip it because the task "looks simple."
- **Local before global.** When a skill or agent exists both in this project's `.claude/` and in the global `~/.claude/`, always use the project-local one. Fall back to global only when nothing local covers the task. In particular, prefer this project's `/security-scan` skill and the local `security-reviewer` / `code-reviewer` agents over any global equivalents.
- **Use judgment.** Match on domain, not keywords — don't force an unrelated skill onto work it doesn't fit. When more than one skill applies, use each for its part of the task.
<!-- claude-kit:end:skills -->

## What this repo is

Starter for the Webee L&D workshop "Astro + Payload with Claude Code". Each attendee ports a WordPress portfolio to this stack and ends up with their own portfolio site. pnpm monorepo:

- `apps/cms` — Payload 3 (runs inside Next.js), SQLite, admin at http://localhost:3300/admin, REST at http://localhost:3300/api/<collection> and http://localhost:3300/api/globals/<global>. Only `src/` matters.
- `apps/web` — Astro 7, server-rendered, http://localhost:4321. Fetches Payload via `src/lib/payload.ts`. Never talks to the DB directly.
- `wordpress-reference/` — a frozen WordPress portfolio (Project CPT + ACF + theme templates + a Profile options page). Reference only; it does not run. The workshop task is to port it.
- `docs/` — task brief (the ladder), stretch cards, glossary, and the slide deck as shown to attendees (`SLIDES-team.html`, mirrored as the `-team.pptx`). Both deck files are generated on the private `facilitator` branch; do not edit them here.
- `scripts/verify.mjs` — the gate. `pnpm verify N` runs the acceptance criteria of steps 0..N in order. Step commits carry a tag `(step N)` / `(card X)` and the hooks refuse them until the step is green.

`Services` is the worked example: `apps/cms/src/collections/Services.ts`, `apps/web/src/pages/index.astro`, `apps/web/src/pages/services/[slug].astro`. **Copy its patterns** (public read access, slug hook, typed fetch) for `Projects`. The ladder is in `docs/TASK_BRIEF.md`: 1 Projects collection, 2 seed, 3 archive page, 4 detail page, 5 Profile global + About page, 6 two stretch cards.

## Commands

```bash
pnpm dev              # both servers (cms on :3300, web on :4321)
pnpm dev:cms          # Payload only
pnpm dev:web          # Astro only
pnpm verify [N]       # the gate: steps 0..N against the RUNNING servers; stops at the first red
pnpm verify --status  # last result per step, no checks run
pnpm generate:types   # REQUIRED after changing any collection's or global's fields -> apps/cms/src/payload-types.ts
pnpm seed             # idempotent seed (admin user + demo content) — apps/cms/src/seed.ts
pnpm reset            # delete SQLite DB + uploads, re-seed
pnpm typecheck        # tsc (cms) + astro check (web)
pnpm doctor           # environment check
```

Admin login: `admin@webee.local` / `workshop123` (workshop only).

## Conventions

- Collections: one file per collection in `apps/cms/src/collections/`, PascalCase filename, kebab-case plural `slug`. Register in `payload.config.ts`. Set **all four** access rules explicitly. Give every public collection `read: () => true`.
- Globals: one file per global in `apps/cms/src/globals/`, PascalCase filename, singular `slug` (`profile`). Register under `globals` in `payload.config.ts`. `read: () => true`, `update` needs a user. Fetch in Astro with `getGlobal('profile')` from `@/lib/payload`.
- Every content collection has `title` + `slug` (auto-generated via the `beforeValidate` hook pattern in `Services.ts`).
- After changing fields: `pnpm generate:types`. The Astro app imports those types via `@cms/payload-types` — a type error in `apps/web` after a field change is expected and is the fix list.
- Astro pages fetch in frontmatter using `getDocs` / `getDocBySlug` / `getGlobal` from `@/lib/payload`. Use `depth: 1` (the default) to populate relationships and uploads. Return a 404 `Response` when a slug does not resolve.
- Uploads: use the existing `media` collection with an `upload` field. Build image URLs with `mediaUrl()`.
- Rich text is Lexical JSON. Render it in Astro with `convertLexicalToHTML` from `@payloadcms/richtext-lexical/html` (install that package in `apps/web` first).
- SQLite runs with `push: true` in dev, so schema changes apply on restart. Do not create migrations in this workshop.
- Commit only when the step's gate is green, with the message from the brief. Step commits end with `(step N)`; stretch cards with `(card A)`..`(card G)`. The commit hooks enforce this. If the gate is red, fix the ✘ it names; never drop the tag, never add `--no-verify`.
- `scripts/verify.mjs`, `.claude/hooks/*` and `.claude/githooks/*` are the gate. Never edit them to make a step pass. If a proposed fix touches them, it is the wrong fix.

## WordPress → Payload/Astro vocabulary

CPT → collection · ACF options page → global · ACF field group → `fields` · Repeater → `array` · Post Object → `relationship` · Image → `upload` · WYSIWYG → `richText` · Flexible Content → `blocks` · `save_post` → `beforeChange`/`afterChange` hooks · `WP_Query` → `?where[..]&sort=&limit=` · `get_field('x','option')` → `getGlobal('profile')` · `archive-*.php` → `pages/<slug>/index.astro` · `single-*.php` → `pages/<slug>/[slug].astro` · `page-about.php` → `pages/about.astro` · `template-parts/` → `components/` · `header.php`/`footer.php` → `layouts/Base.astro`. Full table in `wordpress-reference/README.md`.

<!-- claude-kit:begin:standards -->
## Project rules — `.claude/rules/`

Path-scoped standards live in `.claude/rules/`. **Read the rule that covers a file before you edit that file** — they encode decisions already made for this project, so they are constraints, not suggestions. Each rule's own `paths:` frontmatter is the authoritative scope; this table is a summary.

| Rule | Applies when you touch |
| --- | --- |
| `code-quality.md` | Everything — no `paths:`, so it is always in force (naming, anti-defaults, comments, structure) |
| `security.md` | Request-handling code: `api/`, `auth/`, `middleware/`, `routes/`, `controllers/`, `handlers/`, `views/`; Laravel `Http/`, `Controllers/`, `Middleware/`; Django `views.py`, `forms.py`, `serializers.py`, `admin.py` |
| `error-handling.md` | Service and boundary code: `api/`, `services/`, `controllers/`, `routes/`, `handlers/`, `cmd/`, `internal/`, `components/`; Laravel `Http/`, `Jobs/`, `Console/`; Django `views.py`, `tasks.py`, `models.py` |
| `testing.md` | `src/`, `lib/`, `app/`, `packages/`, `internal/`, `components/`, `services/`, `tests/`, and any `*.test.*` / `*.spec.*` / `*_test.*` |

## Security

- Run `/security-scan` before shipping changes to auth, input handling, queries, file paths, or dependencies.
- Never hardcode secrets. Read them from the environment. `.env`, `*.pem`, `*.key`, and `secrets/` are blocked by settings and hooks.

## Agent team — `.claude/agents/`

- The installed subagents are in `.claude/agents/`, and `.claude/AGENT_TEAM.md` is their playbook — the roster grouped by function, a routing table, and the idea→shipped workflow with quality gates.
- For any non-trivial task, follow that flow: plan → build (route to the specialist) → code review → security review → test → ship. Honor each gate before moving on.
- Delegate to the specialist that owns the work (see the routing table in `AGENT_TEAM.md`); fall back to `senior-software-engineer` for cross-cutting work.
- Prefer a project-local agent over a global one of the same name.

## Safety hooks — `.claude/hooks/`

These run automatically inside Claude Code and **enforce** boundaries — they are not advisory, and a non-zero exit blocks the action:

- `protect-files.sh`, `warn-large-files.sh`, `scan-secrets.sh` — refuse edits to sensitive or generated files, build artifacts and binaries, and content that looks like a secret.
- `block-dangerous-commands.sh` — refuses force pushes, pushes to protected branches, and destructive shell commands.
- `session-start.sh` — injects brief git context at session start.

`.claude/githooks/pre-commit` additionally scans staged changes for secrets (wired via `core.hooksPath`). **The hooks need `jq` on the PATH; the command-safety hook fails closed, so without `jq` every Bash command is blocked.** If a hook blocks you, fix the underlying problem — never work around it, disable it, or edit the hook to pass.

## Workflow

- Run typecheck/lint after a series of code changes.
- Prefer fixing the root cause over adding workarounds.
- When unsure about approach, use plan mode (`Shift+Tab`) before coding.

## Don'ts

- Don't modify generated files (`*.gen.*`, `*.generated.*`) or `.claude/AGENT_TEAM.md` by hand — it is regenerated.
- Don't edit `.claude/hooks/*` — they enforce security boundaries.
- Don't commit secrets, or bypass the pre-commit scan with `--no-verify` / `SKIP_SECRET_SCAN=1` without a clear false-positive reason.
<!-- claude-kit:end:standards -->
