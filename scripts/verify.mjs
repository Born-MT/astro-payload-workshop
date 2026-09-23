// The workshop gate. `pnpm verify [N]` checks steps 0..N against the RUNNING servers and your git
// history, in order, and stops at the first red. `pnpm verify --status` shows the last result.
//
// Every check here is one acceptance criterion from docs/TASK_BRIEF.md. If a check is red, the
// message tells you which criterion and what to look at. Nothing here is a mystery.
//
// Usage:
//   pnpm verify            run every step, report how far you are
//   pnpm verify 3          run steps 0..3
//   pnpm verify --status   last result per step, no checks run
//   pnpm verify --gate "<commit message>"   used by the commit hooks; exits 1 if the tagged step is red
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CMS = process.env.PAYLOAD_URL || 'http://localhost:3300'
const WEB = process.env.WEB_URL || 'http://localhost:4321'
const LAST_STEP = 6
const progressDir = resolve(root, '.workshop')
const progressFile = resolve(progressDir, 'progress.json')

const c = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' }
const args = process.argv.slice(2)

// ── helpers ───────────────────────────────────────────────────────────────
const sh = (cmd, opts = {}) => {
  try {
    return execSync(cmd, { cwd: root, stdio: 'pipe', encoding: 'utf8', ...opts }).trim()
  } catch (err) {
    return opts.soft ? null : (err.stdout?.toString() || '') + (err.stderr?.toString() || '')
  }
}
const run = (cmd, argv) => spawnSync(cmd, argv, { cwd: root, stdio: 'pipe', encoding: 'utf8', shell: true })

async function http(url, init) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...init })
    const text = await res.text()
    return { status: res.status, text, json: safeJson(text) }
  } catch {
    return { status: 0, text: '', json: null }
  }
}
const safeJson = (t) => { try { return JSON.parse(t) } catch { return null } }

const gitLog = () => sh('git log --format=%s%n%b', { soft: true }) || ''
// While --gate runs, the commit being made is not in the log yet, so its own tag counts as present.
const hasCommitTag = (tag) => globalThis.__gateTag === tag || gitLog().includes(`(${tag})`)

function loadProgress() {
  try { return JSON.parse(readFileSync(progressFile, 'utf8')) } catch { return { steps: {} } }
}
function saveProgress(p) {
  mkdirSync(progressDir, { recursive: true })
  writeFileSync(progressFile, JSON.stringify(p, null, 2))
}

// A step is a list of checks. Each check returns null (pass) or a string (why it failed).
class Failed extends Error {}
const fail = (msg, hint) => { throw new Failed(hint ? `${msg}\n      ${c.d}→ ${hint}${c.x}` : msg) }

let typecheckResult = null
function typecheck() {
  if (typecheckResult !== null) return typecheckResult
  const r = run('pnpm', ['typecheck'])
  typecheckResult = r.status === 0 ? null : (r.stdout + r.stderr).split('\n').filter((l) => /error/i.test(l)).slice(0, 5).join('\n      ')
  return typecheckResult
}

async function projects(query = '?limit=100&sort=-completedOn') {
  const r = await http(`${CMS}/api/projects${query}`)
  if (r.status !== 200 || !r.json?.docs) fail(`GET /api/projects returned ${r.status}`, 'is the projects collection registered in payload.config.ts? Restart pnpm dev:cms after adding it.')
  return r.json
}

