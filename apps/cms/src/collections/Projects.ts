import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { ImageText } from '../blocks/ImageText'
import { Quote } from '../blocks/Quote'

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
  hooks: {
    // Card F — WordPress analogy: a `save_post` / `wp_insert_post_data` handler. Unlike WP, a thrown
    // ValidationError here reaches the admin form as a field error and rolls the transaction back.
    beforeChange: [
      ({ data }) => {
        if (data.completedOn && new Date(data.completedOn) > new Date()) {
          throw new ValidationError({
            errors: [{ path: 'completedOn', message: 'Completion date cannot be in the future.' }],
          })
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        req.payload.logger.info(`[projects] ${doc.slug} saved by ${req.user?.email ?? 'seed'}`)

        // Only one featured project at a time. The update below fires afterChange again, so
        // `req.context` carries a flag that stops the second run from recursing.
        if (doc.featured && !req.context.unfeaturing) {
          await req.payload.update({
            collection: 'projects',
            where: { and: [{ featured: { equals: true } }, { id: { not_equals: doc.id } }] },
            data: { featured: false },
            req, // same transaction as the save that triggered this
            context: { unfeaturing: true },
          })
        }
        return doc
      },
    ],
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
    // Card C — WordPress analogy: ACF WYSIWYG. Stored as Lexical JSON, not HTML.
    {
      name: 'body',
      type: 'richText',
      label: 'Story',
      admin: { description: 'The problem, what you built, what you learned.' },
    },
    { name: 'projectUrl', type: 'text', label: 'Live URL', admin: { position: 'sidebar' } },
    { name: 'repoUrl', type: 'text', label: 'Repository URL', admin: { position: 'sidebar' } },
    {
      name: 'completedOn',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    // Card E — WordPress analogy: ACF Flexible Content / Gutenberg. Each block is its own shape.
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Quote, ImageText],
      admin: { description: 'Optional flexible sections rendered under the story.' },
    },
    // Card D — WordPress analogy: the Yoast box. A group is an ACF group: one object, named sub-fields.
    {
      name: 'seo',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'title', type: 'text', maxLength: 60, admin: { description: 'Falls back to the title.' } },
        { name: 'description', type: 'textarea', maxLength: 160, admin: { description: 'Falls back to the summary.' } },
      ],
    },
    // Card F
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Only one project can be featured. Saving this unsets the others.' },
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
