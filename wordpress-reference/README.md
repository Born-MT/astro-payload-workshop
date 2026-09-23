# WordPress reference: the portfolio you are porting

This folder is a **frozen snapshot of a WordPress portfolio site**: a "Project" custom post type
with ACF fields, the theme templates that render it, and an ACF options page for the developer's
profile. It does not run here. It exists so you have something concrete to port, one piece at a time,
into the Payload + Astro portfolio you will own by the end of the session.

| WordPress file | What it does | Where it goes in this repo | Step |
| --- | --- | --- | --- |
| `portfolio-plugin/portfolio-cpt.php` | `register_post_type('project')` + the Profile options page | `apps/cms/src/collections/Projects.ts`, `apps/cms/src/globals/Profile.ts` | 1, 5 |
| `portfolio-plugin/acf-export-project.json` | ACF field group for a project (client, role, stack, highlights…) | the `fields` array in `Projects.ts` | 1 |
| `portfolio-plugin/acf-export-profile.json` | ACF options page fields (name, headline, bio, links) | the `fields` array in `Profile.ts` | 5 |
| `portfolio-plugin/sample-content.sql` | 3 demo projects + the profile options | `apps/cms/src/seed.ts` | 2, 5 |
| `theme/archive-project.php` | listing page, `/projects/` | `apps/web/src/pages/projects/index.astro` | 3 |
| `theme/template-parts/content-project.php` | card partial | `apps/web/src/components/ProjectCard.astro` | 3 |
| `theme/single-project.php` | detail page, `/projects/{slug}/` | `apps/web/src/pages/projects/[slug].astro` | 4 |
| `theme/page-about.php` | the About page, reads the options page | `apps/web/src/pages/about.astro` | 5 |

## Vocabulary map

| WordPress | Payload | Astro |
| --- | --- | --- |
| Custom Post Type | Collection | — |
| ACF field group | `fields: []` on the collection | — |
| ACF Options Page | **Global** (one document, no list) | — |
| `post_title`, `post_name` | `title`, `slug` fields (you define them) | — |
| ACF Repeater | `array` field | — |
| ACF Post Object / Relationship | `relationship` field | — |
| ACF Image | `upload` field → `media` collection | — |
| ACF Flexible Content / Gutenberg blocks | `blocks` field | — |
| ACF WYSIWYG | `richText` field (Lexical) | render with `convertLexicalToHTML` |
| `wp-admin` | `/admin` (generated from your fields) | — |
| `/wp-json/wp/v2/project` | `/api/projects` (generated) | fetched in the page frontmatter |
| `/wp-json/acf/v3/options/options` | `/api/globals/profile` (generated) | fetched in the page frontmatter |
| `WP_Query` args | `?where[...]&sort=&limit=` | `getDocs('projects', {...})` |
| `get_field('name', 'option')` | `GET /api/globals/profile` | `getGlobal('profile')` |
| `archive-*.php` | — | `pages/projects/index.astro` |
| `single-*.php` | — | `pages/projects/[slug].astro` |
| `page-about.php` | — | `pages/about.astro` |
| `template-parts/` | — | `components/` |
| `header.php` / `footer.php` | — | `layouts/Base.astro` |
| `save_post` action | `beforeChange` / `afterChange` hook | — |
| `sanitize_title()` on save | field-level `beforeValidate` hook | — |
| `the_content` filter | field `afterRead` hook | — |
| `add_image_size()` | `upload.imageSizes` on Media | — |
| Yoast SEO | your own `seo` group field (or `@payloadcms/plugin-seo`) | `<slot name="head">` |
