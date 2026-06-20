# Stage 02 — Design System & Theme Tokens 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** Brand tokens, typography, and base shadcn theme wired into Tailwind so all later UI is consistent.

## Tasks

1. **Import the base design from Claude Design** (source of truth for layouts and visual system):
   - Connect the `claude_design` MCP connector (`https://api.anthropic.com/v1/design/mcp`). If it needs authorization, run `/design-login` (grants `user:design:read/write`).
   - Use the `claude_design` MCP tools to import the project: `https://claude.ai/design/p/658592d3-5da1-4cd3-81b6-c1576c694e23?file=ui_kits%2Fwebsite%2Findex.html` (entry file: `ui_kits/website/index.html`).
   - Extract the design reference for Home, Blog, Productos and Marca; use it to drive the tokens, type scale, and page layouts in this and later stages (05–08).
2. Define color tokens in Tailwind config / CSS variables:
   - `bg` Warm Cream `#F5F0EB`, `primary` Aged Gold `#C4973A`, `text` Dark Olive `#3E3D2F`, `accent-soft` Pale Lavender `#EDE6F2`, `accent-warm` Rose Nude `#E8C9BC`.
3. Wire tokens into shadcn's theme variables (`--background`, `--foreground`, `--primary`, `--accent`, etc.) for light mode.
4. Load fonts: Cormorant Garamond (serif headings), Lato (sans body), Great Vibes (decorative script) — self-hosted via `@fontsource` for performance and privacy.
5. Define typographic scale and base styles (headings serif, body sans) in a global stylesheet.
6. Set up the spacing, radius, and shadow scale to match the editorial/elegant feel.
7. Build base primitives: Button (primary gold / secondary), Badge, Card, Input, Checkbox — via shadcn, restyled to brand.
8. Create a `/styleguide` dev-only page rendering tokens, type scale, and components for visual QA.
9. Document tokens and usage in `docs/DESIGN-SYSTEM.md`.

## Deliverables

Theme config, font setup, base components, styleguide page.

## Definition of Done

Styleguide renders all tokens/components on-brand; no hardcoded hex values in components.
