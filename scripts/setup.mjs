// One-shot setup: copies .env files, generates a secret, seeds the DB.
// Run once after `pnpm install`: `pnpm setup`
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const apps = { cms: resolve(root, 'apps/cms'), web: resolve(root, 'apps/web') }

for (const [name, dir] of Object.entries(apps)) {
  const example = resolve(dir, '.env.example')
  const env = resolve(dir, '.env')
  if (existsSync(env)) {
    console.log(`✔ apps/${name}/.env already exists, leaving it alone`)
    continue
  }
  copyFileSync(example, env)
  if (name === 'cms') {
    const secret = randomBytes(32).toString('hex')
    writeFileSync(env, readFileSync(env, 'utf8').replace(/PAYLOAD_SECRET=.*/, `PAYLOAD_SECRET=${secret}`))
  }
  console.log(`✔ created apps/${name}/.env`)
}

console.log('→ wiring git hooks (secret scan + workshop step gate)')
execSync('git config core.hooksPath .claude/githooks', { stdio: 'inherit', cwd: root })
console.log('→ generating Payload types')
execSync('pnpm --filter cms generate:types', { stdio: 'inherit', cwd: root })
console.log('→ seeding database')
execSync('pnpm --filter cms seed', { stdio: 'inherit', cwd: root })
console.log('\nAll set. Run `pnpm dev`, then open http://localhost:4321 and http://localhost:3300/admin')
console.log('Then, with both servers running: `pnpm verify 0`')
console.log('Admin login: admin@webee.local / workshop123')
