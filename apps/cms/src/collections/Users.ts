import type { CollectionConfig } from 'payload'

/**
 * Admin users. `auth: true` gives us login, sessions and the /api/users/login endpoint.
 * WordPress analogy: wp_users, but you define the fields.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Only logged-in users can see other users. Nobody anonymous.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    // `email` and `password` are added automatically by `auth: true`.
  ],
}
