---
name: frontend-a11y
description: Accessibility patterns for React and Next.js — semantic HTML, ARIA, form labeling, keyboard navigation, focus management, and screen reader support. Use when building or reviewing forms, interactive widgets, or handling a11y feedback.
metadata:
  origin: community
---

# Frontend Accessibility

Practical, code-level accessibility for React/Next.js. Native HTML first; ARIA only when native semantics can't express the pattern.

## When to Activate

- Building or reviewing forms
- Creating interactive widgets (modals, dropdowns, tooltips, tabs)
- Using `<div>`/`<span>` with `onClick`
- Adding ARIA attributes or keyboard handling
- Acting on accessibility review feedback

## Forms

Connect labels, expose required state, and link errors:

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

- Pair every input with a `<label htmlFor>` — placeholders are **not** labels.
- Wrap a visual required asterisk in `aria-hidden="true"`; convey required-ness with the attribute.
- Mark validation messages with `role="alert"` so they're announced.

## Semantic HTML

Use the element that matches intent — it gives you keyboard behavior, focus, and roles for free:

- `<button>` for actions, not `<div onClick>`.
- `<a href>` for navigation (enables right-click, middle-click, "open in new tab").
- Sequential headings — `h1 → h2 → h3`, never skip levels for styling.
- `<nav>`, `<main>`, `<ul>/<li>`, `<table>` with headers where they apply.

## ARIA (only when native won't do)

| Attribute | Use |
| --- | --- |
| `aria-label` | Inline accessible name when no visible label exists |
| `aria-labelledby` | Reference another element's text as the name |
| `aria-describedby` | Supplementary description (hints, errors) |
| `aria-live` | Announce dynamic updates (`polite` vs `assertive`) |
| `aria-expanded` / `aria-controls` | State + target for disclosure widgets |

## Keyboard navigation

Every interactive element must be reachable and operable by keyboard, with no traps. Custom widgets need explicit handlers:

```tsx
function onKeyDown(e: React.KeyboardEvent) {
  switch (e.key) {
    case "ArrowDown": e.preventDefault(); moveActive(1); break
    case "ArrowUp":   e.preventDefault(); moveActive(-1); break
    case "Enter":     select(activeIndex); break
    case "Escape":    close(); break
  }
}
```

Give the container `role`, `aria-expanded`, and `aria-controls`. Never use positive `tabIndex`.

## Focus management

For modals/dialogs: save the trigger element, move focus in on open, restore it on close, and close on `Escape`:

```tsx
useEffect(() => {
  if (!open) return
  const prev = document.activeElement as HTMLElement
  dialogRef.current?.focus()
  return () => prev?.focus()
}, [open])
```

Full focus trapping needs a helper like `focus-trap-react`. Never remove focus outlines without an equal-or-better replacement.

## Images & icons

- Meaningful image → descriptive `alt`.
- Decorative image → `alt=""` plus `aria-hidden="true"`.
- Icon-only button → `aria-label` describing the action.

## Reduced motion

Respect the OS setting:

```tsx
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
```

Skip or minimize non-essential animation when true.

## Anti-patterns

| Anti-pattern | Fix |
| --- | --- |
| `onClick` on a `div`/`span` with no keyboard support | Use `<button>`, or add `role`, `tabIndex={0}`, and key handlers |
| `aria-label` on a non-semantic element | Give it a role, or use a semantic element |
| Placeholder used instead of a label | Add a real `<label>` |
| Positive `tabIndex` | Use `0` / `-1` and rely on DOM order |
| `aria-hidden` on a focusable element | Remove it, or make the element non-focusable |
| `role="button"` without Enter/Space handlers | Add key handlers, or use `<button>` |

## Checklist

- [ ] Inputs have connected labels; errors linked via `aria-describedby` + `role="alert"`
- [ ] No `onClick` on non-interactive elements without keyboard support
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative images hidden; meaningful images have `alt`
- [ ] Modals move focus in and restore it on close; `Escape` closes
- [ ] Dynamic content uses `aria-live`
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Visible focus indicators preserved
