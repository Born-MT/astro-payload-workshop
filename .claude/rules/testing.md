---
paths:
  - "**/src/**"
  - "**/lib/**"
  - "**/app/**"
  - "**/packages/**"
  - "**/internal/**"
  - "**/components/**"
  - "**/services/**"
  - "**/handlers/**"
  - "**/tests/**"
  - "**/__tests__/**"
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/*_test.*"
---

# Testing

## Every change ships with tests (not optional)

- **New behavior requires a unit test.** Any function, method, component, hook, or module you add or change must have unit tests covering it in the same change. Don't mark work done until the tests exist and pass.
- **Fixing a bug starts with a failing test.** Write a test that reproduces the bug, watch it fail, then fix it. The test is the proof the fix works and the guard against regression.
- **No untested code paths.** If a branch, error case, or edge condition is worth writing, it's worth a test. Untested code is unverified code.
- Run the suite after a series of changes and before calling anything complete. A change that breaks existing tests is not done.

## What to test

- **The behavior, not the implementation.** Assert on observable outcomes (return values, emitted events, rendered output, state transitions) — not private internals. Tests that mirror the implementation break on every refactor.
- **Cover the real cases:** the happy path, boundaries (empty, zero, one, many, max), invalid input, and error/failure handling. One assertion of "it works" is not coverage.
- **Frontend:** test components through user-visible behavior (roles, labels, text, interactions) rather than internal state; test custom hooks directly.
- **Data/logic:** pure functions and business rules get the densest tests — they're cheap and catch the most.

## Structure

- **One behavior per test.** A test name states the behavior: `returns 400 when email is missing`, not `test1`. When it fails, the name should tell you what broke.
- Arrange–Act–Assert, with the three phases visually separable. Keep setup minimal and local to the test.
- Tests must be deterministic and isolated: no shared mutable state, no order dependence, no reliance on wall-clock time, network, or randomness. Inject or fake those.
- Fast by default. Unit tests run in memory; push slow I/O to a smaller integration tier.

## Test doubles

- Mock only what you don't own or what's slow/nondeterministic (network, DB, clock, filesystem, third-party SDKs). Don't mock the thing under test.
- Prefer real objects and lightweight fakes over deep mock trees. If a test needs five mocks to run, the unit is doing too much — split it.

## Don'ts

- Don't delete or skip a failing test to make the suite green — fix the code or the test, and if you must skip, mark it with a reason and an issue link.
- Don't write assertion-free tests (calling a function without asserting proves nothing).
- Don't chase a coverage number with trivial tests; cover behavior and risk, not lines for their own sake.
