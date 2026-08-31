import { useCallback } from 'react';
import { useSimulator } from './useSimulator';
import { useProgressive } from './useProgressive';

export type PipelineRunResult = {
  code: string;
  qasm3: string;
  qasm2: string;
  probabilities: Record<string, number> | null;
  error: string | null;
  moment: number | null;
};

/**
 * Composes the compile+simulate pipeline (`useSimulator`) with the
 * moment-by-moment progressive cache (`useProgressive`). The two stay
 * independently owned — this hook only sequences them:
 *
 *   code → (compile + simulate) → qasm/probabilities
 *        → optionally (truncate to moment) → moment-specific probabilities
 *
 * `runWithMoment` is the entry point for callers (e.g. an MCP tool handler)
 * that need the whole pipeline as one awaited result, honoring an optional
 * `momentum` step. Pass `momentum` omitted or -1 for full-circuit results.
 */
export function useQuantumPipeline(initialCode: string) {
  const simulator = useSimulator(initialCode);
  const progressive = useProgressive(
    simulator.qasm3,
    simulator.qasm2,
    simulator.isRunning,
    simulator.probabilities
  );

  const runWithMoment = useCallback(
    async (code: string, momentum?: number): Promise<PipelineRunResult> => {
      const runResult = await simulator.runWithCode(code);

      if (momentum == null || momentum < 0 || runResult.error) {
        progressive.setFocusedMoment(null);
        return { ...runResult, moment: null };
      }

      const momentProbabilities = await progressive.getMomentProbabilities(
        runResult.qasm3,
        runResult.qasm2,
        momentum
      );
      progressive.setFocusedMoment(momentum); // keep UI highlight in sync with what the caller asked for

      return {
        ...runResult,
        probabilities: momentProbabilities ?? runResult.probabilities,
        moment: momentum,
      };
    },
    [simulator, progressive]
  );

  return {
    ...simulator,
    ...progressive,
    runWithMoment,
  };
}
