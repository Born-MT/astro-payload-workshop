---
name: seo
description: Audit, plan, and implement SEO improvements across technical SEO, on-page optimization, structured data, Core Web Vitals, and content strategy. Use when the user wants better search visibility, SEO remediation, schema markup, sitemap/robots work, or keyword mapping.
metadata:
  origin: ECC
---

# SEO

Improve search visibility through technical correctness, performance, and content relevance, not gimmicks.

## When to Use

Use this skill when:
- auditing crawlability, indexability, canonicals, or redirects
- improving title tags, meta descriptions, and heading structure
- adding or validating structured data
- improving Core Web Vitals
- doing keyword research and mapping keywords to URLs
- planning internal linking or sitemap / robots changes

## How It Works

### Principles

1. Fix technical blockers before content optimization.
2. One page should have one clear primary search intent.
3. Prefer long-term quality signals over manipulative patterns.
4. Mobile-first assumptions matter because indexing is mobile-first.
5. Recommendations should be page-specific and implementable.

### Technical SEO checklist

#### Crawlability

- `robots.txt` should allow important pages and block low-value surfaces
- no important page should be unintentionally `noindex`
- important pages should be reachable within a shallow click depth
- avoid redirect chains longer than two hops
- canonical tags should be self-consistent and non-looping

#### Indexability

- preferred URL format should be consistent
- multilingual pages need correct hreflang if used
- sitemaps should reflect the intended public surface
- no duplicate URLs should compete without canonical control

#### Performance

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- common fixes: preload hero assets, reduce render-blocking work, reserve layout space, trim heavy JS

#### Structured data

- homepage: organization or business schema where appropriate
- editorial pages: `Article` / `BlogPosting`
- product pages: `Product` and `Offer`
- interior pages: `BreadcrumbList`
- Q&A sections: `FAQPage` only when the content truly matches

### On-page rules

#### Title tags

- aim for roughly 50-60 characters
- put the primary keyword or concept near the front
- make the title legible to humans, not stuffed for bots

#### Meta descriptions

- aim for roughly 120-160 characters
- describe the page honestly
- include the main topic naturally

#### Heading structure

- one clear `H1`
- `H2` and `H3` should reflect actual content hierarchy
- do not skip structure just for visual styling

### Metadata correctness

Ship correct, complete metadata — in priority order. Prefer minimal diffs and follow the project's existing metadata pattern (Next.js Metadata API, react-helmet, manual `<head>`); don't introduce new SEO libraries or migrate frameworks unless asked.

#### Correctness & duplication (critical)

- define metadata in one place per page; avoid competing systems
- never emit duplicate `title`, `description`, `canonical`, or `robots` tags
- metadata must be deterministic — no random or unstable values
- escape and sanitize any user-generated or dynamic strings
- every page needs safe defaults for title and description

#### Canonical & indexing (high)

- `canonical` points to the preferred URL; keep it self-consistent and non-looping
- use `noindex` only for private, duplicate, or non-public pages; staging/preview `noindex` by default
- `robots` meta must match actual access intent
- paginated pages need correct canonical behavior

#### Social cards (high)

- shareable pages set Open Graph title, description, and image
- OG/Twitter images use **absolute** URLs with stable dimensions/aspect ratio
- `og:url` matches the canonical URL
- sensible `og:type` (usually `website` or `article`); `twitter:card` = `summary_large_image` by default
- verify cards on a real deployed URL, not localhost

#### Icons & manifest (medium)

- at least one favicon that works across browsers; `apple-touch-icon` where relevant
- valid, referenced web manifest when used; icon paths stable and cacheable
- set `theme-color` intentionally to avoid mismatched browser chrome

#### Locale & alternates (low-medium)

- set the `<html lang>` attribute correctly; `og:locale` when localized
- add `hreflang` alternates only when the pages truly exist, and canonicalize per locale

### Keyword mapping

1. define the search intent
2. gather realistic keyword variants
3. prioritize by intent match, likely value, and competition
4. map one primary keyword/theme to one URL
5. detect and avoid cannibalization

### Internal linking

- link from strong pages to pages you want to rank
- use descriptive anchor text
- avoid generic anchors when a more specific one is possible
- backfill links from new pages to relevant existing ones

## Examples

### Title formula

```text
Primary Topic - Specific Modifier | Brand
```

### Meta description formula

```text
Action + topic + value proposition + one supporting detail
```

### JSON-LD example

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title Here",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name"
  }
}
```

### Audit output shape

```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string, which weakens relevance and creates duplicate signals.
Fix: Generate a unique title per product using the product name and primary category.
```

## Anti-Patterns

| Anti-pattern | Fix |
| --- | --- |
| keyword stuffing | write for users first |
| thin near-duplicate pages | consolidate or differentiate them |
| schema for content that is not actually present | match schema to reality |
| content advice without checking the actual page | read the real page first |
| generic “improve SEO” outputs | tie every recommendation to a page or asset |

## Related Skills

- `fixing-metadata` — deep metadata review (titles, canonical, social cards, icons, structured data)
- `seo-specialist`
- `frontend-patterns`
- `brand-voice`
- `market-research`
