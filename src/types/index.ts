export type Locale = "es" | "en";

export interface SeoMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface NavMenuItem {
  label: string;
  href: string;
  isExternal?: boolean;
}
