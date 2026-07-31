import "@testing-library/jest-dom";

// jsdom doesn't implement matchMedia; default to "no match" (e.g. no hover-capable
// pointer) so components relying on it behave predictably under test.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
