// Pre-workshop check. Run `pnpm doctor` — every line should be a ✔.
import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let failed = false
const ok = (msg) => console.log(`✔ ${msg}`)
const bad = (msg, fix) => {
  failed = true
  console.log(`✘ ${msg}\n    fix: ${fix}`)
}
const sh = (cmd) => {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

const node = process.versions.node
const [major] = node.split('.').map(Number)
major >= 22 ? ok(`Node ${node}`) : bad(`Node ${node} is too old`, 'install Node 22+ (nvm install 22)')

const pnpm = sh('pnpm -v')
pnpm ? ok(`pnpm ${pnpm}`) : bad('pnpm not found', 'corepack enable && corepack prepare pnpm@latest --activate')

const git = sh('git --version')
git ? ok(git) : bad('git not found', 'install Xcode command line tools / git')

const claude = sh('claude --version')
claude ? ok(`Claude Code ${claude}`) : bad('Claude Code CLI not found', 'npm i -g @anthropic-ai/claude-code, then run `claude` and log in')

const jq = sh('jq --version')
jq ? ok(`${jq}`) : bad('jq not found', 'brew install jq (mac) or sudo apt install jq. Without it every Claude Code command is blocked.')

const hooksPath = sh('git config --get core.hooksPath')
hooksPath === '.claude/githooks' ? ok('git hooks wired (.claude/githooks)') : bad('git hooks not wired', 'pnpm setup (or: git config core.hooksPath .claude/githooks)')

existsSync(resolve(root, 'node_modules')) ? ok('dependencies installed') : bad('node_modules missing', 'pnpm install')
existsSync(resolve(root, 'apps/cms/.env')) ? ok('apps/cms/.env exists') : bad('apps/cms/.env missing', 'pnpm setup')
existsSync(resolve(root, 'apps/web/.env')) ? ok('apps/web/.env exists') : bad('apps/web/.env missing', 'pnpm setup')
existsSync(resolve(root, 'apps/cms/payload.db')) ? ok('database seeded') : bad('payload.db missing', 'pnpm setup (or pnpm seed)')
// Ports: free is fine (you have not started yet); in use by OUR servers is fine (pnpm dev is running);
// in use by anything else is the EADDRINUSE you would hit on pnpm dev.
const probes = { 3300: 'http://localhost:3300/api/services?limit=1', 4321: 'http://localhost:4321/' }
for (const port of [3300, 4321]) {
  const who = sh(`lsof -nP -iTCP:${port} -sTCP:LISTEN | tail -n +2 | awk '{print $1}' | head -1`)
  if (!who) { ok(`port ${port} free`); continue }
  let ours = false
  try { ours = (await fetch(probes[port])).status === 200 } catch {}
  ours ? ok(`port ${port}: pnpm dev is running`) : bad(`port ${port} is in use by ${who}`, `stop it, or you will see EADDRINUSE from pnpm dev`)
}
existsSync(resolve(root, '.claude/settings.json')) ? ok('.claude/ present (claude-kit)') : bad('.claude/ missing', 'git checkout the repo again; .claude is committed')

console.log(failed ? '\nFix the ✘ lines above, then re-run pnpm doctor.' : '\nEnvironment is ready. Start pnpm dev, then run pnpm verify 0.')
process.exit(failed ? 1 : 0)
