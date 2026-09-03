# WordPress reference: the "Case Studies" feature you are porting

This folder is a **frozen snapshot of a WordPress feature**. It does not run here; it exists so
you have something concrete to port. Read it, then rebuild it in Payload + Astro.

| WordPress file | What it does | Where it goes in this repo |
| --- | --- | --- |
| `case-study-plugin/case-study-cpt.php` | `register_post_type('case_study')` | `apps/cms/src/collections/CaseStudies.ts` |
| `case-study-plugin/acf-export-case-study.json` | ACF field group (client, summary, results…) | the `fields` array in that same file |
| `case-study-plugin/sample-content.sql` | 3 demo posts + meta | `apps/cms/src/seed.ts` |
| `theme/archive-case_study.php` | listing page, `/case-studies/` | `apps/web/src/pages/case-studies/index.astro` |
| `theme/single-case_study.php` | detail page, `/case-studies/{slug}/` | `apps/web/src/pages/case-studies/[slug].astro` |
| `theme/template-parts/content-case_study.php` | card partial | `apps/web/src/components/CaseStudyCard.astro` |

## Vocabulary map

| WordPress | Payload | Astro |
| --- | --- | --- |
| Custom Post Type | Collection | — |
| ACF field group | `fields: []` on the collection | — |
| `post_title`, `post_name` | `title`, `slug` fields (you define them) | — |
| ACF Repeater | `array` field | — |
| ACF Post Object / Relationship | `relationship` field | — |
| ACF Image | `upload` field → `media` collection | — |
| ACF Flexible Content / Gutenberg blocks | `blocks` field | — |
| ACF WYSIWYG | `richText` field (Lexical) | render with `convertLexicalToHTML` |
| `wp-admin` | `/admin` (generated from your fields) | — |
| `/wp-json/wp/v2/case_study` | `/api/case-studies` (generated) | fetched in the page frontmatter |
| `WP_Query` args | `?where[...]&sort=&limit=` | `getDocs('case-studies', {...})` |
| `archive-*.php` | — | `pages/case-studies/index.astro` |
| `single-*.php` | — | `pages/case-studies/[slug].astro` |
| `template-parts/` | — | `components/` |
| `header.php` / `footer.php` | — | `layouts/Base.astro` |
| `save_post` action | `beforeChange` / `afterChange` hook | — |
| `sanitize_title()` on save | field-level `beforeValidate` hook | — |
| `the_content` filter | field `afterRead` hook | — |
| `add_image_size()` | `upload.imageSizes` on Media | — |
| Yoast SEO | your own `seo` group field (or `@payloadcms/plugin-seo`) | `<slot name="head">` |
