# Task brief — Port "Case Studies" from WordPress to Payload + Astro

**Time:** 30 minutes guided, on your own laptop. You drive Claude Code and you are also the reviewer: read every diff before you accept it. Nobody else is checking, so the habit is the check.

**What you are porting:** everything in [`wordpress-reference/`](../wordpress-reference/README.md). Read `README.md` there first — the vocabulary table is your map. Keep [GLOSSARY.md](GLOSSARY.md) open for any word you do not recognise.

**How to work:** treat each step as a ticket. Give Claude the step's text, including the acceptance criteria, as your prompt. Use plan mode (`Shift+Tab`) for step 1 so you see the plan before any file changes. Commit after each green step.

---

## Step 1 — The collection (CPT + ACF → Payload collection) · ~10 min

Create a `case-studies` collection in `apps/cms/src/collections/CaseStudies.ts` and register it.

**Fields (from the ACF export, core set only):**

| ACF field | Payload field | Notes |
| --- | --- | --- |
| Title | `title` — text, required | admin `useAsTitle` |
| Slug | `slug` — text, required, unique, sidebar | auto-generated from title, same hook as Services |
| `client` | `client` — text, required | |
| `summary` | `summary` — textarea, required, max 240 | |
| `project_url` | `projectUrl` — text, optional | |
| `completed_on` | `completedOn` — date, required | |
| `results` repeater (1–4 rows) | `results` — array, minRows 1, maxRows 4 of `{ value: text, label: text }` | |

Skip `services`, `hero_image`, `body`, `seo` for now. They are stretch cards.

**Acceptance criteria**

- [ ] `pnpm generate:types` runs clean and `CaseStudy` appears in `apps/cms/src/payload-types.ts`.
- [ ] Access: `read` is public; create/update/delete need a logged-in user (copy Services).
- [ ] Admin panel shows "Case Studies" under the "Content" group; you can create one, and leaving the slug blank fills it from the title.
- [ ] `GET http://localhost:3300/api/case-studies` returns your document as JSON.
- [ ] Commit: `feat(cms): add case-studies collection`.

**Hints:** `/payload-new-collection case-studies` is installed in this repo and will do most of it. Read what it produces. Watch out for the `fields` of an `array` — they are nested `fields: [...]` inside the array field.

---

## Step 2 — Seed data (sample-content.sql → seed.ts) · ~5 min

Port the three case studies in `wordpress-reference/case-study-plugin/sample-content.sql` into `apps/cms/src/seed.ts`, following the existing Services pattern (find by slug, create if missing).

**Acceptance criteria**

- [ ] `pnpm seed` creates 3 case studies; running it twice does not create 6.
- [ ] `GET /api/case-studies?sort=-completedOn` lists Valletta Arts Festival first.
- [ ] Commit: `feat(cms): seed case studies`.

---

## Step 3 — Archive page (archive-case_study.php → Astro) · ~8 min

Create `apps/web/src/pages/case-studies/index.astro` and `apps/web/src/components/CaseStudyCard.astro`. Use `getDocs` from `@/lib/payload`, sorted by `completedOn` descending. Match what `archive-case_study.php` and `content-case_study.php` render: client pill, title, summary.

**Acceptance criteria**

- [ ] <http://localhost:4321/case-studies> shows 3 cards, newest first.
- [ ] The card component's props are typed with `CaseStudy` from `@cms/payload-types`.
- [ ] The nav link "Case Studies" in the header works (it already exists in `Base.astro`).
- [ ] `pnpm typecheck` passes.
- [ ] Commit: `feat(web): case studies archive page`.

---

## Step 4 — Detail page (single-case_study.php → Astro) · ~7 min

Create `apps/web/src/pages/case-studies/[slug].astro`. Use `getDocBySlug`. Render: back link, title, client pill, completed month + year, "Visit site ↗" link when `projectUrl` exists, the summary as a lede, and the results as the `.stats` grid (the CSS classes already exist in `global.css`).

**Acceptance criteria**

- [ ] <http://localhost:4321/case-studies/maltese-artisan-marketplace> renders with 3 stats.
- [ ] A wrong slug returns a 404 (not a crash).
- [ ] Cards on the archive page link to the detail page.
- [ ] `pnpm typecheck` passes.
- [ ] Commit: `feat(web): case study detail page`.

---

## Done? Show the facilitator, then pick a [stretch card](STRETCH_CARDS.md).

## Claude Code habits we are practising

1. **Plan mode first** for anything touching more than one file.
2. **Read the diff** before you accept. Say "accept" or "no, because…" before you press Enter. Out loud is fine.
3. **Ticket-style prompts**: what, where, acceptance criteria. Paste the step text.
4. **Commit after each green step.** Ask Claude to write the commit message; check it.
5. **Ask it to explain** anything you would not be able to reproduce yourself tomorrow.
