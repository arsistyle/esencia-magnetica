# Stage 09 — Integrations 🟡

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** Wire the external services required for v1.

## Tasks

1. **YouTube** — embed videos in posts (lazy façade); optionally display channel stats via YouTube Data API (cache results; secure the API key).
2. **Facebook Comments** — load the FB SDK once, render the comments plugin per post tied to the brand's Facebook Page.
3. **Affiliate links** — centralize link rendering with correct `rel` attributes; document the Shein manual-URL workflow once defined by the brand owner.
4. **Google Analytics 4** — add GA4 with a privacy-conscious setup; track outbound affiliate clicks and video plays as events.
5. Verify all third-party scripts are deferred/lazy to protect Core Web Vitals.

## Deliverables

Working embeds, comments, analytics, affiliate attribution.

## Definition of Done

Video plays, comments load, GA4 receives pageviews + affiliate-click events, no major CWV regression.
