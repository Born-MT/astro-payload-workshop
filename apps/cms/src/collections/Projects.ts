import type { CollectionConfig } from 'payload'

/**
 * Ported from wordpress-reference/portfolio-plugin:
 *   register_post_type('project')     -> this collection
 *   ACF group "Project details"       -> `fields`
 *   wp_insert_post_data auto-slug     -> slug field beforeValidate hook
 *
 * Core fields only (step 1). services / heroImage / body / seo are stretch cards.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'role', 'completedOn', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL-safe. Leave blank to generate from the title.' },
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
      name: 'client',
      type: 'text',
      required: true,
      admin: { description: 'Who it was for. "Personal" for a side project.' },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { placeholder: 'Lead developer', description: 'What you did on it, in three words.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 240,
      admin: { description: 'One or two sentences for the listing card.' },
    },
    // Card B — WordPress analogy: ACF Image field, backed by the Media Library.
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'projectUrl', type: 'text', label: 'Live URL', admin: { position: 'sidebar' } },
    { name: 'repoUrl', type: 'text', label: 'Repository URL', admin: { position: 'sidebar' } },
    {
      name: 'completedOn',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    // Card A — WordPress analogy: ACF Post Object / Relationship field.
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'stack',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      labels: { singular: 'Technology', plural: 'Tech stack' },
      fields: [{ name: 'name', type: 'text', required: true, admin: { placeholder: 'Astro' } }],
    },
    {
      name: 'highlights',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Highlight', plural: 'Highlights' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { placeholder: '0.9s' } },
        { name: 'label', type: 'text', required: true, admin: { placeholder: 'Largest Contentful Paint' } },
      ],
    },
  ],
}
