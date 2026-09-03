# Code Quality

## Anti-defaults (counter common Claude tendencies)

- No premature abstractions. Three similar lines beats a helper used once.
- Don't add features or improvements beyond what was asked.
- Don't refactor adjacent code while fixing a bug.
- No dead code or commented-out blocks. Git has history.
- WHY comments, never WHAT. If code needs a "what" comment, rename instead.
- API docs at module boundaries only, not every internal function.
- Don't apply Clean Architecture / DDD to simple CRUD. Match the pattern to the complexity.

## Naming

- Files: PascalCase for components and classes (`UserProfile.tsx`), kebab-case for utilities and directories (`date-utils.ts`).
- Booleans: `is` / `has` / `should` / `can` prefix. Functions: verb-first (`getUser`). Handlers: `handle*` internal, `on*` as props.
- Factories: `create*`. Converters: `to*`. Predicates: `is*` / `has*`. Constants: `SCREAMING_SNAKE`.
- Abbreviations only when universally known (`id`, `url`, `api`, `db`, `auth`). Acronyms as words: `userId`, not `userID`.
- Use one name per concept across the codebase (ubiquitous language). Don't call it `user` here and `account` there for the same thing.

## Code Markers

`TODO(author): desc (#issue)` for planned work. `FIXME(author): desc (#issue)` for known bugs. `HACK(author): desc (#issue)` for ugly workarounds (explain the proper fix). `NOTE: desc` for non-obvious context. Owner and issue link required. Never `XXX`, `TEMP`, `REMOVEME`.

## File Organization

- Imports: builtins, external, internal, relative, types. Blank line between groups.
- Exports: named over default. One component or class per file.
- Function order: public API first, then helpers in call order.

## Architecture & Layering

- Dependencies point inward: business logic must not import frameworks, ORMs, or HTTP libraries. Keep the core independent of infrastructure.
- Separate concerns into layers: controllers/handlers (I/O only) → services/use-cases (business logic) → repositories (data access). Keep each layer thin and single-purpose.
- Controllers stay thin: parse the request, call a use case, shape the response. No business logic in the controller.
- Rich domain models: put behavior with the data it operates on. Avoid anemic objects that are pure data bags acted on from outside.
- Depend on interfaces, not concrete implementations, at boundaries (repositories, gateways, payment/email providers) so they can be swapped and mocked.
- Never leak ORM entities or raw DB rows out of the repository layer. Map to domain types or DTOs.
- Define bounded contexts with clear ownership. Don't let one module reach into another's internals.

## Component Patterns (frontend)

- Prefer composition over inheritance. Build flexible UI from small components and compound patterns, not deep prop drilling or class hierarchies.
- Extract reusable logic into custom hooks. Keep components focused on rendering.
- Colocate state with the component that owns it. Lift state up only when genuinely shared; reach for Context + reducer only for cross-cutting app state.
- One component per file, typed props, no implicit `any`.

## Performance

- Measure before optimizing. Don't add caching, memoization, or virtualization on speculation.
- Select only the columns/fields you need; never `SELECT *` in hot paths.
- Eliminate N+1 queries: batch-fetch related data and join in memory instead of querying per item.
- Cache read-heavy, slow-changing data (cache-aside) with explicit TTLs and invalidation. Don't cache without an invalidation story.
- Frontend: memoize genuinely expensive computations, lazy-load heavy components, virtualize long lists. Don't wrap everything in `useMemo`/`useCallback` reflexively.

## Accessibility

- Use semantic HTML first (`button`, `nav`, `main`, `label`). Reach for ARIA only when native elements can't express the pattern.
- Every interactive element must be keyboard operable, with no keyboard traps and a logical tab order.
- Keep focus indicators visible; never remove outlines without an equal-or-better replacement.
- Every form input needs an associated label; indicate required fields and provide format hints.
- Don't convey meaning by color alone; pair it with text, icons, or patterns.
- Text contrast ≥ 4.5:1 (3:1 for large text and UI components).
- Give functional images meaningful `alt` text; mark decorative images `alt=""`.
- Respect `prefers-reduced-motion` for animations and transitions.
