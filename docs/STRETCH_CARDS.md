# Stretch cards — step 6

Pick **two**, in any order, once step 5 is green. Each maps to a field you skipped in the ACF export.
Each is a ticket: paste it to Claude Code with its acceptance criteria. Commit each finished card with
its tag; `pnpm verify 6` needs two tagged cards and checks each one in the API.

---

### 🟢 Card A — Relationship: link projects to services (ACF Post Object → `relationship`)

Add a `services` field to `projects`: `relationship` to `services`, `hasMany: true`. Seed it (see the `services` meta in `sample-content.sql`: the numbers are service IDs in WP order: 1 web-development, 2 brand-ui-design, 3 e-commerce, 4 growth-seo; look them up by slug in the seed). Show service pills on the project page, and on each service page list the projects that used it.

- [ ] `GET /api/projects?depth=1` returns populated service objects, not just IDs.
- [ ] `/services/web-development` lists the related projects (`where[services][contains]=<id>`).
- [ ] Typecheck passes: `services` items are `number | Service`, handle both.
- [ ] Commit: `feat(cms): link projects to services (card A)`

---

### 🟢 Card B — Media: hero image (ACF Image → `upload`)

Add `heroImage` (`upload`, relationTo `media`) to `projects`. Upload any image through the admin panel for one project. Render it with the `.hero` class on the project page and as the card thumbnail on the archive, using `mediaUrl()` and the `card` / `hero` sizes Payload generated.

- [ ] Image renders on both pages; `alt` comes from the media doc.
- [ ] Projects without an image render fine.
- [ ] Stretch-stretch: seed the image from a file in `apps/cms/src/seed-assets/` using `payload.create({ collection: 'media', filePath })`.
- [ ] Commit: `feat: project hero image (card B)`

---

### 🟡 Card C — Rich text: the story (ACF WYSIWYG → `richText`)

Add `body` (`richText`, label "Story") to `projects`. Write a few paragraphs with a heading and a list in the admin panel: the problem, what you built, what you learned. Render it in the project page's `.prose` div.

- [ ] `pnpm --filter web add @payloadcms/richtext-lexical@3.88.0`, then `convertLexicalToHTML({ data: project.body })` from `@payloadcms/richtext-lexical/html`.
- [ ] Headings and lists render as real HTML elements.
- [ ] Ask Claude: *"Why does Payload store rich text as JSON instead of HTML?"* and be able to answer it.
- [ ] Commit: `feat: project story as rich text (card C)`

---

### 🟡 Card D — SEO group (ACF group → `group` + Astro `<slot name="head">`)

Add an `seo` group field with `title` (max 60) and `description` (max 160), in a sidebar tab. On the project page, use them for `<title>` and `<meta name="description">`, falling back to the project title and summary. Add `og:title` / `og:description` too. Fill it in for at least one project.

- [ ] View source of a project page shows the meta tags.
- [ ] The fallback works when the group is empty.
- [ ] Commit: `feat: seo fields on projects (card D)`

---

### 🔴 Card E — Blocks: flexible page sections (Gutenberg / ACF Flexible Content → `blocks`)

Add a `layout` blocks field with two blocks: `Quote` (`quote` textarea, `attribution` text) and `ImageText` (`image` upload, `text` richText, `imageSide` select left/right). Render each block with its own Astro component, switching on `blockType`. Add at least one block to one project.

- [ ] `/payload-new-block` is installed; use it, then read what it generated.
- [ ] Adding, reordering and removing blocks in the admin changes the page on refresh.
- [ ] Each block is its own component in `apps/web/src/components/blocks/`.
- [ ] Commit: `feat: project layout blocks (card E)`

---

### 🔴 Card F — Hooks: `save_post` → `beforeChange` / `afterChange`

1. `beforeChange`: if `completedOn` is in the future, throw a `ValidationError` (Payload exports it). Admin shows the error.
2. `afterChange`: log `"[projects] <slug> saved by <user email>"` via `req.payload.logger.info`. Bonus: a `featured` checkbox with a hook that ensures only one project is featured at a time (unset the others, and guard against re-entry with `req.context`).

- [ ] Ask Claude to explain how this differs from `save_post` in WordPress (hint: transactions, `req`).
- [ ] Show the facilitator the validation error in the admin panel. The gate cannot see this one.
- [ ] Commit: `feat(cms): project save hooks (card F)`

---

### ⚫ Card G — Reviewer's card (no code)

Run `/code-review` (or the installed `code-reviewer` agent) on your branch. Fix one real finding. Then run `/security-scan`. Write down in one sentence what each tool caught that you missed, and tell the facilitator.

- [ ] Commit: `chore: review findings (card G)`
