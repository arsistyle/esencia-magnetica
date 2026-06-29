export interface ArticleJsonLdParams {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  imageUrl?: string | null;
  url: string;
  lang: string;
}

export function buildArticleJsonLd(params: ArticleJsonLdParams): string {
  const { title, publishedAt, updatedAt, authorName, imageUrl, url, lang } =
    params;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    url,
    inLanguage: lang,
  });
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export interface BrandJsonLdParams {
  personName?: string;
  siteUrl: string;
  brandUrl: string;
  heroUrl?: string | null;
  logoUrl?: string | null;
  socialUrls?: string[];
}

export function buildBrandJsonLd(params: BrandJsonLdParams): string {
  const { personName, siteUrl, brandUrl, heroUrl, logoUrl, socialUrls } =
    params;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      ...(personName
        ? [
            {
              "@type": "Person",
              name: personName,
              url: brandUrl,
              ...(heroUrl ? { image: heroUrl } : {}),
            },
          ]
        : []),
      {
        "@type": "Organization",
        name: "Esencia Magnética",
        url: siteUrl,
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(socialUrls?.length ? { sameAs: socialUrls } : {}),
        ...(personName
          ? { founder: { "@type": "Person", name: personName } }
          : {}),
      },
    ],
  });
}
