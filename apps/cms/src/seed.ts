/**
 * Seed script: creates the admin user and the worked-example Services.
 * Steps 2 and 5 of the workshop add your projects and your profile below.
 * Run with `pnpm seed` (from apps/cms) or `pnpm seed` from the repo root.
 * Safe to re-run: it skips anything that already exists.
 *
 * Add your own seed data at the bottom (see the TODO).
 */
import 'dotenv/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from './payload.config'
import type { Project } from './payload-types'

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

// wp_posts + wp_postmeta rows from sample-content.sql, as Payload documents.
// ACF repeaters (stack_0_name, highlights_0_value...) become arrays of objects.
const projects = [
  {
    title: 'Maltese Artisan Marketplace',
    slug: 'maltese-artisan-marketplace',
    client: 'Malta Crafts Council',
    role: 'Lead developer',
    summary: 'A headless storefront for 60 local makers, replacing a WooCommerce site that took 9s to load.',
    projectUrl: 'https://example.com/artisans',
    repoUrl: 'https://github.com/example/artisans',
    completedOn: '2026-03-14',
    stack: [{ name: 'Astro' }, { name: 'Payload' }, { name: 'Stripe' }],
    highlights: [
      { value: '0.9s', label: 'Largest Contentful Paint' },
      { value: '+38%', label: 'Conversion rate' },
      { value: '60', label: 'Makers onboarded' },
    ],
  },
  {
    title: 'Harbour Ferries Booking',
    slug: 'harbour-ferries-booking',
    client: 'Grand Harbour Ferries',
    role: 'Backend developer',
    summary: 'Real-time timetable and ticketing for a ferry operator, rebuilt from a brittle WordPress plugin.',
    projectUrl: 'https://example.com/ferries',
    completedOn: '2026-06-02',
    stack: [{ name: 'Payload' }, { name: 'PostgreSQL' }],
    highlights: [
      { value: '12k', label: 'Tickets sold in month one' },
      { value: '-70%', label: 'Support emails' },
    ],
  },
  {
    title: 'Valletta Arts Festival',
    slug: 'valletta-arts-festival',
    client: 'Valletta Cultural Agency',
    role: 'Front-end developer',
    summary: 'Programme, venues and ticket links for a 3-week festival, edited by a non-technical team.',
    completedOn: '2026-08-20',
    stack: [{ name: 'Astro' }, { name: 'Payload' }],
    highlights: [
      { value: '140', label: 'Events published' },
      { value: '4 days', label: 'From brief to launch' },
    ],
  },
]

// Card A: the `services` postmeta in sample-content.sql, decoded from WP service IDs to slugs.
const projectServices: Record<string, string[]> = {
  'maltese-artisan-marketplace': ['e-commerce', 'web-development'],
  'harbour-ferries-booking': ['web-development'],
  'valletta-arts-festival': ['brand-ui-design', 'growth-seo'],
}

