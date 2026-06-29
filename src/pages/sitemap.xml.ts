export const prerender = false;

import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import { sitemapPostsQuery } from "@/lib/queries";

interface SitemapPost {
  _id: string;
  slug: string;
  language: string;
  _updatedAt: string;
}

interface SitemapUrl {
  loc: string;
  lastmod: string;
  alternates?: { es: string; en: string };
}

function buildXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map(
      (u) => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>${
      u.alternates
        ? `
    <xhtml:link rel="alternate" hreflang="es" href="${u.alternates.es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${u.alternates.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.alternates.es}"/>`
        : ""
    }
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}
</urlset>`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl =
    site?.toString().replace(/\/$/, "") ?? "https://esencia-magnetica.com";

  const posts = (await sanityClient.fetch(sitemapPostsQuery)) as SitemapPost[];

  const esPosts = posts.filter((p) => p.language === "es");
  const enPosts = posts.filter((p) => p.language === "en");

  // Match EN to ES by stripping the __i18n_en suffix from EN _id
  const enByBaseId = new Map(
    enPosts.map((p) => [p._id.replace("__i18n_en", ""), p]),
  );

  const urls: SitemapUrl[] = [];

  // Static pages
  const today = new Date().toISOString().slice(0, 10);
  const staticPages = [
    { es: "/", en: "/en" },
    { es: "/blog", en: "/en/blog" },
    { es: "/productos", en: "/en/products" },
    { es: "/marca", en: "/en/brand" },
  ];

  for (const { es, en } of staticPages) {
    urls.push({
      loc: `${siteUrl}${es}`,
      lastmod: today,
      alternates: { es: `${siteUrl}${es}`, en: `${siteUrl}${en}` },
    });
  }

  // Post pairs
  for (const esPost of esPosts) {
    const enPost = enByBaseId.get(esPost._id);
    const lastmod = esPost._updatedAt.slice(0, 10);
    const esLoc = `${siteUrl}/blog/${esPost.slug}`;

    if (enPost) {
      const enLoc = `${siteUrl}/en/blog/${enPost.slug}`;
      urls.push({
        loc: esLoc,
        lastmod,
        alternates: { es: esLoc, en: enLoc },
      });
      urls.push({
        loc: enLoc,
        lastmod: enPost._updatedAt.slice(0, 10),
        alternates: { es: esLoc, en: enLoc },
      });
    } else {
      // ES-only post (no EN translation yet)
      urls.push({ loc: esLoc, lastmod });
    }
  }

  return new Response(buildXml(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
