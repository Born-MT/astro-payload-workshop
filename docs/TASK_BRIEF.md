# Task brief — Build your developer portfolio on Payload + Astro

**Time:** 60 minutes, on your own laptop. You drive Claude Code and you are also the reviewer: read every diff before you accept it.

**The goal:** by the end of the hour you own a portfolio site on the new stack: a Projects collection with three things you built, a projects archive, a project detail page, and an About page fed by a Profile global. The home page and deployment are the take-home.

**How it is structured, and why it is strict:** the work is a ladder of steps. Each step is a ticket with acceptance criteria. Each step has a gate: `pnpm verify N` runs the criteria for steps 0 to N against your running servers and your git history, in order, and stops at the first red. You cannot verify step 3 while step 2 is red. Each step ends with a commit whose message carries the tag `(step N)`; the commit hooks refuse that commit until the step is green. Nobody has to check your work, the gate does.

**How to work:** treat each step as a ticket. Give Claude the step's text, including the acceptance criteria, as your prompt. Use plan mode (`Shift+Tab`) for step 1 so you see the plan before any file changes. When the gate says green, commit with the exact message shown. Keep [GLOSSARY.md](GLOSSARY.md) open for any word you do not recognise, and [wordpress-reference/README.md](../wordpress-reference/README.md) for the map.

| Step | What | Gate | Minutes |
| --- | --- | --- | --- |
| 0 | Prerequisites | `pnpm verify 0` | before the day |
| 1 | Projects collection | `pnpm verify 1` | 10 |
| 2 | Seed three of your projects | `pnpm verify 2` | 6 |
| 3 | Projects archive page | `pnpm verify 3` | 8 |
| 4 | Project detail page | `pnpm verify 4` | 8 |
| 5 | Profile global + About page | `pnpm verify 5` | 10 |
| 6 | Two stretch cards | `pnpm verify 6` | 15 |
| 7 | Home page + deploy | take-home | — |

---

## Step 0 — Prerequisites · before the day

Everything in [PREP_CHECKLIST.md](PREP_CHECKLIST.md). Then, with `pnpm dev` running in another terminal:

```bash
pnpm verify 0
```

**Acceptance criteria (what the gate checks)**

- [ ] `pnpm doctor` is all ✔ (Node 22+, pnpm, git, jq, Claude Code, `.env` files, database, ports free, git hooks wired).
- [ ] CMS answers on <http://localhost:3300>, web answers on <http://localhost:4321>.
- [ ] The worked example renders four service cards on `/`.

Also, not checked by the gate but checked by the facilitator: open Claude Code in the repo and ask *"Explain the layout of this repo and how apps/web gets data from apps/cms, in five bullet points."*

---

## Step 1 — The Projects collection (CPT + ACF → Payload collection) · ~10 min

Port `wordpress-reference/portfolio-plugin/portfolio-cpt.php` and `acf-export-project.json` to `apps/cms/src/collections/Projects.ts` and register it in `payload.config.ts`.

**Fields (core set only):**

| ACF field | Payload field | Notes |
| --- | --- | --- |
| Title | `title` — text, required | admin `useAsTitle` |
| Slug | `slug` — text, required, unique, sidebar | auto-generated from title, same hook as Services |
| `client` | `client` — text, required | "Personal" for a side project |
| `role` | `role` — text, required | e.g. "Lead developer" |
| `summary` | `summary` — textarea, required, max 240 | |
| `project_url` | `projectUrl` — text, optional, sidebar | |
| `repo_url` | `repoUrl` — text, optional, sidebar | |
| `completed_on` | `completedOn` — date, required, sidebar | |
| `stack` repeater (1–8) | `stack` — array, minRows 1, maxRows 8 of `{ name: text }` | |
| `highlights` repeater (1–4) | `highlights` — array, minRows 1, maxRows 4 of `{ value: text, label: text }` | |

Skip `services`, `hero_image`, `body`, `seo`. They are stretch cards.

**Acceptance criteria (what the gate checks)**

- [ ] `apps/cms/src/collections/Projects.ts` exists and has a `beforeValidate` slug hook.
- [ ] `GET http://localhost:3300/api/projects` returns JSON without logging in (public read).
- [ ] An anonymous `POST /api/projects` is refused (create/update/delete need a user).
- [ ] `pnpm generate:types` produced a `Project` type with every field above; `title`, `slug`, `client`, `role`, `summary`, `completedOn` are required.
- [ ] Commit: `feat(cms): add projects collection (step 1)`

**Hints:** `/payload-new-collection projects` is installed in this repo and will do most of it. Read what it produces. The `fields` of an `array` are nested `fields: [...]` inside the array field. Restart `pnpm dev:cms` after registering the collection.

---

## Step 2 — Seed three of your projects (sample-content.sql → seed.ts) · ~6 min

Port the three projects in `wordpress-reference/portfolio-plugin/sample-content.sql` into `apps/cms/src/seed.ts`, following the Services pattern (find by slug, create if missing). Then **replace them with three things you have actually built**. WordPress sites count. Keep the sample data only if you run out of time.

**Acceptance criteria (what the gate checks)**

