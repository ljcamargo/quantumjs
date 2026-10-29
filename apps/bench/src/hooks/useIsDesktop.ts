'use client';

import { useSyncExternalStore } from 'react';

/**
 * Width at which the Bench switches from the stacked mobile shell to the
 * desktop console. Chosen as `lg` (1024px): below it, the desktop grid leaves
 * the QASM column under ~360px (40% editor + 16rem results), which is unusable.
 * Tablets in portrait therefore get the stack; landscape gets the console.
 */
const DESKTOP_QUERY = '(min-width: 64rem)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// Assume desktop during SSR/hydration so the first paint matches the accepted
// desktop layout. Mobile then re-renders into its own behavior immediately
// after hydration (CSS already handles the visual structure either way).
function getServerSnapshot() {
  return true;
}

/**
 * Behavioural viewport hook.
 *
 * Layout must stay CSS-only (`lg:` classes / `.bench-main`) so nothing is
 * mounted twice. This hook is only for decisions that cannot be expressed in
 * CSS: QuirkVis `interactive` (hover is pointer-only), the mobile default fit
 * mode, and similar props.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
