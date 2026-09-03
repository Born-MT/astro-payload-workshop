// @ts-check
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  // Server-rendered so content changes in Payload show up on refresh, no rebuild.
  // For production you would usually switch to `static` + a build hook,
  // which is the WordPress-cache-plugin problem solved at build time.
  output: 'server',
  server: { port: 4321 },
})
