import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// UI auto-detects the browser language; tests assert French copy.
Object.defineProperty(window.navigator, 'language', { value: 'fr-FR', configurable: true });
Object.defineProperty(window.navigator, 'languages', { value: ['fr-FR', 'fr'], configurable: true });
