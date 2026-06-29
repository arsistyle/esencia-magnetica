// src/types/gtag.d.ts
declare global {
  interface Window {
    dataLayer: unknown[];
    FB?: { XFBML?: { parse: () => void } };
  }
  function gtag(...args: unknown[]): void;
}

export {};
