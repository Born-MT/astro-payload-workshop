---
paths:
  - "**/api/**"
  - "**/auth/**"
  - "**/middleware/**"
  - "**/routes/**"
  - "**/controllers/**"
  - "**/handlers/**"
  - "**/views/**"
  - "**/Http/**"
  - "**/Controllers/**"
  - "**/Middleware/**"
  - "**/views.py"
  - "**/forms.py"
  - "**/serializers.py"
  - "**/admin.py"
---

<!-- Path notes: the PascalCase globs cover Laravel (app/Http/Controllers,
     app/Http/Middleware) — glob matching is case-sensitive on Linux, so the
     lowercase variants alone never fire there. The *.py file globs cover
     Django, whose request-handling code is flat files in each app package
     (polls/views.py), not a views/ directory. Keep comments OUT of the
     frontmatter list — naive line parsers truncate at the first one. -->

# Security

## Access control & authorization

- Deny by default. Grant access explicitly (allowlist), never blocklist.
- Enforce authorization server-side on every request. Never trust the client to hide or gate privileged actions.
- Validate object-level ownership on every resource access (prevent IDOR): confirm the current user may act on *this* record, not just that they're authenticated.
- Implement RBAC/ABAC consistently in one place; don't scatter ad-hoc role checks.
- Log access-control failures and alert on repeated denials.

## Input validation & injection

- Validate all user input at the system boundary. Never trust request parameters, headers, or uploads. Prefer allowlists over denylists.
- Use parameterized queries. Never concatenate user input into SQL, shell, or template strings.
- Prevent command injection: never pass user input to a shell. Use `subprocess`/`exec` with `shell=false` and an argument array, and validate values first.
- Prevent path traversal: canonicalize and confirm resolved file paths stay within the intended directory before reading/writing.
- Sanitize output to prevent XSS. Use framework-provided escaping; never assign untrusted input to `innerHTML`. Sanitize HTML with a vetted library (e.g. DOMPurify) when raw markup is unavoidable.
- Prevent SSRF: validate and allowlist outbound URL destinations; block requests to internal/metadata addresses.

## Authentication & sessions

- Hash passwords with Argon2id (preferred), scrypt, or bcrypt (cost ≥ 12). Never MD5/SHA.
- Enforce a strong password policy (≥ 12 chars) and reject known-breached passwords.
- Require MFA for sensitive operations and privileged accounts.
- Authentication tokens must be short-lived. Store refresh tokens server-side only; session tokens in httpOnly cookies, not localStorage.
- Set `HttpOnly`, `Secure`, and `SameSite` on session cookies. Enforce idle and absolute session timeouts.
- JWTs: verify `exp`/`iat`, use short-lived access tokens with rotating refresh tokens, and support revocation (e.g. `jti` denylist).
- Rate-limit authentication endpoints and lock out / back off on repeated failures.

## Cryptography & secrets

- Use constant-time comparison for secrets and tokens.
- Use a CSPRNG for security tokens (`crypto.randomBytes`, `secrets`, `crypto/rand`), never `Math.random`/`random`.
- Encrypt data in transit with TLS 1.2+ and at rest with AES-256 (GCM). Manage and rotate keys; never hardcode them.
- Read secrets from the environment or a secrets manager (e.g. Vault). Never commit secrets to version control; rotate credentials regularly.
- Never log secrets, tokens, passwords, or PII. Redact them from logs and error output.

## Transport & headers

- Enforce HTTPS. Set HSTS (`Strict-Transport-Security`) once valid HTTPS is in place.
- Set security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or CSP `frame-ancestors`), `Referrer-Policy`, and a restrictive `Permissions-Policy`.
- Configure CORS with an explicit origin allowlist; never reflect arbitrary origins or use `*` with credentials.

## Dependencies & supply chain

- Pin dependency versions. Review postinstall/build scripts before running untrusted packages.
- Scan dependencies for known CVEs (npm/pip/go audit, Snyk, OSV) and maintain an SBOM.
- Remediate on an SLA by severity: patch critical/high vulnerabilities fast (target < 48h); don't let known-critical CVEs reach production.

## Secure design, logging & CI

- Threat-model risky features (STRIDE) and design defense in depth — don't rely on a single control.
- Log security-relevant events (authn/authz, privilege changes, failures) to a central/SIEM pipeline; return generic error messages to users while logging full detail internally.
- Never expose stack traces, internal paths, or raw database errors in production responses.
- Gate CI/CD on security: run SAST and dependency/secret scanning on every PR; fail the build on new critical/high findings. Combine automated scanning with manual review for auth-sensitive code.
