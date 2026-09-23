import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Projects } from './collections/Projects'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3300',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // WordPress analogy: every entry here is a `register_post_type()` call.
  // Add your new collection to this array or it does not exist.
  collections: [Users, Media, Services, Projects],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
    // Dev-only convenience: Payload syncs the SQLite schema to your collections
    // automatically. Real projects turn this off and use migrations (see /payload-migrate).
    push: true,
  }),
  cors: [frontendUrl],
  csrf: [frontendUrl],
  sharp,
  plugins: [],
})
