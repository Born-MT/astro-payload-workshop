---
name: payload-new-block
description: Scaffold a Payload block for a blocks field — the schema plus its frontend renderer, registered together so layout-builder content actually renders. Use when adding a new section type to a page builder.
argument-hint: "<BlockName> (PascalCase, e.g. Testimonial or FeatureGrid)"
---

# Scaffold a Payload Block

Create the block `$1` — a schema paired with a renderer. A block that exists in the CMS but has no renderer produces a page that silently drops content, so **both halves ship together**. **Load the `payload` skill and its `reference/FIELDS.md`** (the blocks field section) first.

1. **Schema** — `src/blocks/$1.ts` exporting a Payload `Block`:
   - `slug` in camelCase (this is the discriminator the renderer keys on — keep it stable).
   - `interfaceName: '$1Block'` so the generated types are a named interface rather than an inline shape.
   - `fields: [...]` — ask for the fields if they weren't provided. Use rich text (Lexical) for prose, upload relationships for images, and `admin.condition` for variant-dependent fields.
   - Give it a `labels` entry so editors see a readable name in the block picker.

2. **Register the schema** — add `$1` to the `blocks` array of every blocks field that should offer it (commonly a `layout` field on a Pages collection). Mirror how the sibling blocks are registered rather than inventing a second pattern; if the project composes a shared default set, extend it (`blocks: [...defaultBlocks, $1]`).

3. **Renderer** — create the frontend component beside the existing block renderers, following the project's own conventions: reuse its section/container primitives so spacing, width and background alternation match, use its image component rather than a bare `<img>` so images keep their optimisation, and render Lexical content through the project's existing rich-text converter. Read a neighbouring renderer first and copy its structure — consistency here matters more than novelty.

4. **Register the renderer** — add it to the block-to-component map the page template uses, keyed by the schema's camelCase slug. Schema registered without renderer is the failure mode from step 0.

5. **Types and schema** — `payload generate:types`, then `payload migrate:create <name>` if the database shape changed (Postgres/SQLite).

6. **Verify.** Boot the dev server, add the block to a page in the admin panel, fill in the fields, and confirm it renders correctly on the front end — including with optional fields left empty. Report the slug, fields, and both file paths.

If the project documents its blocks (a `BLOCKS.md` or similar), add the new block and its fields there too.
