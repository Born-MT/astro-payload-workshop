import type { Block } from 'payload'

/** Card E — WordPress analogy: one layout in an ACF Flexible Content field, or a Gutenberg block. */
export const Quote: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text', admin: { placeholder: 'Client name, role' } },
  ],
}