// Card C: Lexical JSON, the shape the admin editor saves. A heading, two paragraphs, a list.
// Typed from the generated Project type so a wrong shape fails typecheck, not the editor.
type Story = NonNullable<Project['body']>
type StoryNode = Story['root']['children'][number]
const text = (t: string): StoryNode => ({ type: 'text', text: t, version: 1, format: 0, mode: 'normal', style: '', detail: 0 })
const block = (type: string, children: StoryNode[], extra: Record<string, unknown> = {}): StoryNode => ({
  type,
  children,
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  ...extra,
})
const artisanStory: Story = {
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [
      block('heading', [text('The problem')], { tag: 'h2' }),
      block('paragraph', [text('Sixty makers, one WooCommerce site, nine seconds to first paint. Every product edit went through the agency.')]),
      block('heading', [text('What we built')], { tag: 'h2' }),
      block('paragraph', [text('A Payload CMS the makers log into themselves, and an Astro storefront that renders their products as plain HTML.')]),
      block(
        'list',
        [
          block('listitem', [text('Product and maker collections, typed end to end')], { value: 1 }),
          block('listitem', [text('Stripe checkout on a server endpoint, no client JavaScript')], { value: 2 }),
          block('listitem', [text('Largest Contentful Paint under a second on 3G')], { value: 3 }),
        ],
        { listType: 'bullet', tag: 'ul', start: 1 },
      ),
    ],
  },
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

  // 3. Projects (step 2). Ported from wordpress-reference/portfolio-plugin/sample-content.sql.
  //    Replace these three with things you actually built.
  // Card A: the WP `services` meta stores service IDs. Resolve them by slug, never by number.
  const serviceIdBySlug = new Map<string, number>()
  for (const service of services) {
    const found = await payload.find({ collection: 'services', where: { slug: { equals: service.slug } }, limit: 1 })
    if (found.docs[0]) serviceIdBySlug.set(service.slug, found.docs[0].id)
  }

  for (const project of projects) {
    const relatedServices = (projectServices[project.slug] ?? [])
      .map((slug) => serviceIdBySlug.get(slug))
      .filter((id): id is number => id !== undefined)
    const found = await payload.find({
      collection: 'projects',
      where: { slug: { equals: project.slug } },
      limit: 1,
    })
    if (found.totalDocs === 0) {
      await payload.create({ collection: 'projects', data: { ...project, services: relatedServices } })
      payload.logger.info(`Created project "${project.title}"`)
    } else if (!found.docs[0].services?.length && relatedServices.length) {
      // Projects seeded before card A exist without services: link them once.
      await payload.update({ collection: 'projects', id: found.docs[0].id, data: { services: relatedServices } })
      payload.logger.info(`Linked services on "${project.title}"`)
    }
  }

  // Card B: a hero image for the first project, uploaded from a file like WP's media_sideload_image().
  const heroFile = resolve(dirname(fileURLToPath(import.meta.url)), 'seed-assets/artisan-marketplace.png')
  const existingHero = await payload.find({ collection: 'media', where: { filename: { equals: 'artisan-marketplace.png' } }, limit: 1 })
  const hero =
    existingHero.docs[0] ??
    (await payload.create({
      collection: 'media',
      filePath: heroFile,
      data: { alt: 'Storefront of the Maltese Artisan Marketplace' },
    }))
  const artisan = await payload.find({ collection: 'projects', where: { slug: { equals: 'maltese-artisan-marketplace' } }, limit: 1 })
  if (artisan.docs[0] && !artisan.docs[0].heroImage) {
    await payload.update({ collection: 'projects', id: artisan.docs[0].id, data: { heroImage: hero.id } })
    payload.logger.info('Attached the hero image to "Maltese Artisan Marketplace"')
  }

  // Card C: the story. In WP this would be post_content HTML; Payload stores the editor's JSON.
  if (artisan.docs[0] && !artisan.docs[0].body) {
    await payload.update({ collection: 'projects', id: artisan.docs[0].id, data: { body: artisanStory } })
    payload.logger.info('Wrote the story on "Maltese Artisan Marketplace"')
  }

  // 4. Profile global (step 5). Ported from the wp_options rows in sample-content.sql.
  //    A global always exists, so this is an update, not a find-then-create. Replace with you.
  const profile = await payload.findGlobal({ slug: 'profile' })
  if (!profile.name) {
    await payload.updateGlobal({
      slug: 'profile',
      data: {
        name: 'Sam Borg',
        headline: 'WordPress developer moving to Astro + Payload',
        bio: 'I have built WordPress sites for small businesses in Malta since 2022. I am now learning to model content in code and to ship fast, accessible front-ends with Astro. I want my next project to be typed end to end.',
        email: 'sam@example.com',
        location: 'Valletta, Malta',
        links: [
          { label: 'GitHub', url: 'https://github.com/example' },
          { label: 'LinkedIn', url: 'https://www.linkedin.com/in/example' },
        ],
      },
    })
    payload.logger.info('Filled in the profile global')
  }

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
