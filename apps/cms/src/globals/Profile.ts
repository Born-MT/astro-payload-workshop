import type { GlobalConfig } from 'payload'

/**
 * Ported from wordpress-reference/portfolio-plugin: the ACF options page "Profile".
 * One screen of fields, no list behind it: exactly one document. That is a Global.
 *   get_field('name', 'option')  ->  GET /api/globals/profile
 */
export const Profile: GlobalConfig = {
  slug: 'profile',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'headline',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: { placeholder: 'Full-stack developer who ships fast, accessible websites' },
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      admin: { description: 'Three or four sentences. Who you are, what you build, what you want to build next.' },
    },
    { name: 'email', type: 'text', admin: { position: 'sidebar' } },
    { name: 'location', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'links',
      type: 'array',
      maxRows: 6,
      labels: { singular: 'Link', plural: 'Links' },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { placeholder: 'GitHub' } },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
