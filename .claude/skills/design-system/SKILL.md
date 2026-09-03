---
name: design-system
description: Generate or audit design systems, check visual consistency, detect AI-generated "slop", and review PRs that touch styling. Use when starting a design system, auditing UI consistency, or catching generic/templated design.
metadata:
  origin: ECC
---

# Design System — Generate & Audit Visual Systems

Build and enforce a coherent visual system where every token traces to intent, and catch generic output before it ships.

## When to Use

- Starting a new project that needs a design system
- Auditing an existing codebase for visual consistency
- Before a redesign — understand what you have
- When the UI looks "off" but you can't pinpoint why
- Reviewing PRs that touch styling

## First Principle: Defaults Are the Enemy

You will generate generic output by default — training has seen thousands of dashboards and landing pages, and the patterns are strong. A design system's job is to replace invisible defaults with deliberate choices.

**Intent before tokens.** Before proposing any palette or scale, answer out loud:
- **Who is the human?** The actual person, their context, what they did 5 minutes before and after.
- **What must they accomplish?** The verb — "grade submissions", "approve the payment" — not "use the app".
- **What should it feel like?** Specific words that mean something: "warm like a notebook", "cold like a terminal", "dense like a trading floor". Never "clean and modern" — every AI says that.

**The swap test:** if you swapped your typeface, palette, or layout for the most common alternative and nothing meaningful changed, you never made a choice — you defaulted. Intent must be systemic: if the intent is "warm", then surfaces, borders, accents, and type are all warm.

## How It Works

### Mode 1: Generate Design System

Analyze the codebase and produce a cohesive, intent-driven system:

```
1. State intent (who / what / feel) — get user buy-in before building
2. Scan CSS/Tailwind/styled-components for existing patterns
3. Extract: colors, typography, spacing, radius, shadows, breakpoints
4. Define token architecture (primitives → semantic; see below)
5. Write DESIGN.md with the WHY behind each decision
6. Generate a self-contained HTML preview page (no deps)
```

Output: `DESIGN.md` + `design-tokens.json` + `design-preview.html`

**Token architecture** — every color traces to a small set of primitives; no random hex values:
- **Foreground:** four text levels — primary, secondary, tertiary, muted. Two levels means the hierarchy is too flat.
- **Background:** a numbered surface-elevation scale. Higher elevation = slightly lighter (a few % at a time). Sidebars share the canvas background with a border, not a different color. Inputs sit slightly *darker* (inset).
- **Border:** a progression — standard, softer, emphasis, focus-ring — not one border for everything.
- **Brand + semantic:** one accent used with intention; destructive/warning/success. Multiple accents dilute focus.
- **Control tokens:** dedicated tokens for control background/border/focus, separate from layout surfaces.

**Scales:**
- Spacing: pick one base unit (e.g. 4px) and use only multiples. Random values are the clearest sign of no system.
- Radius: a small scale (inputs/buttons → cards → modals). Don't mix sharp and soft randomly.
- Depth: choose **one** approach — borders-only, subtle shadows, layered shadows, or surface-color shifts — and commit. Don't mix.

**Token names are design decisions.** `--ink` / `--parchment` evoke a world; `--gray-700` / `--surface-2` evoke a template. Someone reading only your tokens should be able to guess the product.

### Mode 2: Visual Audit

Score the UI across 10 dimensions (0–10 each) with specific examples and a fix at exact `file:line`:

```
1.  Color consistency   — palette tokens, or random hex values?
2.  Typography hierarchy — clear h1 > h2 > h3 > body > caption, by weight+size not size alone?
3.  Spacing rhythm      — consistent scale (4/8/16) or arbitrary?
4.  Component consistency — similar elements look similar (same border weight, radius, padding)?
5.  Responsive behavior — fluid, or broken at breakpoints? No horizontal scroll at 320px?
6.  Dark mode           — complete? (shadows lean on borders; semantic colors slightly desaturated)
7.  Animation           — purposeful, fast micro-interactions with deceleration easing — or gratuitous?
8.  Accessibility       — contrast ≥ 4.5:1 text / 3:1 large & UI; visible focus; ≥ 44px touch targets
9.  Information density  — cluttered or clean for this user?
10. Polish              — hover, focus, active, disabled, loading, empty, error states all present?
```

**The squint test:** blur your eyes — you should still perceive hierarchy, but nothing should jump out harshly. Craft whispers.

### Mode 3: AI Slop Detection

Flag generic AI-generated design patterns:

```
- Gratuitous gradients on everything
- Purple-to-blue defaults
- "Glass morphism" cards with no purpose
- Rounded corners on things that shouldn't be rounded
- Excessive scroll animations
- Generic hero: centered text over a stock gradient
- Sans-serif stack with no personality
- Harsh solid borders and dramatic drop shadows
- Different hues for different surfaces (keep one hue, shift only lightness)
```

If another AI given the same prompt would produce substantially the same output, it's slop — the design didn't emerge from *this* problem.

## Examples

**Generate for a SaaS app:**
```
/design-system generate --style minimal --palette earth-tones
```

**Audit existing UI:**
```
/design-system audit --url http://localhost:3000 --pages / /pricing /docs
```

**Check for AI slop:**
```
/design-system slop-check
```

## Audit Output Shape

```text
[dimension] score/10
Example: src/components/Card.tsx:42 — three different border colors on sibling cards
Fix: use --border-default for all card edges; reserve --border-emphasis for the active card
```

## Related Skills (deeper dives)

- `interface-design` — dashboards, admin panels, apps: craft, layering, token architecture in depth.
- `frontend-design` — distinctive marketing/landing visual direction.
- `theme-factory` — ready-made themes and on-the-fly theme generation.
- `web-design-guidelines` — review UI code against Web Interface Guidelines.
- `wcag-audit-patterns` — full WCAG 2.2 accessibility audit and remediation.
