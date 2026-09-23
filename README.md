# Astro + Payload workshop: build your developer portfolio

Starter repo for the Webee L&D session **"Astro + Payload with Claude Code"** (25 September 2026).
You will port a WordPress portfolio (a Project post type, its ACF fields, the theme templates and a
Profile options page) to Payload CMS + Astro, driving Claude Code. By the end of the hour the site is
yours: your projects, your profile, on the stack we are moving to.

The work is a ladder of gated steps. `pnpm verify N` checks steps 0 to N and stops at the first red.
A commit tagged `(step N)` is refused until step N is green. See [docs/TASK_BRIEF.md](docs/TASK_BRIEF.md).

## Before the day (10 minutes, do this at your desk)

```bash
git clone https://github.com/Born-MT/astro-payload-workshop.git astro-payload-workshop
cd astro-payload-workshop
pnpm install
pnpm setup        # creates .env files, wires git hooks, generates types, seeds the DB
pnpm doctor       # every line should be ✔
pnpm dev          # cms on http://localhost:3300, web on http://localhost:4321
pnpm verify 0     # in a second terminal: "All green through step 0"
```

Then open <http://localhost:3300/admin> and log in with `admin@webee.local` / `workshop123`.
See [docs/PREP_CHECKLIST.md](docs/PREP_CHECKLIST.md) for the full list, including Claude Code.

## Layout

```
apps/cms              Payload 3 + SQLite  (the CMS; only src/ matters)
apps/web              Astro 7             (the website; fetches Payload's REST API)
wordpress-reference   the WordPress portfolio you are porting (does not run)
docs                  task brief, stretch cards, glossary, facilitator guide, the deck
scripts               setup, doctor, verify (the gate)
.claude, CLAUDE.md    Claude Code setup installed by claude-kit, plus the step gate hook
```

## On the day

1. [docs/TASK_BRIEF.md](docs/TASK_BRIEF.md) — the ladder: steps 0 to 7, each a ticket with acceptance criteria and a gate
2. [docs/STRETCH_CARDS.md](docs/STRETCH_CARDS.md) — step 6: pick two
3. [docs/GLOSSARY.md](docs/GLOSSARY.md) — every Astro and Payload word, next to its WordPress word
4. [wordpress-reference/README.md](wordpress-reference/README.md) — WordPress → Payload/Astro file map and vocabulary

Facilitators: [docs/FACILITATOR_GUIDE.md](docs/FACILITATOR_GUIDE.md). The finished version lives on the `solution` branch, one commit per step.

The deck: [docs/SLIDES.html](docs/SLIDES.html) (open in a browser, `N` for notes), mirrored as [docs/From-WordPress-to-Astro-Payload.pptx](docs/From-WordPress-to-Astro-Payload.pptx) for Google Slides, and published at <https://claude.ai/artifact/NY9UmLfwZoxMdueYfCgahy>.

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev` | both servers |
| `pnpm verify [N]` | the gate: run steps 0..N against the running servers, stop at the first red |
| `pnpm verify --status` | where you are, no checks run |
| `pnpm generate:types` | regenerate `apps/cms/src/payload-types.ts` after field changes |
| `pnpm seed` | re-run the seed (idempotent) |
| `pnpm reset` | wipe SQLite + uploads, re-seed |
| `pnpm typecheck` | typecheck both apps |
| `pnpm doctor` | environment check |
