# Astro + Payload workshop starter

Starter repo for the Webee L&D session **"Astro + Payload with Claude Code"** (25 September 2026).
You will port a WordPress "Case Studies" feature to Payload CMS + Astro, driving Claude Code.

## Before the day (10 minutes, do this at your desk)

```bash
git clone https://github.com/Born-MT/astro-payload-workshop.git astro-payload-workshop
cd astro-payload-workshop
pnpm install
pnpm setup        # creates .env files, generates types, seeds the DB
pnpm doctor       # every line should be ✔
pnpm dev          # cms on http://localhost:3300, web on http://localhost:4321
```

Then open <http://localhost:3300/admin> and log in with `admin@webee.local` / `workshop123`.
See [docs/PREP_CHECKLIST.md](docs/PREP_CHECKLIST.md) for the full list, including Claude Code.

## Layout

```
apps/cms              Payload 3 + SQLite  (the CMS; only src/ matters)
apps/web              Astro 7             (the website; fetches Payload's REST API)
wordpress-reference   the WordPress feature you are porting (does not run)
docs                  task brief, stretch cards, facilitator guide
.claude, CLAUDE.md    Claude Code setup installed by claude-kit
```

## On the day

1. [docs/TASK_BRIEF.md](docs/TASK_BRIEF.md) — the core task (ticket-style, with acceptance criteria)
2. [docs/STRETCH_CARDS.md](docs/STRETCH_CARDS.md) — pick any when the core task is green
3. [docs/GLOSSARY.md](docs/GLOSSARY.md) — every Astro and Payload word, next to its WordPress word
3. [wordpress-reference/README.md](wordpress-reference/README.md) — WordPress → Payload/Astro vocabulary

Facilitators: [docs/FACILITATOR_GUIDE.md](docs/FACILITATOR_GUIDE.md). The finished version lives on the `solution` branch.

The deck: [docs/SLIDES.html](docs/SLIDES.html) (open in a browser, `N` for notes), the same 25 slides as [docs/From-WordPress-to-Astro-Payload.pptx](docs/From-WordPress-to-Astro-Payload.pptx) for Google Slides, and published at <https://claude.ai/artifact/NY9UmLfwZoxMdueYfCgahy>.

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev` | both servers |
| `pnpm generate:types` | regenerate `apps/cms/src/payload-types.ts` after field changes |
| `pnpm seed` | re-run the seed (idempotent) |
| `pnpm reset` | wipe SQLite + uploads, re-seed |
| `pnpm typecheck` | typecheck both apps |
| `pnpm doctor` | environment check |
