// router.noop.js
// Minimal noop module to satisfy imports when a real implementation isn't required.

export function navigateTo(path) {
  // no-op navigation fallback (keeps client code safe)
  console.warn("router.noop.navigateTo called with", path);
  // Optionally, fallback to hash navigation:
  // if (typeof window !== 'undefined') window.location.hash = path.replace(/^\//, '');
}

export default { navigateTo };
