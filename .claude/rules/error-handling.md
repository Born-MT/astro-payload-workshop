---
paths:
  - "**/api/**"
  - "**/services/**"
  - "**/controllers/**"
  - "**/routes/**"
  - "**/handlers/**"
  - "**/cmd/**"
  - "**/internal/**"
  - "**/components/**"
  - "**/Http/**"
  - "**/Controllers/**"
  - "**/Jobs/**"
  - "**/Console/**"
  - "**/views.py"
  - "**/tasks.py"
  - "**/models.py"
---

<!-- Path notes: PascalCase globs cover Laravel's HTTP/queued-job dirs (glob
     matching is case-sensitive on Linux); the *.py file globs cover Django's
     flat per-app modules (polls/views.py). Keep comments OUT of the
     frontmatter list — naive line parsers truncate at the first one. -->

# Error Handling

## Errors as values and types

- Use typed or custom error classes with error codes, not generic `Error("something went wrong")`.
- Carry a status code on the error type (e.g. `ApiError(statusCode, message)`) so the boundary can map it to a response without guessing.
- Distinguish operational errors (expected: validation, not-found, auth) from programmer errors (bugs). Handle the former; let the latter surface loudly.
- At use-case / service boundaries, prefer explicit result objects (`{ success, data, error }`) over throwing for expected outcomes like "email already exists".

## Never swallow, always add context

- Never swallow errors silently. Log or rethrow with added context about what operation failed.
- When rethrowing, preserve the original error (cause chain / wrapped error). Don't discard the stack.
- Handle every rejected promise / returned error. No floating async calls; no ignored error returns.

## API boundaries

- Centralize error-to-response mapping in one handler. Map known error types to status codes; treat everything else as 500.
- HTTP error responses: consistent shape (`{ error: { code, message } }`), correct status codes (400 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict, 429 rate limit, 500 unexpected).
- Return validation errors with per-field details so clients can act on them; keep the shape consistent.
- Never expose stack traces, internal paths, or raw database errors in production responses.

## Resilience

- Retry transient errors (network timeouts, rate limits) with exponential backoff and a max attempt count. Fail fast on validation and auth errors; don't retry them.
- Set timeouts on all outbound calls (DB, HTTP, queues). A hung dependency must not hang the request.
- Use transactions for multi-step writes so a failure rolls back cleanly; never leave data half-written.

## Frontend

- Wrap feature areas in error boundaries so one component's failure doesn't blank the whole app; provide a recovery action.
- Surface user-facing errors as actionable messages, not raw exception text. Log the technical detail separately.
- Every async UI operation must handle loading, success, and error states explicitly.

## Observability

- Use structured logging (JSON) with a level, message, and context object — not string concatenation.
- Include correlation or request IDs in error logs when available, and thread them through downstream calls.
- Log at the boundary where you have the most context; don't log the same error at every layer as it bubbles up.