- [ ] `pnpm seed` results in at least 3 projects; running it again does not create more.
- [ ] Every project has `title`, `client`, `role`, `summary`, `completedOn`, at least one `stack` item and at least one `highlight`.
- [ ] `GET /api/projects?sort=-completedOn` lists the most recent first.
- [ ] Commit: `feat(cms): seed projects (step 2)`

---

## Step 3 — Projects archive page (archive-project.php → Astro) · ~8 min

Create `apps/web/src/pages/projects/index.astro` and `apps/web/src/components/ProjectCard.astro`. Use `getDocs` from `@/lib/payload`, sorted by `completedOn` descending. Match `archive-project.php` and `content-project.php`: client pill, title, summary, role.

**Acceptance criteria (what the gate checks)**

- [ ] <http://localhost:4321/projects> returns 200 and links to every project as `/projects/{slug}`, newest first.
- [ ] `ProjectCard.astro` imports its prop type from `@cms/payload-types`.
- [ ] The "Projects" link in the header still works (it is already in `Base.astro`).
- [ ] `pnpm typecheck` passes.
- [ ] Commit: `feat(web): projects archive page (step 3)`

---

## Step 4 — Project detail page (single-project.php → Astro) · ~8 min

Create `apps/web/src/pages/projects/[slug].astro`. Use `getDocBySlug`. Render: back link, title, client pill, role, completed month + year, "Visit site ↗" and "Code ↗" links when the URLs exist, the summary as a lede, the stack as pills, and the highlights as the `.stats` grid (the CSS classes already exist in `global.css`).

**Acceptance criteria (what the gate checks)**

- [ ] `/projects/{slug}` of your newest project returns 200 and shows its title, client, role, every stack item and every highlight value.
- [ ] A slug that does not exist returns a 404 (not a crash).
- [ ] `pnpm typecheck` passes.
- [ ] Commit: `feat(web): project detail page (step 4)`

---

## Step 5 — Profile global + About page (ACF options page → Global) · ~10 min

This is the step that makes it yours. An ACF options page is one screen of fields with no list of posts behind it. In Payload that is a **Global**, not a collection.

1. Port `acf-export-profile.json` to `apps/cms/src/globals/Profile.ts`, slug `profile`: `name` (text, required), `headline` (text, required, max 80), `bio` (textarea, required), `email` (text), `location` (text), `links` (array, max 6, of `{ label: text, url: text }`). Public read, update needs a user. Register it under `globals` in `payload.config.ts`. Run `pnpm generate:types`.
2. Fill it in with **your own details**, either in the admin panel (Globals → Profile) or in `seed.ts` with `payload.updateGlobal({ slug: 'profile', data: {...} })`.
3. Create `apps/web/src/pages/about.astro`, porting `page-about.php`. Fetch with `getGlobal('profile')` from `@/lib/payload`.

**Acceptance criteria (what the gate checks)**

- [ ] `GET http://localhost:3300/api/globals/profile` is public and has `name`, `headline` and `bio` filled in.
- [ ] <http://localhost:4321/about> returns 200 and shows the name, the headline and every link.
- [ ] The "About" link in the header still works.
- [ ] `pnpm typecheck` passes.
- [ ] Commit: `feat: profile global and about page (step 5)`

**Hint:** `/payload-new-global profile` is installed.

---

## Step 6 — Two stretch cards · ~15 min

Pick **two** from [STRETCH_CARDS.md](STRETCH_CARDS.md). Each is a ticket. Commit each finished card with its tag, `(card A)` to `(card G)`.

**Acceptance criteria (what the gate checks)**

- [ ] At least two commits tagged `(card X)`.
- [ ] Each tagged card is visible in the API (a populated relationship, an uploaded hero image, rich text in `body`, an `seo` title, a block in `layout`). Cards F and G are checked by the facilitator.
- [ ] `pnpm typecheck` passes.

---

## Step 7 — Take-home: the home page and deployment

Not gated. Due before the follow-up session.

1. Make `/` the portfolio home: headline and bio from the Profile global, the three newest projects, then the services. Move the services list to `/services`.
2. Deploy it. Payload with SQLite runs anywhere Node runs (Railway, Fly, a VPS); Astro in `output: 'server'` needs an adapter (`@astrojs/node` on the same host is simplest). Set `PAYLOAD_URL`, `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL` and a real `PAYLOAD_SECRET`. Switch `push: true` off and write a migration first (`/payload-migrate`).
3. Bring the URL to the follow-up. We will review the portfolios and do deployment properly there.

---

## The rules, enforced

- **Plan mode for anything touching more than one file.** `Shift+Tab` first.
- **Read every diff before you accept it.** If you cannot say what changed and why, `git checkout .` and rerun the step in plan mode.
- **Commit only when the gate is green, with the exact message.** The commit hooks refuse a tagged commit while the step is red. Removing the tag to get around it means `pnpm verify` stays red for that step, and the facilitator will see it.
- **Never edit `.claude/hooks`, `scripts/verify.mjs`, `.env` or add `--no-verify`.** If Claude proposes that as the fix, the fix is wrong. Ask for a different one.
