/**
 * Seed script: creates the admin user and the worked-example Services.
 * Steps 2 and 5 of the workshop add your projects and your profile below.
 * Run with `pnpm seed` (from apps/cms) or `pnpm seed` from the repo root.
 * Safe to re-run: it skips anything that already exists.
 *
 * Add your own seed data at the bottom (see the TODO).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

export const ADMIN_EMAIL = 'admin@webee.local'
export const ADMIN_PASSWORD = 'workshop123'

const services = [
  {
    title: 'Web Development',
    slug: 'web-development',
    summary: 'Fast, accessible websites built on Astro with a Payload CMS behind them.',
    icon: 'code',
    order: 1,
  },
  {
    title: 'Brand & UI Design',
    slug: 'brand-ui-design',
    summary: 'Identity systems and interface design that developers can actually build.',
    icon: 'design',
    order: 2,
  },
  {
    title: 'E-commerce',
    slug: 'e-commerce',
    summary: 'Headless storefronts, checkout flows and integrations with ERPs and PIMs.',
    icon: 'commerce',
    order: 3,
  },
  {
    title: 'Growth & SEO',
    slug: 'growth-seo',
    summary: 'Technical SEO, analytics and conversion work that compounds over time.',
    icon: 'growth',
    order: 4,
  },
] as const

/**
 * Boot Payload for the seed. With `push: true`, both this process and a running `pnpm dev`
 * try to sync the SQLite schema; right after a field change they can race and one of them
 * fails with "index … already exists". That is harmless, so wait a moment and try again.
 */
async function connect(attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getPayload({ config })
    } catch (err) {
      const text = `${(err as Error)?.message ?? ''} ${((err as { cause?: Error })?.cause?.message) ?? ''}`
      if (!/already exists/.test(text) || attempt >= attempts) throw err
      console.warn(`seed: schema push raced the dev server (attempt ${attempt}/${attempts}), retrying in ${attempt * 3}s`)
      await new Promise((resolve) => setTimeout(resolve, attempt * 3000))
    }
  }
}

async function seed() {
  const payload = await connect()

  // 1. Admin user
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Workshop Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    })
    payload.logger.info(`Created admin user ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } else {
    payload.logger.info('Admin user already exists, skipping')
  }

  // 2. Services (worked example)
  for (const service of services) {
    const found = await payload.find({
      collection: 'services',
      where: { slug: { equals: service.slug } },
      limit: 1,
    })
    if (found.totalDocs === 0) {
      await payload.create({ collection: 'services', data: service })
      payload.logger.info(`Created service "${service.title}"`)
    }
  }

  // TODO (step 2): seed 3 projects here, same find-by-slug-then-create pattern as services.
  //   Source: wordpress-reference/portfolio-plugin/sample-content.sql — then replace them with
  //   three things you actually built.
  // TODO (step 5): seed the profile global with payload.updateGlobal({ slug: 'profile', data: {...} }).

  payload.logger.info('Seed complete')
}

// Top-level await matters: `payload run` calls process.exit() as soon as this module
// finishes evaluating, so a plain `seed()` call would be killed before it does anything.
try {
  await seed()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
