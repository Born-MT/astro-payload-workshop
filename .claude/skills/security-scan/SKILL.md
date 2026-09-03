---
name: security-scan
description: Run available security scanners against this project — secrets, dependency CVEs, and static analysis (SAST) — across any stack. Use before shipping changes to auth, input handling, queries, file paths, tokens, crypto, or dependencies, or on demand for an audit.
argument-hint: "[optional: path or focus like 'deps' or 'secrets']"
---

Run the security scanners that are actually installed, stack-agnostic. Never install tools without asking. If a scanner is missing, skip it and note it in the summary — don't fail the whole run.

## 1. Detect stack and tools

Detect the stack from manifests present (`package.json`, `pyproject.toml`/`requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile`, `composer.json`). Check which scanners exist with `command -v`:
- Secrets: `gitleaks`, `trufflehog`
- SAST: `semgrep`
- Dependency CVEs: `npm audit`, `pnpm audit`, `yarn audit`, `pip-audit`, `cargo audit`, `govulncheck`, `bundler-audit`, `composer audit`

## 2. Run what's available (scope to `$ARGUMENTS` if given)

**Secrets** (whole repo, or the path in `$ARGUMENTS`):
```bash
command -v gitleaks   >/dev/null && gitleaks detect --no-banner --redact 2>&1 | tail -40
command -v trufflehog >/dev/null && trufflehog filesystem . --only-verified --no-update 2>&1 | tail -40
```

**Dependency CVEs** (match the stack):
```bash
[ -f package.json ]     && { command -v pnpm >/dev/null && pnpm audit || command -v yarn >/dev/null && yarn audit || npm audit; } 2>&1 | tail -40
[ -f pyproject.toml ] || [ -f requirements.txt ] && command -v pip-audit >/dev/null && pip-audit 2>&1 | tail -40
[ -f Cargo.toml ]       && command -v cargo-audit >/dev/null && cargo audit 2>&1 | tail -40
[ -f go.mod ]           && command -v govulncheck >/dev/null && govulncheck ./... 2>&1 | tail -40
```

**SAST** (if semgrep present):
```bash
command -v semgrep >/dev/null && semgrep --config auto --error --quiet 2>&1 | tail -60
```

## 3. Deep review of changed code

Scanners miss logic-level and authorization flaws. Invoke the **local `security-reviewer` agent** on the current diff (prefer the project-local agent over any global one). Review against the OWASP Top 10, focusing on what SAST can't see:

- **Broken access control (A01)** — missing server-side authz, IDOR (object ownership not checked), privilege escalation.
- **Injection (A03)** — SQL/command/template built by string concatenation; unsanitized input reaching an interpreter or shell.
- **Cryptographic failures (A02)** — weak hashing (MD5/SHA1), missing encryption in transit/at rest, `Math.random` for tokens.
- **Auth failures (A07)** — missing MFA/rate limits, long-lived tokens, secrets in localStorage.
- **SSRF (A10)** — user-controlled outbound URLs without an allowlist.
- **Insecure design (A04)** — no defense in depth, trust boundaries crossed without validation.

These map to the project `security` and `error-handling` rules. Combine automated scanning with manual review — never rely on scanners alone for auth-sensitive code.

## 4. Report

One consolidated summary, severity-ranked (Critical first):
- `tool` — finding (file:line where available) — one-line fix.
- List scanners that were **skipped because not installed**, with the one-liner to install each (e.g. `brew install gitleaks`, `pipx install pip-audit`, `cargo install cargo-audit`, `go install golang.org/x/vuln/cmd/govulncheck@latest`).
- End with a one-sentence verdict: highest-severity blocker, or "no issues found by available scanners" (note that absence of tools ≠ clean).

This is automated scanning, not a substitute for a professional audit.
