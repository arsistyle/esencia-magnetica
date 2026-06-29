# Stage 09 — Integrations Design

**Date:** 2026-06-29  
**Status:** Approved  
**Stage:** 09 of 12

---

## Scope

Three tasks remaining after audit (YouTube façade and affiliate link `rel` attrs are already done):

1. Google Analytics 4 — privacy-first setup + Consent Mode v2
2. Facebook Comments — lazy-loaded via IntersectionObserver
3. Event tracking — affiliate clicks + video plays

---

## 1. Cookie Consent + GA4

### Architecture

- New component `src/components/Analytics.astro` — injected once in `BaseLayout.astro`
- New component `src/components/CookieBanner.astro` — injected once in `BaseLayout.astro`
- GA Measurement ID stored in `.env` as `PUBLIC_GA_MEASUREMENT_ID`

### Consent flow

On every page load, vanilla JS reads `localStorage.getItem('cookie_consent')`:

| Value                | Behavior                      |
| -------------------- | ----------------------------- |
| `'granted'`          | Load gtag silently, no banner |
| `'denied'`           | Do nothing, no banner         |
| `null` (first visit) | Show banner                   |

**Accept:** writes `granted` → loads gtag dynamically → fires `gtag('consent', 'update', { analytics_storage: 'granted' })`  
**Reject:** writes `denied` → hides banner, GA4 never loads

### Consent Mode v2

`Analytics.astro` emits a minimal inline script (no external requests) that runs before anything else:

```js
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
});
```

The actual `gtag.js` script is only injected dynamically after the user grants consent. This guarantees zero GA4 network requests on first visit or after rejection.

### CookieBanner UI

- Fixed bottom bar, brand colors (Dark Olive bg, Warm Cream text)
- Two buttons: "Aceptar" (primary) / "Rechazar" (ghost)
- Hidden via `display: none` after any choice; does not reappear
- ES/EN copy via `src/i18n/ui.ts`

---

## 2. Facebook Comments

### Component

**File:** `src/components/blog/FacebookComments.astro` (stub → implemented)

**Props:**

- `url: string` — canonical URL of the post (used as comment thread identifier)
- `numPosts?: number` — default `5`

**Environment variables:**

- `PUBLIC_FACEBOOK_PAGE_ID` — `61579741058238`

`PUBLIC_FACEBOOK_APP_ID` is not required for the basic comments embed (xfbml via URL hash). Omitted from v1 scope.

### Lazy load strategy

1. Component renders empty `<div id="fb-root">` and `<div class="fb-comments" data-href={url} data-numposts={numPosts} data-width="100%">`
2. Inline `<script>` attaches an `IntersectionObserver` with `rootMargin: '200px'` to the wrapper
3. On intersection: dynamically appends `<script src="https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v21.0&appId={appId}">` to `<body>`
4. Observer disconnects after firing (SDK loads once)

### SDK init

`xfbml: true` is passed via the script URL hash — no separate `FB.init()` call needed for the comments plugin.

---

## 3. Event Tracking

All event calls are guarded with `if (typeof gtag !== 'undefined')` to silently no-op when the user has not consented.

### Affiliate click

**Where:** `src/components/blog/PostBody.astro`

- Affiliate links already have `rel="sponsored nofollow noopener"`
- Add `data-ga-event="affiliate_click"` and `data-ga-label="{productName}"` to each link
- Vanilla JS click listener in `<script>`:
  ```js
  gtag("event", "affiliate_click", { link_url: href, product_name: label });
  ```

### Video play

**Where:** `src/components/blog/YouTubeEmbed.astro`

- Existing click handler replaces thumbnail with iframe
- Add after the replacement:
  ```js
  gtag("event", "video_play", { video_id: videoId });
  ```

### Pageviews

Automatic via gtag — no extra code needed.

---

## 4. Script performance

- GA4 script: only loads after user consent (dynamic injection) → zero CWV impact on first visit
- FB SDK: IntersectionObserver lazy load → only loads if user scrolls to comments
- No synchronous third-party scripts in `<head>`

---

## Definition of Done

- [ ] Cookie banner appears on first visit; choice persists across page loads
- [ ] GA4 receives pageviews after consent; no network requests before consent
- [ ] `affiliate_click` event fires in GA4 DebugView on affiliate link click
- [ ] `video_play` event fires in GA4 DebugView on YouTube play
- [ ] Facebook Comments load when user scrolls near end of post
- [ ] `pnpm run lint && pnpm run typecheck && pnpm run build` pass (or known build issue documented)
- [ ] No CWV regression (no new render-blocking scripts)
