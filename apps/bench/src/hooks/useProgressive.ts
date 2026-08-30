import { useEffect, useMemo, useState } from 'react';
import { analyzeProgressive, computeProgressiveCache } from '../lib/qasmProgressive';
import type { ProgressiveAnalysis } from '../lib/qasmProgressive';

type CacheState = {
  /** The qasm this cache was computed for. */
  qasm: string;
  data: Map<number, Record<string, number>>;
};

/**
 * Manages the progressive probability run: after the full simulation, it
 * pre-computes the probability distribution at every circuit moment so that
 * hovering a moment shows the intermediate state.
 *
 * The cache is keyed by the `qasm` it was computed for, so a stale cache is
 * never shown for a different circuit. The cache is only written from async
 * promise callbacks (never synchronously in the effect body), which keeps
 * React's lint rules happy.
 */
export function useProgressive(
  qasm: string,
  qasmSim: string,
  isSimulating: boolean,
  results: Record<string, number> | null,
) {
  const [hoveredMoment, setHoveredMoment] = useState<number | null>(null);
  const [cache, setCache] = useState<CacheState>({ qasm: '', data: new Map() });

  // Derived from qasm — no state needed for feasibility analysis.
  const progAnalysis: ProgressiveAnalysis = useMemo(
    () => analyzeProgressive(qasm),
    [qasm]
  );

  // True while the cache for the current circuit hasn't been computed yet.
  const isProgressing =
    progAnalysis.enabled &&
    progAnalysis.momentCount > 1 &&
    qasm !== '' &&
    cache.qasm !== qasm;

  useEffect(() => {
    if (!qasm || !qasmSim || isSimulating) return;
    if (!progAnalysis.enabled || progAnalysis.momentCount <= 1) return;

    let cancelled = false;
    computeProgressiveCache(qasmSim, qasm, progAnalysis.momentCount)
      .then((data) => {
        if (!cancelled) setCache({ qasm, data });
      })
      .catch(() => {
        // Mark the cache as resolved (empty) even on failure so isProgressing ends.
        if (!cancelled) setCache({ qasm, data: new Map() });
      });

    return () => {
      cancelled = true;
    };
  }, [qasm, qasmSim, isSimulating, progAnalysis]);

  // Show the hovered moment's cached results (only if the cache belongs to the
  // current circuit), otherwise fall back to the full simulation results.
  const displayResults = useMemo(() => {
    if (cache.qasm === qasm && hoveredMoment != null && cache.data.has(hoveredMoment)) {
      return cache.data.get(hoveredMoment) ?? null;
    }
    return results;
  }, [hoveredMoment, cache, results, qasm]);

  const momentLabel = useMemo(() => {
    if (hoveredMoment == null) return undefined;
    return progAnalysis.enabled
      ? `Moment ${hoveredMoment + 1} / ${progAnalysis.momentCount}`
      : undefined;
  }, [hoveredMoment, progAnalysis]);

  return {
    hoveredMoment,
    setHoveredMoment,
    isProgressing,
    displayResults,
    momentLabel,
  };
}
