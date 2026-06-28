# CLAUDE.md

Guidance for working in the **Esencia Magnética** repo. Keep changes consistent with the docs below — they are the source of truth.

## Project

Fashion & lifestyle website for women 40–55+. Acts as the brand's owned-media hub: drives traffic to YouTube, monetizes through affiliate links (Amazon, Shein). AI-assisted content, reviewed by the brand owner before publishing. No ecommerce, accounts, or newsletter in v1.

- Full definition → [`docs/PROJECT.md`](docs/PROJECT.md)
- Brand & audience context → [`docs/ABOUT.md`](docs/ABOUT.md)
- Implementation plan (12 stages) → [`docs/PLAN.md`](docs/PLAN.md)
- Per-stage detail → [`docs/stages/stage-NN/FUNDAMENTS.md`](docs/stages/)

## Stack

Astro · TypeScript (strict) · Tailwind CSS · shadcn/ui (React islands) · Sanity (CMS). Static output for SEO. Categories, tags, products, and copy come from Sanity — never hardcoded.

## Package manager

**Use `pnpm` exclusively** (not npm or yarn). e.g. `pnpm install`, `pnpm run dev`, `pnpm create astro@latest`.

## i18n

- ES is default (no prefix); EN lives under `/en/`.
- No hardcoded UI copy — all strings must be translatable.
- Every page ships an ES↔EN pair with correct hreflang. Routes → [`docs/PROJECT.md`](docs/PROJECT.md).

## Design system

Defined in Stage 02 → [`docs/stages/stage-02/FUNDAMENTS.md`](docs/stages/stage-02/FUNDAMENTS.md).

- Colors: Warm Cream `#F5F0EB` (bg), Aged Gold `#C4973A` (primary), Dark Olive `#3E3D2F` (text), Pale Lavender `#EDE6F2` (accent-soft), Rose Nude `#E8C9BC` (accent-warm).
- Fonts: Cormorant Garamond (serif headings), Lato (sans body), Great Vibes (decorative script).
- Use theme tokens / CSS variables — **no hardcoded hex values in components**.

## Language in code

**All code must be in English only — no mixing.** This applies to: variable names, function names, type names, comments, Sanity schema `name`/`title`/`description` fields, GROQ field aliases, and any other identifier or string that lives inside a source file. The only Spanish allowed in source files is user-facing content fetched from Sanity or translated via the i18n system (`src/i18n/ui.ts`).

## Conventions

- Path alias `@/*` → `src/`.
- shadcn primitives restyled to brand; prefer composing them over new ad-hoc components.
- Affiliate/external links: open in new tab with `rel="sponsored nofollow noopener"`.
- Products show **no prices** (affiliate model). Catalog is outbound-only — no product detail pages.
- Run `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build` before considering a change done.

## TDD

When creating any function, utility, or component, invoke the `superpowers:test-driven-development` skill before writing implementation code.

## Working with the plan

When implementing a feature, read the matching stage's `FUNDAMENTS.md` first; it lists the goal, tasks, deliverables, and Definition of Done. Don't pull v1 scope from the Post-v1 backlog (newsletter, sponsored posts, Shein automation, product detail pages).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