// ── the steps ─────────────────────────────────────────────────────────────
const steps = {
  0: {
    title: 'Prerequisites',
    checks: [
      ['pnpm doctor is all green', () => {
        const r = run('node', ['scripts/doctor.mjs'])
        if (r.status !== 0) fail('pnpm doctor reports a ✘', 'run pnpm doctor and fix every ✘ line')
      }],
      ['CMS is running on :3300', async () => {
        const r = await http(`${CMS}/api/services?limit=1`)
        if (r.status !== 200) fail(`GET ${CMS}/api/services returned ${r.status}`, 'run pnpm dev in another terminal and wait for both servers')
      }],
      ['web is running on :4321', async () => {
        const r = await http(`${WEB}/`)
        if (r.status !== 200) fail(`GET ${WEB}/ returned ${r.status}`, 'run pnpm dev in another terminal and wait for both servers')
      }],
      ['worked example renders 4 services', async () => {
        const r = await http(`${WEB}/`)
        const n = (r.text.match(/class="card"/g) || []).length
        if (n < 4) fail(`found ${n} service cards on /, expected 4`, 'pnpm seed, then refresh')
      }],
    ],
  },
  1: {
    title: 'Projects collection',
    checks: [
      ['apps/cms/src/collections/Projects.ts exists', () => {
        if (!existsSync(resolve(root, 'apps/cms/src/collections/Projects.ts'))) fail('file not found', 'create it, copying the pattern in Services.ts')
      }],
      ['GET /api/projects is public and returns JSON', async () => { await projects('?limit=1') }],
      ['anonymous create is refused', async () => {
        const r = await http(`${CMS}/api/projects`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
        if (![401, 403].includes(r.status)) fail(`anonymous POST /api/projects returned ${r.status}, expected 401 or 403`, 'set create/update/delete access to ({ req: { user } }) => Boolean(user)')
      }],
      ['payload-types.ts has a Project type with the ported fields', () => {
        const types = readFileSync(resolve(root, 'apps/cms/src/payload-types.ts'), 'utf8')
        const m = types.match(/export interface Project \{([\s\S]*?)\n\}/)
        if (!m) fail('no `export interface Project` in payload-types.ts', 'pnpm generate:types')
        const missing = ['title', 'slug', 'client', 'role', 'summary', 'projectUrl', 'repoUrl', 'completedOn', 'stack', 'highlights'].filter((f) => !new RegExp(`^\\s+${f}\\??:`, 'm').test(m[1]))
        if (missing.length) fail(`Project type is missing: ${missing.join(', ')}`, 'add the field(s) from acf-export-project.json, then pnpm generate:types')
        for (const f of ['title', 'slug', 'client', 'role', 'summary', 'completedOn']) {
          if (new RegExp(`^\\s+${f}\\?:`, 'm').test(m[1])) fail(`${f} is optional in the Project type`, `set required: true on ${f}`)
        }
      }],
      ['slug is generated from the title (hook on the field)', () => {
        const src = readFileSync(resolve(root, 'apps/cms/src/collections/Projects.ts'), 'utf8')
        if (!/beforeValidate/.test(src)) fail('no beforeValidate hook in Projects.ts', 'copy the slug field from Services.ts, hook and all')
      }],
      ['commit tagged (step 1)', () => { if (!hasCommitTag('step 1')) fail('no commit with "(step 1)" in its message', 'git commit -m "feat(cms): add projects collection (step 1)"') }],
    ],
  },
  2: {
    title: 'Seed: three projects',
    checks: [
      ['at least 3 projects exist', async () => {
        const { totalDocs } = await projects()
        if (totalDocs < 3) fail(`${totalDocs} project(s) in the database, need 3`, 'add them to seed.ts and run pnpm seed')
      }],
      ['every project has the required fields filled', async () => {
        const { docs } = await projects()
        for (const d of docs) {
          const bad = ['title', 'client', 'role', 'summary', 'completedOn'].filter((f) => !d[f])
          if (!Array.isArray(d.stack) || d.stack.length < 1) bad.push('stack (min 1)')
          if (!Array.isArray(d.highlights) || d.highlights.length < 1) bad.push('highlights (min 1)')
          if (bad.length) fail(`"${d.title || d.id}" is missing ${bad.join(', ')}`)
        }
      }],
      ['seed is idempotent (running it again does not duplicate)', async () => {
        const before = (await projects()).totalDocs
        const r = run('pnpm', ['seed'])
        if (r.status !== 0) fail('pnpm seed exited non-zero', (r.stderr || r.stdout).split('\n').slice(-5).join('\n      '))
        const after = (await projects()).totalDocs
        if (after !== before) fail(`projects went from ${before} to ${after} after re-running the seed`, 'find by slug first, create only if missing (see the services loop in seed.ts)')
      }],
      ['newest project sorts first', async () => {
        const { docs } = await projects()
        const dates = docs.map((d) => d.completedOn)
        const sorted = [...dates].sort().reverse()
        if (dates.join() !== sorted.join()) fail('completedOn values are not in descending order for sort=-completedOn', 'check the date values you seeded')
      }],
      ['commit tagged (step 2)', () => { if (!hasCommitTag('step 2')) fail('no commit with "(step 2)" in its message', 'git commit -m "feat(cms): seed projects (step 2)"') }],
    ],
  },
  3: {
    title: 'Projects archive page',
    checks: [
      ['GET /projects returns 200', async () => {
        const r = await http(`${WEB}/projects`)
        if (r.status !== 200) fail(`/projects returned ${r.status}`, 'create apps/web/src/pages/projects/index.astro')
      }],
      ['every project is linked, newest first', async () => {
        const { docs } = await projects()
        const html = (await http(`${WEB}/projects`)).text
        const order = docs.map((d) => html.indexOf(`/projects/${d.slug}`))
        const missing = docs.filter((_, i) => order[i] === -1).map((d) => d.slug)
        if (missing.length) fail(`no link to /projects/${missing[0]} on the archive page`, 'the card should be an <a href="/projects/{slug}">')
        for (let i = 1; i < order.length; i++) if (order[i] < order[i - 1]) fail('cards are not in newest-first order', "getDocs('projects', { sort: '-completedOn' })")
      }],
      ['ProjectCard component exists and is typed from the CMS', () => {
        const p = resolve(root, 'apps/web/src/components/ProjectCard.astro')
        if (!existsSync(p)) fail('apps/web/src/components/ProjectCard.astro not found', 'mirror ServiceCard.astro')
        if (!/from ['"]@cms\/payload-types['"]/.test(readFileSync(p, 'utf8'))) fail('ProjectCard does not import its prop type from @cms/payload-types', "import type { Project } from '@cms/payload-types'")
      }],
      ['nav links to /projects', async () => {
        const html = (await http(`${WEB}/`)).text
        if (!/href="\/projects"/.test(html)) fail('no <a href="/projects"> in the site header', 'the link is already in Base.astro; did you remove it?')
      }],
      ['pnpm typecheck passes', () => { const e = typecheck(); if (e) fail('typecheck failed', e) }],
      ['commit tagged (step 3)', () => { if (!hasCommitTag('step 3')) fail('no commit with "(step 3)" in its message', 'git commit -m "feat(web): projects archive page (step 3)"') }],
    ],
  },
  4: {
    title: 'Project detail page',
    checks: [
      ['GET /projects/<slug> renders the project', async () => {
        const { docs } = await projects()
        const d = docs[0]
        const r = await http(`${WEB}/projects/${d.slug}`)
        if (r.status !== 200) fail(`/projects/${d.slug} returned ${r.status}`, 'create apps/web/src/pages/projects/[slug].astro')
        for (const needle of [d.title, d.client, d.role]) if (!r.text.includes(escapeHtml(needle))) fail(`"${needle}" is not on the page`, 'render title, client pill and role in the meta row')
        for (const h of d.highlights) if (!r.text.includes(escapeHtml(h.value))) fail(`highlight "${h.value}" is not on the page`, 'render highlights as the .stats grid')
        for (const s of d.stack) if (!r.text.includes(escapeHtml(s.name))) fail(`stack item "${s.name}" is not on the page`, 'render the stack as pills')
      }],
      ['unknown slug returns 404', async () => {
        const r = await http(`${WEB}/projects/this-project-does-not-exist-xyz`)
        if (r.status !== 404) fail(`unknown slug returned ${r.status}`, 'return new Response(null, { status: 404 }) when getDocBySlug returns null')
      }],
      ['pnpm typecheck passes', () => { const e = typecheck(); if (e) fail('typecheck failed', e) }],
      ['commit tagged (step 4)', () => { if (!hasCommitTag('step 4')) fail('no commit with "(step 4)" in its message', 'git commit -m "feat(web): project detail page (step 4)"') }],
    ],
  },
  5: {
    title: 'Profile global + About page',
    checks: [
      ['GET /api/globals/profile is public and filled in', async () => {
        const r = await http(`${CMS}/api/globals/profile`)
        if (r.status !== 200) fail(`GET /api/globals/profile returned ${r.status}`, 'create apps/cms/src/globals/Profile.ts and register it under `globals` in payload.config.ts')
        const missing = ['name', 'headline', 'bio'].filter((f) => !r.json?.[f])
        if (missing.length) fail(`profile is missing ${missing.join(', ')}`, 'fill it in the admin panel (Globals → Profile) or seed it with payload.updateGlobal')
      }],
      ['GET /about renders the profile', async () => {
        const p = (await http(`${CMS}/api/globals/profile`)).json || {}
        const r = await http(`${WEB}/about`)
        if (r.status !== 200) fail(`/about returned ${r.status}`, 'create apps/web/src/pages/about.astro')
        for (const needle of [p.name, p.headline]) if (needle && !r.text.includes(escapeHtml(needle))) fail(`"${needle}" is not on /about`)
        if (Array.isArray(p.links)) for (const l of p.links) if (!r.text.includes(l.url)) fail(`link "${l.label}" is not on /about`, 'render the links array as pills')
      }],
      ['nav links to /about', async () => {
        const html = (await http(`${WEB}/`)).text
        if (!/href="\/about"/.test(html)) fail('no <a href="/about"> in the site header', 'the link is already in Base.astro; did you remove it?')
      }],
      ['pnpm typecheck passes', () => { const e = typecheck(); if (e) fail('typecheck failed', e) }],
      ['commit tagged (step 5)', () => { if (!hasCommitTag('step 5')) fail('no commit with "(step 5)" in its message', 'git commit -m "feat: profile global and about page (step 5)"') }],
    ],
  },
  6: {
    title: 'Two stretch cards',
    checks: [
      ['at least two cards committed, each tagged (card X)', () => {
        const tags = [...new Set([...gitLog().matchAll(/\(card ([A-G])\)/g)].map((m) => m[1]))]
        if (tags.length < 2) fail(`${tags.length} card(s) tagged: ${tags.join(', ') || 'none'}`, 'commit each finished card with "(card A)" … "(card G)" in the message')
      }],
      ['each tagged card is visible in the API', async () => {
        const tags = [...new Set([...gitLog().matchAll(/\(card ([A-G])\)/g)].map((m) => m[1]))]
        const { docs } = await projects('?limit=100&depth=1')
        const probes = {
          A: [() => docs.some((d) => Array.isArray(d.services) && d.services.some((s) => typeof s === 'object')), 'no project has a populated services relationship (depth=1)'],
          B: [() => docs.some((d) => d.heroImage && typeof d.heroImage === 'object' && d.heroImage.url), 'no project has a heroImage upload'],
          C: [() => docs.some((d) => d.body && typeof d.body === 'object'), 'no project has rich text in body'],
          D: [() => docs.some((d) => d.seo && (d.seo.title || d.seo.description)), 'no project has seo.title or seo.description filled'],
          E: [() => docs.some((d) => Array.isArray(d.layout) && d.layout.length > 0), 'no project has any blocks in layout'],
        }
        for (const t of tags) if (probes[t] && !probes[t][0]()) fail(`card ${t}: ${probes[t][1]}`)
      }],
      ['pnpm typecheck passes', () => { const e = typecheck(); if (e) fail('typecheck failed', e) }],
    ],
  },
}
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// ── runner ────────────────────────────────────────────────────────────────
async function runStep(n) {
  const step = steps[n]
  console.log(`\n${c.b}Step ${n} · ${step.title}${c.x}`)
  for (const [label, check] of step.checks) {
    try {
      await check()
      console.log(`  ${c.g}✔${c.x} ${label}`)
    } catch (err) {
      if (!(err instanceof Failed)) throw err
      console.log(`  ${c.r}✘${c.x} ${label}\n      ${c.r}${err.message}${c.x}`)
      return false
    }
  }
  return true
}

async function runUpTo(target) {
  const progress = loadProgress()
  let reached = -1
  for (let n = 0; n <= target; n++) {
    const ok = await runStep(n)
    progress.steps[n] = { ok, at: new Date().toISOString() }
    if (!ok) { for (let m = n + 1; m <= LAST_STEP; m++) delete progress.steps[m]; break }
    reached = n
  }
  saveProgress(progress)
  return reached
}

function status() {
  const p = loadProgress()
  console.log(`${c.b}Workshop progress${c.x} ${c.d}(${progressFile})${c.x}`)
  for (let n = 0; n <= LAST_STEP; n++) {
    const s = p.steps[n]
    const mark = !s ? `${c.d}·${c.x}` : s.ok ? `${c.g}✔${c.x}` : `${c.r}✘${c.x}`
    console.log(`  ${mark} step ${n} · ${steps[n].title}${s ? ` ${c.d}${s.at.replace('T', ' ').slice(0, 16)}${c.x}` : ''}`)
  }
  const cards = [...new Set([...gitLog().matchAll(/\(card ([A-G])\)/g)].map((m) => m[1]))]
  console.log(`  ${c.d}cards committed: ${cards.join(', ') || 'none'}${c.x}`)
}

async function main() {
  if (args[0] === '--status') return status()

  if (args[0] === '--gate') {
    const msg = args.slice(1).join(' ')
    const step = msg.match(/\(step ([0-6])\)/)
    const card = msg.match(/\(card ([A-G])\)/)
    if (!step && !card) return // untagged commit: not gated
    const target = step ? Number(step[1]) : 5
    globalThis.__gateTag = step ? `step ${step[1]}` : `card ${card[1]}`
    console.log(`${c.y}gate:${c.x} verifying step ${target} before allowing a commit tagged (${globalThis.__gateTag})`)
    const reached = await runUpTo(target)
    if (reached < target) {
      console.log(`\n${c.r}Commit refused: step ${target} is not green yet. Fix the ✘ above, then commit again.${c.x}`)
      process.exit(1)
    }
    console.log(`\n${c.g}Step ${target} is green. Commit allowed.${c.x}`)
    return
  }

  const target = args[0] !== undefined ? Number(args[0]) : LAST_STEP
  if (!Number.isInteger(target) || target < 0 || target > LAST_STEP) {
    console.error(`usage: pnpm verify [0-${LAST_STEP}] | --status | --gate "<message>"`)
    process.exit(2)
  }
  const reached = await runUpTo(target)
  console.log('')
  if (reached === target) console.log(`${c.g}${c.b}All green through step ${target}.${c.x}${target < LAST_STEP ? ` Next: step ${target + 1} in docs/TASK_BRIEF.md` : ' You have a portfolio. Take-home: docs/TASK_BRIEF.md step 7.'}`)
  else console.log(`${c.y}${c.b}You are at step ${reached + 1}.${c.x} Fix the ✘ above, then run pnpm verify again.`)
  process.exit(reached === target ? 0 : 1)
}

main().catch((err) => { console.error(err); process.exit(1) })
