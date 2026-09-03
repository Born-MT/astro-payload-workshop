import type { CollectionConfig } from 'payload'

/**
 * Upload collection. WordPress analogy: the Media Library.
 * Files are written to ./media and served from /api/media/file/<filename>.
 * Payload generates the `sizes` below with sharp, like WP's add_image_size().
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // public: the Astro site needs to load images
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
