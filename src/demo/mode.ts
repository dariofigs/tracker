/** True when the page was opened under /demo. Decided once at load; the real app path never sets it. */
export const isDemo = typeof window !== 'undefined' && /^\/demo(\/|$)/.test(window.location.pathname)
