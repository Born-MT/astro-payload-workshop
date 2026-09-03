/**
 * Tiny typed client for Payload's REST API.
 *
 * WordPress analogy: `wp_remote_get('/wp-json/wp/v2/service')`, but the
 * response types come straight from the CMS (see `@cms/payload-types`).
 *
 * Payload REST cheat sheet (all free, no code in the CMS):
 *   GET /api/<slug>                      list (paginated: docs, totalDocs, page, ...)
 *   GET /api/<slug>?where[slug][equals]=x  filter, like WP_Query meta_query
 *   GET /api/<slug>?sort=order            sort (prefix with - for desc)
 *   GET /api/<slug>?depth=1               populate relationships / uploads
 *   GET /api/<slug>/<id>                  single doc by id
 * Docs: https://payloadcms.com/docs/rest-api/overview
 */
import type { Config } from '@cms/payload-types'

type CollectionSlug = keyof Config['collections']
type Doc<S extends CollectionSlug> = Config['collections'][S]

export interface PaginatedDocs<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

const PAYLOAD_URL = import.meta.env.PAYLOAD_URL ?? 'http://localhost:3300'

export type Query = {
  /** Payload `where` object, serialised with qs-style bracket keys */
  where?: Record<string, unknown>
  sort?: string
  limit?: number
  page?: number
  depth?: number
}

/** Turn a nested object into Payload's `where[slug][equals]=x` query string format. */
function toQueryString(query: Query): string {
  const params = new URLSearchParams()
  const walk = (value: unknown, prefix: string) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}[${k}]` : k)
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${prefix}[${i}]`))
    } else if (value !== undefined) {
      params.set(prefix, String(value))
    }
  }
  walk(query, '')
  const s = params.toString()
  return s ? `?${s}` : ''
}

async function request<T>(path: string): Promise<T> {
  const url = `${PAYLOAD_URL}/api${path}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Payload request failed: ${res.status} ${res.statusText} for ${url}`)
  }
  return res.json() as Promise<T>
}

/** Fetch a page of documents from a collection. */
export function getDocs<S extends CollectionSlug>(
  collection: S,
  query: Query = {},
): Promise<PaginatedDocs<Doc<S>>> {
  return request<PaginatedDocs<Doc<S>>>(`/${collection}${toQueryString({ depth: 1, ...query })}`)
}

/** Fetch one document by its `slug` field, or null if it does not exist. */
export async function getDocBySlug<S extends CollectionSlug>(
  collection: S,
  slug: string,
  query: Omit<Query, 'where' | 'limit'> = {},
): Promise<Doc<S> | null> {
  const result = await getDocs(collection, {
    ...query,
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

/** Build a full URL for an uploaded file (Payload returns relative `url`s). */
export function mediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${PAYLOAD_URL}${url}`
}
