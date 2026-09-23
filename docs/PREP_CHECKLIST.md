# Prep checklist — do this BEFORE 25 September

Setup time is the number one thing that kills a 60-minute hands-on. Please finish every box
at your desk before the session, and message the facilitator if anything is ✘.

The last box is **step 0 of the workshop ladder**. It is the first gate, and the facilitator will
check it on the day before you touch anything else.

## Tools

- [ ] **Node 22+** — `node -v`. If not: `nvm install 22 && nvm use 22`.
- [ ] **pnpm 9+** — `pnpm -v`. If not: `corepack enable && corepack prepare pnpm@latest --activate`.
- [ ] **git** — `git --version`.
- [ ] **jq** — `jq --version`. **Required.** The repo's Claude Code hooks and the step gate need it; without it every command Claude runs is blocked. If not: `brew install jq` (mac) or `sudo apt install jq`.
- [ ] **VS Code** (or your editor) with the Astro extension (`astro-build.astro-vscode`).
- [ ] **Claude Code** installed and logged in with your Webee Teams seat:
  ```bash
  npm i -g @anthropic-ai/claude-code
  claude          # follow the login prompt, then type /status to confirm your account
  ```

## Repo

- [ ] Clone the repo and install:
  ```bash
  git clone https://github.com/Born-MT/astro-payload-workshop.git astro-payload-workshop
  cd astro-payload-workshop
  pnpm install
  pnpm setup      # .env files, git hooks, types, seed
  pnpm doctor     # all ✔
  ```
- [ ] `pnpm dev` starts both servers with no red errors.
- [ ] <http://localhost:4321> shows four service cards. The header shows **Projects** and **About**; those pages 404 until you build them on the day. That is expected.
- [ ] <http://localhost:3300/admin> logs in with `admin@webee.local` / `workshop123`.
- [ ] Open Claude Code in the repo (`claude` from the repo root) and ask it: *"Explain the layout of this repo in 5 bullet points."* It should mention `apps/cms`, `apps/web` and `wordpress-reference`.
- [ ] **The gate.** With `pnpm dev` still running, in a second terminal:
  ```bash
  pnpm verify 0
  ```
  It must end with `All green through step 0.` If it does not, the ✘ line names what to fix.
- [ ] Stop the servers (Ctrl+C). Done.

## Optional but useful

- [ ] Skim [wordpress-reference/README.md](../wordpress-reference/README.md), especially the file map and the vocabulary table.
- [ ] Read `apps/cms/src/collections/Services.ts` and `apps/web/src/pages/index.astro`. Those two files are the pattern you will copy.
- [ ] Think of three things you have built. You will put them in your portfolio in step 2.

## If you have no internet on the day

The facilitator will bring a zip of `node_modules` for macOS and Linux. `pnpm setup` works offline.
