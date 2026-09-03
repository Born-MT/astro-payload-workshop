import type { CollectionConfig } from 'payload'

/**
 * WORKED EXAMPLE — study this before building Case Studies.
 *
 * WordPress analogy:
 *   register_post_type('service')       -> this file + registering it in payload.config.ts
 *   ACF field group "Service details"   -> the `fields` array below
 *   post_name (slug)                    -> the `slug` field (auto-filled by the hook)
 *   menu_order                          -> the `order` field
 *   WP REST /wp-json/wp/v2/service      -> /api/services  (free, no code needed)
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'updatedAt'],
    group: 'Content',
  },
  access: {
    // Public read so the Astro site can fetch without logging in.
    // Everything else needs an admin session.
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-safe. Leave blank to generate from the title.',
      },
      hooks: {
        // WordPress analogy: sanitize_title() run on save.
        beforeValidate: [
          ({ value, siblingData }) => {
            const source = value || siblingData?.title || ''
            return String(source)
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
          },
        ],
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 240,
      admin: {
        description: 'One or two sentences shown on listing cards.',
      },
    },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Code', value: 'code' },
        { label: 'Design', value: 'design' },
        { label: 'Commerce', value: 'commerce' },
        { label: 'Growth', value: 'growth' },
      ],
      defaultValue: 'code',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers show first.',
      },
    },
  ],
}
