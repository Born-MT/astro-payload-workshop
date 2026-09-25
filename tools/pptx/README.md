# Deck builder

`docs/SLIDES.html` is the source of the deck. This folder regenerates the PowerPoint mirror from it.

```bash
npm --prefix tools/pptx install     # once
node tools/pptx/build.mjs           # writes docs/From-WordPress-to-Astro-Payload.pptx
```

It is deliberately outside the pnpm workspace so `pnpm install` for attendees never pulls these packages
and the offline `node_modules` archive stays valid. `widths.json` holds IBM Plex glyph widths used to size
titles so they never wrap into the content below.

Team copies (no speaker notes), for sharing with attendees:

```bash
node tools/pptx/team-deck.mjs           # writes docs/SLIDES-team.html
node tools/pptx/build.mjs --team        # writes docs/From-WordPress-to-Astro-Payload-team.pptx
```
