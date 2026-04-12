import '@testing-library/jest-dom/vitest';

// jsdom does not implement scroll APIs. TanStack Router's scroll restoration
// calls window.scrollTo during route commits; stub it so tests stay quiet.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
