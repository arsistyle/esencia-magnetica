# Stage 09 — Integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire GA4 (privacy-first with Consent Mode v2), Facebook Comments (lazy via IntersectionObserver), and affiliate/video event tracking.

**Architecture:** `Analytics.astro` sets consent defaults in `<head>`; `CookieBanner.astro` loads gtag.js dynamically only after the user accepts. `FacebookComments.astro` lazy-loads the FB SDK via IntersectionObserver when the user scrolls near the end of the post. All event calls are guarded with `typeof gtag !== 'undefined'`.

**Tech Stack:** Astro v6 · Vanilla JS `<script>` blocks · Consent Mode v2 · IntersectionObserver · `PUBLIC_GA4_MEASUREMENT_ID` + `PUBLIC_FACEBOOK_PAGE_ID` env vars

---

## File map

| Action | File |
|--------|------|
| Create | `src/types/gtag.d.ts` |
| Create | `src/components/Analytics.astro` |
| Create | `src/components/CookieBanner.astro` |
| Modify | `src/layouts/BaseLayout.astro` |
| Modify | `src/i18n/ui.ts` |
| Modify | `.env.example` |
| Modify | `src/components/blog/FacebookComments.astro` (stub → full) |
| Modify | `src/layouts/BlogPostLayout.astro` |
| Modify | `src/components/blog/PostBody.astro` |
| Modify | `src/components/blog/YouTubeEmbed.astro` |

---

## Task 1: i18n strings — cookie banner + comments label

**Files:**
- Modify: `src/i18n/ui.ts`

- [ ] **Step 1: Add ES strings**

In `src/i18n/ui.ts`, inside the `es:` block, add before the closing `},`:

```ts
"cookie.banner.text": "Usamos cookies analíticas para mejorar tu experiencia.",
"cookie.banner.accept": "Aceptar",
"cookie.banner.reject": "Rechazar",
"comments.label": "Comentarios",
```

- [ ] **Step 2: Add EN strings**

In `src/i18n/ui.ts`, inside the `en:` block, add before the closing `},`:

```ts
"cookie.banner.text": "We use analytics cookies to improve your experience.",
"cookie.banner.accept": "Accept",
"cookie.banner.reject": "Decline",
"comments.label": "Comments",
```

- [ ] **Step 3: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors related to missing keys.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat(i18n): add cookie consent and comments strings"
```

---

## Task 2: Global gtag type declaration

**Files:**
- Create: `src/types/gtag.d.ts`

- [ ] **Step 1: Create declaration file**

```ts
// src/types/gtag.d.ts
declare global {
  interface Window {
    dataLayer: unknown[];
  }
  function gtag(...args: unknown[]): void;
}

export {};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/gtag.d.ts
git commit -m "feat(types): add gtag global type declaration"
```

---

## Task 3: Analytics.astro — Consent Mode v2 init

**Files:**
- Create: `src/components/Analytics.astro`

- [ ] **Step 1: Create component**

```astro
---
// src/components/Analytics.astro
const gaId = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID as string | undefined;
---

{
  gaId && (
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(...args) {
        window.dataLayer.push(args);
      }
      gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    </script>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Analytics.astro
git commit -m "feat(analytics): add Analytics component with Consent Mode v2 default"
```

---

## Task 4: CookieBanner.astro

**Files:**
- Create: `src/components/CookieBanner.astro`

- [ ] **Step 1: Create component**

```astro
---
// src/components/CookieBanner.astro
import type { Locale } from "@/types/index";
import { useTranslations } from "@/i18n";

interface Props {
  lang?: Locale;
}

const { lang = "es" } = Astro.props;
const t = useTranslations(lang);
const gaId = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID as string | undefined;
---

{
  gaId && (
    <div
      id="cookie-banner"
      role="dialog"
      aria-label={t("cookie.banner.text")}
      data-ga-id={gaId}
      class="fixed bottom-0 left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-olive px-6 py-4 shadow-lg"
      style="display:none"
    >
      <p class="font-sans text-small text-cream">{t("cookie.banner.text")}</p>
      <div class="flex shrink-0 gap-3">
        <button
          id="cookie-accept"
          class="rounded-sm bg-gold px-4 py-2 font-sans text-small font-semibold text-cream transition-opacity hover:opacity-90"
        >
          {t("cookie.banner.accept")}
        </button>
        <button
          id="cookie-reject"
          class="rounded-sm border border-cream/40 px-4 py-2 font-sans text-small text-cream/80 transition-opacity hover:opacity-90"
        >
          {t("cookie.banner.reject")}
        </button>
      </div>
    </div>
  )
}

<script>
  const CONSENT_KEY = "cookie_consent";
  const banner = document.getElementById("cookie-banner") as HTMLElement | null;
  const gaId = banner?.dataset.gaId;

  function loadGtag() {
    if (!gaId) return;
    const s = document.createElement("script");
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    s.async = true;
    document.head.appendChild(s);
    s.onload = () => {
      gtag("consent", "update", { analytics_storage: "granted" });
      gtag("config", gaId);
      // Re-fire pageview on each View Transitions navigation
      document.addEventListener("astro:page-load", () => {
        gtag("event", "page_view", { page_location: window.location.href });
      });
    };
  }

  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted") {
    loadGtag();
  } else if (!stored && banner) {
    banner.style.display = "";
  }

  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    if (banner) banner.style.display = "none";
    loadGtag();
  });

  document.getElementById("cookie-reject")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    if (banner) banner.style.display = "none";
  });
