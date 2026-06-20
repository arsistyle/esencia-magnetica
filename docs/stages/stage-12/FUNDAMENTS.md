# Stage 12 — Deployment & Launch 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** Ship v1 to production.

## Tasks

1. Choose and configure hosting (e.g., Vercel/Netlify/Cloudflare Pages) for Astro static output.
2. Configure production environment variables and Sanity production dataset.
3. Set up the custom domain + HTTPS and ES/EN routing at the edge.
4. Configure build webhooks so Sanity publishes trigger rebuilds (ISR or full rebuild strategy).
5. Connect GA4 production property and verify data flow.
6. Final production smoke test (all routes, both locales, integrations live).
7. Submit sitemap to Google Search Console; verify indexing.
8. Tag the `v1.0` release and document the deploy/rollback process.

## Deliverables

Live production site, GSC verified, release tagged.

## Definition of Done

Production site loads on the real domain, content publishing rebuilds the site, analytics + search console active.

---

## Post-v1 (Out of Scope, Backlog) 🟢

Tracked for later, not part of v1 per `PROJECT.md`:

- Newsletter / email capture.
- Sponsored post workflow and partner-facing media kit.
- Shein affiliate workflow automation (once manual process is validated).
- Product detail pages (currently outbound-only).
- Advanced analytics dashboards / A/B testing of CTAs.
