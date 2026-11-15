// Single service-worker registration point. Never registers in dev, iframes or Lovable previews.
const SW = "/sw.js";
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

export function isSwAllowed(hostname: string, inIframe: boolean, search: string, prod: boolean): boolean {
  const h = hostname.toLowerCase();
  if (!prod || inIframe || new URLSearchParams(search).get("sw") === "off") return false;
  if (/\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(h)) {
    const label = h.split(".")[0] ?? "";
    if (PREVIEW_LABEL.test(label) || /^project--.+-dev$/.test(label)) return false;
  }
  if (["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some((d) => h === d || h.endsWith(`.${d}`))) return false;
  return true;
}

async function unregisterApp() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith(SW) || r.installing?.scriptURL.endsWith(SW) || r.waiting?.scriptURL.endsWith(SW)).map((r) => r.unregister()));
}

export function registerAppServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  let inIframe = true;
  try { inIframe = window.self !== window.top; } catch { /* cross-origin parent */ }
  if (!isSwAllowed(window.location.hostname, inIframe, window.location.search, import.meta.env.PROD)) { void unregisterApp(); return; }
  void navigator.serviceWorker.register(SW, { scope: "/" }).catch(() => undefined);
}
