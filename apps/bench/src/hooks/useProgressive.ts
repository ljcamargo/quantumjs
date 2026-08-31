import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzeProgressive, computeProgressiveCache } from '../lib/qasmProgressive';
import type { ProgressiveAnalysis } from '../lib/qasmProgressive';

type CacheState = {
  /** The qasm this cache was computed for. */
  qasm: string;
  data: Map<number, Record<string, number>>;
};

// Pure: no component state involved, so it's safe to call from anywhere
// (effect callbacks, event handlers, other async functions) without
// tripping "setState in effect" lint rules.
async function computeCacheData(
  forQasm: string,
  forQasmSim: string,
  momentCount: number
): Promise<Map<number, Record<string, number>>> {
  try {
    return await computeProgressiveCache(forQasmSim, forQasm, momentCount);
  } catch {
    return new Map();
  }
}

/**
 * Manages the progressive probability run: after the full simulation, it
 * pre-computes the probability distribution at every circuit moment so that
 * focusing a moment (via hover or an MCP call) shows the intermediate state.
 *
 * The cache is keyed by the `qasm` it was computed for, so a stale cache is
 * never shown for a different circuit.
 *
 * Two ways to get moment data:
 *  - Passive: the internal effect builds the cache automatically once a full
 *    simulation finishes, driving `displayResults` for hover-driven UI. The
 *    effect calls `setMomentCache` itself, directly in its own `.then`, per
 *    React's "subscribe to an external system, setState in the callback"
 *    pattern — it does not delegate to a shared setState-calling helper.
 *  - Active: `getMomentProbabilities` lets a caller (e.g. an MCP tool
 *    handler) await a specific moment's probabilities directly, building
 *    the cache on demand if it isn't there yet. This runs outside any
 *    effect (invoked from an event/async handler), so it's free to call
 *    `setMomentCache` itself too.
 */
export function useProgressive(
  qasm: string,
  qasmSim: string,
  isSimulating: boolean,
  results: Record<string, number> | null,
) {
  const [focusedMoment, setFocusedMoment] = useState<number | null>(null);
  const [momentCache, setMomentCache] = useState<CacheState>({ qasm: '', data: new Map() });

  // Derived from qasm — no state needed for feasibility analysis.
  const momentInfo: ProgressiveAnalysis = useMemo(
    () => analyzeProgressive(qasm),
    [qasm]
  );

  // Passive path: auto-build the cache once a full simulation settles.
  // setMomentCache is called directly in this effect's own `.then`, not via
  // a shared helper — this is the pattern React's lint rule expects.
  useEffect(() => {
    if (!qasm || !qasmSim || isSimulating) return;
    if (!momentInfo.enabled || momentInfo.momentCount <= 1) return;
    if (momentCache.qasm === qasm) return; // already cached for this circuit

    let cancelled = false;
    computeCacheData(qasm, qasmSim, momentInfo.momentCount).then((data) => {
      if (cancelled) return;
      setMomentCache({ qasm, data });
    });
    return () => {
      cancelled = true;
    };
  }, [qasm, qasmSim, isSimulating, momentInfo, momentCache.qasm]);

  // Active path: for a caller that needs one specific moment right now and
  // can await it (e.g. an MCP tool handler processing a `momentum` param).
  // Not called from an effect, so setting state here directly is fine.
  const getMomentProbabilities = useCallback(
    async (forQasm: string, forQasmSim: string, moment: number) => {
      if (momentCache.qasm === forQasm) {
        return momentCache.data.get(moment) ?? null;
      }
      const data = await computeCacheData(forQasm, forQasmSim, momentInfo.momentCount);
      setMomentCache({ qasm: forQasm, data });
      return data.get(moment) ?? null;
    },
    [momentCache, momentInfo.momentCount]
  );

  // True while the cache for the current circuit hasn't been computed yet.
  const isCachingMoments =
    momentInfo.enabled &&
    momentInfo.momentCount > 1 &&
    qasm !== '' &&
    momentCache.qasm !== qasm;

  // Show the focused moment's cached results (only if the cache belongs to
  // the current circuit), otherwise fall back to the full simulation results.
  const displayResults = useMemo(() => {
    if (momentCache.qasm === qasm && focusedMoment != null && momentCache.data.has(focusedMoment)) {
      return momentCache.data.get(focusedMoment) ?? null;
    }
    return results;
  }, [focusedMoment, momentCache, results, qasm]);

  const momentLabel = useMemo(() => {
    if (focusedMoment == null) return undefined;
    return momentInfo.enabled
      ? `Moment ${focusedMoment + 1} / ${momentInfo.momentCount}`
      : undefined;
  }, [focusedMoment, momentInfo]);

  return {
    focusedMoment,
    setFocusedMoment,
    momentInfo,
    isCachingMoments,
    displayResults,
    momentLabel,
    getMomentProbabilities,
  };
}
