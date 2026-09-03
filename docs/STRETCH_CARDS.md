# Stretch cards

Pick any, in any order, once the core task is green and committed. Each maps to a field you
skipped in the ACF export. Each is a ticket: paste it to Claude Code with its acceptance criteria.

---

### 🟢 Card A — Relationship: link case studies to services (ACF Post Object → `relationship`)

Add a `services` field to `case-studies`: `relationship` to `services`, `hasMany: true`. Seed it (see the `services` meta in `sample-content.sql` — the numbers are service IDs in WP order: 1 web-development, 2 brand-ui-design, 3 e-commerce, 4 growth-seo; look them up by slug in the seed). Show service pills on the detail page, and on each service page list the case studies that used it.

- [ ] `GET /api/case-studies?depth=1` returns populated service objects, not just IDs.
- [ ] `/services/web-development` lists 2 related case studies (`where[services][contains]=<id>`).
- [ ] Typecheck passes: `services` items are `number | Service` — handle both.

---

### 🟢 Card B — Media: hero image (ACF Image → `upload`)

Add `heroImage` (`upload`, relationTo `media`) to `case-studies`. Upload any image through the admin panel for one case study. Render it with the `.hero` class on the detail page and the card thumbnail on the archive, using `mediaUrl()` and the `card` / `hero` sizes Payload generated.

- [ ] Image renders on both pages; `alt` comes from the media doc.
- [ ] Case studies without an image render fine.
- [ ] Stretch-stretch: seed the image from a file in `apps/cms/src/seed-assets/` using `payload.create({ collection: 'media', filePath })`.

---

### 🟡 Card C — Rich text: the story (ACF WYSIWYG → `richText`)

Add `body` (`richText`) to `case-studies`. Write a few paragraphs with a heading and a list in the admin panel. Render it in the detail page's `.prose` div.

- [ ] `pnpm --filter web add @payloadcms/richtext-lexical@3.88.0`, then `convertLexicalToHTML({ data: doc.body })` from `@payloadcms/richtext-lexical/html`.
- [ ] Headings and lists render as real HTML elements.
- [ ] Ask Claude: *"Why does Payload store rich text as JSON instead of HTML?"* and be able to answer it.

---

### 🟡 Card D — SEO group (ACF group → `group` + Astro `<slot name="head">`)

Add an `seo` group field with `title` (max 60) and `description` (max 160), in a sidebar tab. On the detail page, use them for `<title>` and `<meta name="description">`, falling back to the case study title and summary. Add `og:title` / `og:description` too.

- [ ] View source of a case study page shows the meta tags.
- [ ] The fallback works when the group is empty.

---

### 🔴 Card E — Blocks: flexible page sections (Gutenberg / ACF Flexible Content → `blocks`)

Add a `layout` blocks field with two blocks: `Quote` (`quote` textarea, `attribution` text) and `ImageText` (`image` upload, `text` richText, `imageSide` select left/right). Render each block with its own Astro component, switching on `blockType`.

- [ ] `/payload-new-block` is installed; use it, then read what it generated.
- [ ] Adding, reordering and removing blocks in the admin changes the page on refresh.
- [ ] Each block is its own component in `apps/web/src/components/blocks/`.

---

### 🔴 Card F — Hooks: `save_post` → `beforeChange` / `afterChange`

1. `beforeChange`: if `completedOn` is in the future, throw a `ValidationError` (Payload exports it). Admin shows the error.
2. `afterChange`: log `"[case-studies] <slug> saved by <user email>"` via `req.payload.logger.info`. Bonus: a `featured` checkbox with a hook that ensures only one case study is featured at a time (unset the others — and guard against re-entry with `req.context`).

- [ ] Ask Claude to explain how this differs from `save_post` in WordPress (hint: transactions, `req`).

---

### ⚫ Card G — Reviewer's card (no code)

Run `/code-review` (or the installed `code-reviewer` agent) on your branch. Fix one real finding. Then run `/security-scan`. Write down in one sentence what each tool caught that you missed.
