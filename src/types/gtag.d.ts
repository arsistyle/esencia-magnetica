declare global {
  interface Window {
    dataLayer: unknown[];
  }
  function gtag(...args: unknown[]): void;
}

export {};