</script>
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CookieBanner.astro
git commit -m "feat(analytics): add CookieBanner with consent-gated gtag load"
```

---

## Task 5: Wire Analytics + CookieBanner into BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add imports**

After the existing imports in the frontmatter, add:

```ts
import Analytics from "@/components/Analytics.astro";
import CookieBanner from "@/components/CookieBanner.astro";
```

- [ ] **Step 2: Add Analytics to `<head>`**

Insert `<Analytics />` as the **first child** of `<head>` (before `<meta charset>`):

```astro
<head>
  <Analytics />
  <meta charset="UTF-8" />
  ...
```

- [ ] **Step 3: Add CookieBanner to `<body>`**

Insert `<CookieBanner lang={lang} />` after `<Footer lang={lang} />`:

```astro
    <Footer lang={lang} />
    <CookieBanner lang={lang} />
  </body>
```

- [ ] **Step 4: Lint + typecheck**

```bash
pnpm run lint && pnpm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(analytics): wire Analytics and CookieBanner into BaseLayout"
```

---

## Task 6: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add Facebook Page ID and rename GA key**

Replace the GA comment block with:

```
# Google Analytics 4 (configured in Stage 09)
# Get your Measurement ID from GA4 > Admin > Data Streams > Web stream details
PUBLIC_GA4_MEASUREMENT_ID=

# Facebook Comments (configured in Stage 09)
PUBLIC_FACEBOOK_PAGE_ID=61579741058238
```

- [ ] **Step 2: Add to local .env**

Manually add to `.env` (not committed):
```
PUBLIC_FACEBOOK_PAGE_ID=61579741058238
```

- [ ] **Step 3: Commit .env.example only**

```bash
git add .env.example
git commit -m "chore: document Stage 09 env vars in .env.example"
```

---

## Task 7: Implement FacebookComments.astro

**Files:**
- Modify: `src/components/blog/FacebookComments.astro`

- [ ] **Step 1: Replace stub with full implementation**

```astro
---
// src/components/blog/FacebookComments.astro
import type { Locale } from "@/types/index";
import { useTranslations } from "@/i18n";

interface Props {
  url: string;
  numPosts?: number;
  lang?: Locale;
}

const { url, numPosts = 5, lang = "es" } = Astro.props;
const t = useTranslations(lang);
const sdkLocale = lang === "en" ? "en_US" : "es_ES";
const sdkSrc = `https://connect.facebook.net/${sdkLocale}/sdk.js#xfbml=1&version=v21.0`;
---

<section
  class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-[var(--space-8)]"
  aria-label={t("comments.label")}
>
  <div id="fb-root"></div>
  <div id="fb-comments-wrapper" data-sdk-src={sdkSrc}>
    <div
      class="fb-comments"
      data-href={url}
      data-numposts={numPosts}
      data-width="100%"
    ></div>
  </div>
</section>

<script>
  const wrapper = document.getElementById("fb-comments-wrapper");
  if (wrapper) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const src = wrapper.dataset.sdkSrc ?? "";
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      },
      { rootMargin: "200px" }
    );
    observer.observe(wrapper);
  }
</script>
```

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/FacebookComments.astro
git commit -m "feat(comments): implement Facebook Comments with IntersectionObserver lazy load"
```

---

## Task 8: Wire url prop in BlogPostLayout

**Files:**
- Modify: `src/layouts/BlogPostLayout.astro`

- [ ] **Step 1: Update FacebookComments usage**

Find line:
```astro
<FacebookComments />
```

Replace with:
```astro
<FacebookComments url={canonical} lang={lang} />
```

(`canonical` is already computed at line 55 of the file.)

- [ ] **Step 2: Typecheck**

```bash
pnpm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BlogPostLayout.astro
git commit -m "feat(comments): pass canonical url and lang to FacebookComments"
```

---

## Task 9: Event tracking — affiliate clicks + video plays

**Files:**
- Modify: `src/components/blog/PostBody.astro`
- Modify: `src/components/blog/YouTubeEmbed.astro`

### 9a — PostBody: add data attributes to affiliate links

- [ ] **Step 1: Update link mark renderer** (`src/components/blog/PostBody.astro`, marks.link)

Find:
```ts
return [
  `<a href="${href}"`,
  rel ? ` rel="${rel}"` : "",
  isExternal ? ` target="_blank"` : "",
  `>${children}</a>`,
].join("");
```

