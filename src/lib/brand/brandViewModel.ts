import { toHTML } from "@portabletext/to-html";
import type { SimplePortableText } from "@/types/sanity.types";

/** Convierte SimplePortableText a HTML. Solo bloques normales (sin YouTube ni ProductList). */
export function ptToHtml(blocks: SimplePortableText | undefined): string {
  if (!blocks?.length) return "";
  return toHTML(blocks as Parameters<typeof toHTML>[0], {
    components: {
      block: {
        normal: ({ children }) => `<p>${children}</p>`,
        blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
      },
    },
  });
}

/** Extrae texto plano de SimplePortableText. Útil para JSON-LD y atributos title. */
export function ptToText(blocks: SimplePortableText | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => b.children?.map((s) => s.text ?? "").join("") ?? "")
    .join(" ")
    .trim();
}
