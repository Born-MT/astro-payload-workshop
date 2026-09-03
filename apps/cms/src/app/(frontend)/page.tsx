import React from 'react'

import './styles.css'

/**
 * This Next.js page only exists because Payload 3 runs inside Next.
 * The real website is the Astro app in apps/web (http://localhost:4321).
 */
export default function HomePage() {
  return (
    <div className="home">
      <div className="content">
        <h1>Payload CMS is running</h1>
        <p>This is the CMS app. The website lives in the Astro app.</p>
        <div className="links">
          <a className="admin" href="/admin">
            Open the admin panel
          </a>
          <a className="docs" href="http://localhost:4321" rel="noopener noreferrer">
            Open the Astro site
          </a>
          <a className="docs" href="/api/services" rel="noopener noreferrer">
            REST: /api/services
          </a>
        </div>
      </div>
    </div>
  )
}
