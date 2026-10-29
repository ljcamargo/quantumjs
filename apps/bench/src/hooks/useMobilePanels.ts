'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Panels that participate in the mobile vertical stack. */
export type PanelId = 'editor' | 'circuit' | 'qasm' | 'results';

export const DEFAULT_MOBILE_PANELS: PanelId[] = ['editor', 'circuit'];

/** CodePen-like behaviour: at most two panels open at once on mobile. */
const MAX_OPEN = 2;
const STORAGE_KEY = 'bench:mobilePanels:v1';
const VALID_PANELS: PanelId[] = ['editor', 'circuit', 'qasm', 'results'];

function sanitize(value: unknown): PanelId[] {
  if (!Array.isArray(value)) return DEFAULT_MOBILE_PANELS.slice();
  const filtered = Array.from(
    new Set(
      value.filter((item): item is PanelId =>
        VALID_PANELS.includes(item as PanelId)
      )
    )
  );
  return filtered.length > 0
    ? filtered.slice(-MAX_OPEN)
    : DEFAULT_MOBILE_PANELS.slice();
}

/**
 * Owns which panels are expanded in the mobile stack.
 *
 * - Desktop ignores this state entirely (CSS forces panel bodies visible).
 * - At most two panels are open; opening a third evicts the least recently
 *   expanded one, keeping the shell free of page-level scrolling.
 * - `focus(id)` collapses everything else to give one panel the full height
 *   (and restores the default pair when pressed again while solo).
 * - State persists in localStorage, restored after mount to stay SSR-safe.
 */
export function useMobilePanels() {
  const [open, setOpen] = useState<PanelId[]>(DEFAULT_MOBILE_PANELS);
  const loaded = useRef(false);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (private mode, blocked storage)
    }

    if (!raw) {
      loaded.current = true;
      return;
    }

    // Applied in a task (not synchronously in the effect body) so the first
    // client render matches SSR and React's set-state-in-effect rule stays
    // happy. Persistence stays disabled until the restore has happened.
    const timer = window.setTimeout(() => {
      try {
        setOpen(sanitize(JSON.parse(raw as string)));
      } catch {
        // malformed value: fall back to the default pair
      } finally {
        loaded.current = true;
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      // ignore persistence failures
    }
  }, [open]);

  const isOpen = useCallback((id: PanelId) => open.includes(id), [open]);

  const toggle = useCallback((id: PanelId) => {
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((panel) => panel !== id);
      return [...prev, id].slice(-MAX_OPEN);
    });
  }, []);

  const focus = useCallback((id: PanelId) => {
    setOpen((prev) =>
      prev.length === 1 && prev[0] === id
        ? DEFAULT_MOBILE_PANELS.slice()
        : [id]
    );
  }, []);

  return {
    open,
    openCount: open.length,
    isOpen,
    toggle,
    focus,
  };
}
