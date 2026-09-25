# Facilitator walk-around checklist · 25 September 2026

Facilitator branch only. Do not share. Phone copy: private artifact (see FACILITATOR_GUIDE.md for the deck links).

The whole method: on any laptop, `pnpm verify --status`. Read the ✔/✘ lines and the `cards committed:` line. Do not read screens, do not judge code. If a step is red, `pnpm verify N` and read the `→` line under the ✘ out loud with them.

## T-30 · before doors open

- [ ] `gh auth status` shows **dale-quiachon** active (Born-MT repo is invisible to DLRpos; "repository not found" means wrong account, not a deleted repo).
- [ ] Projector laptop: repo on `main`, `pnpm doctor` all ✔, `pnpm dev` running, `pnpm verify 0` green.
- [ ] Second clone on `solution` in another window, its own `pnpm dev` stopped (ports 3300/4321 are taken by the `main` clone). Start it only for the "goal" demo, or show `/projects`, `/projects/<slug>`, `/about` from screenshots.
- [ ] Claude Code open in the repo, wide terminal, big font, plan mode ready (`Shift+Tab`).
- [ ] Deck open: `docs/SLIDES.html` from this branch. Published fallback: facilitator artifact (account A). Never put the notes deck on the projector with `N` pressed.
- [ ] Team deck link ready to paste in chat: <https://claude.ai/artifact/DuzGYAeX6zANunxcHSXhTD>.
- [ ] Offline `node_modules` archive on a USB stick: `../offline/node_modules-macos-x86_64-20260909.tar.gz` (Intel mac only). Restore: `tar xzf <archive> -C <repo-root>` then `pnpm install --offline`. Apple Silicon and Linux have no archive: those people wait on wifi.
- [ ] `GLOSSARY.md` link in chat. Solo attendees cannot ask a partner.
- [ ] Seating: each WP dev within reach of a JS/TS dev. The JS dev advises, never takes the keyboard.
- [ ] Ask the room: who has **not** confirmed `pnpm verify 0` green? Those laptops get visited first at minute 0.
- [ ] This checklist open on the phone.

## The 60 minutes · minute marks to call out loud

Minute = when the step should be **green** for someone on pace.

| Call at | Step | Green by | One question per laptop | Red? Check first |
| --- | --- | --- | --- | --- |
| 0 | 0 setup | 8 | "Both ready lines? Verify 0 green?" | `pnpm doctor`. jq missing → every Claude command blocked. Port in use → `lsof -nP -iTCP:3300 -sTCP:LISTEN`, kill it. |
| 8 | 1 collection | 18 | "Did you read the plan before accepting?" | Not in `collections` array (404). `generate:types` not run. Missing field: the table in the brief is the contract. Anonymous POST returned 201: copy the four access rules from Services.ts. Restart `pnpm dev:cms`. |
| 18 | 2 seed | 24 | "Are these YOUR projects?" | Seed prints nothing: missing top-level `await seed()`. Count went 3→6: find by slug before create. `SQLITE_ERROR: index already exists`: run seed again. |
| 24 | 3 archive | 32 | "What does `sort: '-completedOn'` do?" | Types don't know `Project`: `pnpm generate:types`, restart Astro TS server. Cards not newest-first. Link not `/projects/{slug}`. |
| 32 | 4 detail | 40 | "Could you do this by hand tomorrow?" | Unknown slug crashes instead of 404: `return new Response(null, { status: 404 })`. Missing stack or highlight values. |
| 40 | 5 profile | 50 | "Is that your name on /about?" | Global not under `globals` in config (404). CMS not restarted after adding it. `getGlobal` won't typecheck: `generate:types`. name/headline/bio empty: seed or fill in admin. |
| 50 | 6 cards | 57 | "Which two, and why those?" | Card refused "not visible in the API": field exists but no project has it filled. Card C `TS2769`: type as `Project['body']`. Anyone on 4 or 5 stays there. |
| 57 | debrief | | see below | |

Nudges at 50: WP devs → card A or B. JS devs → E or F. Card G (reviewer's card) for anyone whose step 5 is red: it needs no code.

## Behaviour checks the gate cannot see

Ask one of these per pass, pick at random.

- [ ] **Diff read.** "Summarise what that diff changed." Cannot? `git checkout .`, rerun the step in plan mode.
- [ ] **Plan mode used** for step 1 and anything touching more than one file.
- [ ] **No hook edits.** `git status` shows nothing under `.claude/hooks`, `scripts/verify.mjs`, `.env`. If Claude proposed it, the diff should have been refused.
- [ ] **No `--no-verify`.** Check shell history if a tagged commit landed while status is red.
- [ ] **Tag not stripped.** A red step with a commit that "looks done" means the `(step N)` tag was removed. Ask them to `git commit --amend` once green.
- [ ] **Postgres migration** appearing? Claude followed the generic skill. Point at CLAUDE.md: SQLite + `push: true`, no migrations.
- [ ] **Stuck on a word, not on code?** Glossary. Each word sits beside its WordPress word.
- [ ] **Astro "exited" under Claude Code?** It daemonised. `pnpm --filter web exec astro dev status`. It is running.

## Roster

Fill the highest green step and the minute at each pass. Circle anyone visited twice on the same red.

| Name | 0 | 1 | 2 | 3 | 4 | 5 | Cards | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

## Debrief · 57–60

Capture answers, especially question 4. They become a PR on claude-kit's payload stack.

1. Which WordPress concept mapped most cleanly? Which did not map at all?
2. Which diff did you reject, and why?
3. Which gate went red on you, and what did the ✘ line teach you?
4. **What would you put in CLAUDE.md that was not there?**

CLAUDE.md answers:
-
-
-

## Before anyone leaves

- [ ] Every laptop: `pnpm verify --status` once more. Copy the roster's final column.
- [ ] Anyone red on step 5: note the ✘ line. They get a follow-up message, not a fix now.
- [ ] Say the take-home out loud: step 7 in TASK_BRIEF.md, home page + deploy, URL due at the follow-up in about two weeks.
- [ ] Share `solution` branch link and the team deck link in chat.
- [ ] Remind: `pnpm verify --status` still works at home, the gate does not need the facilitator.

## Tonight

- [ ] Roster → who reached which step. Note anyone who never got past step 0 and why (wifi, org access, machine).
- [ ] CLAUDE.md answers → issue or PR on `claude-kit` payload stack.
- [ ] Update the memory file: session outcome, what broke, what to change for the follow-up.
- [ ] Draft follow-up: deploy Payload (SQLite, Node host, `push: false` + migration) and Astro (`@astrojs/node`), then portfolio reviews.
