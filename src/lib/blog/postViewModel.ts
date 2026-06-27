// src/lib/blog/postViewModel.ts

export function formatPostDate(iso: string, lang: "es" | "en"): string {
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ponytail: WPM fijo; ajustar si la audiencia lo requiere
export function readingTime(body: unknown[]): number {
  const WPM = 200;
  const text = (
    body as Array<{ _type: string; children?: Array<{ text?: string }> }>
  )
    .filter((b) => b._type === "block")
    .flatMap((b) => b.children ?? [])
    .map((c) => c.text ?? "")
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WPM));
}