Replace with:
```ts
return [
  `<a href="${href}"`,
  rel ? ` rel="${rel}"` : "",
  isExternal ? ` target="_blank"` : "",
  value?.isAffiliate
    ? ` data-ga-event="affiliate_click" data-ga-label="${children}"`
    : "",
  `>${children}</a>`,
].join("");
```

- [ ] **Step 2: Update productList link renderer**

Find inside the `productList` type handler:
```ts
`<a href="${String(p.affiliateUrl ?? "#")}" rel="sponsored nofollow noopener" target="_blank" class="group flex flex-col gap-3">`,
```

Replace with:
```ts
`<a href="${String(p.affiliateUrl ?? "#")}" rel="sponsored nofollow noopener" target="_blank" data-ga-event="affiliate_click" data-ga-label="${String(p.name ?? "")}" class="group flex flex-col gap-3">`,
```

### 9b — PostBody: add tracking to the `<script>` block

- [ ] **Step 3: Update the script block**

Find the existing `<script>` block at the bottom of `PostBody.astro`:
```astro
<script>
  document.querySelectorAll<HTMLElement>(".yt-facade").forEach((el) => {
    el.addEventListener("click", () => {
      const videoId = el.dataset.vid;
      if (!videoId) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;border:0";
      el.replaceChildren(iframe);
    });
  });
</script>
```

Replace with:
```astro
<script>
  document.querySelectorAll<HTMLElement>(".yt-facade").forEach((el) => {
    el.addEventListener("click", () => {
      const videoId = el.dataset.vid;
      if (!videoId) return;
      if (typeof gtag !== "undefined") {
        gtag("event", "video_play", { video_id: videoId });
      }
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;border:0";
      el.replaceChildren(iframe);
    });
  });

  document
    .querySelectorAll<HTMLAnchorElement>("[data-ga-event='affiliate_click']")
    .forEach((el) => {
      el.addEventListener("click", () => {
        if (typeof gtag === "undefined") return;
        gtag("event", "affiliate_click", {
          link_url: el.href,
          product_name: el.dataset.gaLabel ?? "",
        });
      });
    });
</script>
```

### 9c — YouTubeEmbed: add tracking

- [ ] **Step 4: Update YouTubeEmbed.astro script**

Find the `<script>` block:
```astro
<script>
  document.querySelectorAll<HTMLElement>(".yt-facade").forEach((el) => {
    el.addEventListener("click", () => {
      const videoId = el.dataset.vid;
      if (!videoId) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;border:0";
      el.replaceChildren(iframe);
    });
  });
</script>
```

Replace with:
```astro
<script>
  document.querySelectorAll<HTMLElement>(".yt-facade").forEach((el) => {
    el.addEventListener("click", () => {
      const videoId = el.dataset.vid;
      if (!videoId) return;
      if (typeof gtag !== "undefined") {
        gtag("event", "video_play", { video_id: videoId });
      }
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
      iframe.allow = "autoplay; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;border:0";
      el.replaceChildren(iframe);
    });
  });
</script>
```

- [ ] **Step 5: Lint + typecheck**

```bash
pnpm run lint && pnpm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/components/blog/PostBody.astro src/components/blog/YouTubeEmbed.astro
git commit -m "feat(analytics): add affiliate_click and video_play event tracking"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run full check**

```bash
pnpm run lint && pnpm run typecheck
```

Expected: no errors (build failure is a known pre-existing issue with `@astrojs/cloudflare` adapter — see HANDOFF.md).

- [ ] **Step 2: Manual smoke test — cookie banner**

Run `pnpm run dev`. Open `http://localhost:4321` in a private/incognito window (clears localStorage). Verify:
- Banner appears at the bottom of the page
- Clicking "Rechazar" hides the banner; no gtag network request fires (check DevTools Network tab)
- Refreshing the page does not show the banner again
- Opening a new private window, clicking "Aceptar": banner hides; `gtag.js` loads from `googletagmanager.com`

- [ ] **Step 3: Manual smoke test — Facebook Comments**

Open a blog post (`/blog/<slug>`). Verify:
- Comments section is NOT visible in the viewport on load (no FB SDK request)
- Scrolling to the bottom of the post triggers the FB SDK load (check DevTools Network for `sdk.js`)
- Comments widget renders

- [ ] **Step 4: Manual smoke test — event tracking**

With "Aceptar" selected (gtag loaded), open DevTools Console and enable GA4 DebugView (or use `?debug_mode=1` param). Verify:
- Clicking an affiliate link fires `affiliate_click` event
- Clicking a YouTube play button fires `video_play` event

- [ ] **Step 5: Update HANDOFF.md**

Add a Stage 09 section to HANDOFF.md documenting:
- `PUBLIC_GA4_MEASUREMENT_ID` env var required for GA4
- `PUBLIC_FACEBOOK_PAGE_ID=61579741058238` (preconfigurado)
- Cookie consent stored in `localStorage` key `cookie_consent`
- Consent Mode v2: analytics_storage denied by default

- [ ] **Step 6: Final commit**

```bash
git add HANDOFF.md
git commit -m "docs: update HANDOFF with Stage 09 integrations notes"
```
