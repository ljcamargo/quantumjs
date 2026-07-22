import { CircuitAnalyzer } from '@ljcamargo/quirkvis-core';

/** Maximum qubits allowed for progressive pre-computation. */
const MAX_QUBITS = 8;
/** Maximum moments allowed for progressive pre-computation. */
const MAX_MOMENTS = 30;

/** Returns true if the QASM line is a non-gate line (header, comment, or blank). */
function isNonContentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed === '' ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('OPENQASM') ||
    trimmed.startsWith('include') ||
    trimmed.startsWith('qubit') ||
    trimmed.startsWith('bit') ||
    trimmed.startsWith('qreg') ||
    trimmed.startsWith('creg')
  );
}

/** Returns true if a QASM line is a measurement statement. */
function isMeasureLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase();
  return trimmed.includes('measure');
}

export interface ProgressiveAnalysis {
  /** Whether the circuit is small enough for progressive mode. */
  enabled: boolean;
  /** Total number of moments. */
  momentCount: number;
  /** Number of qubits. */
  qubitCount: number;
}

/**
 * Check whether the circuit is small enough for progressive simulation.
 */
export function analyzeProgressive(qasm: string): ProgressiveAnalysis {
  if (!qasm) return { enabled: false, momentCount: 0, qubitCount: 0 };

  const analyzer = new CircuitAnalyzer();
  const analysis = analyzer.analyze(qasm);
  const { moments, registers } = analysis;

  const qubitRegisters = registers.filter((r: any) => r.type === 'qubit');
  const qubitCount = qubitRegisters.reduce((sum: number, r: any) => sum + r.size, 0);
  const momentCount = moments.length;

  return {
    enabled: qubitCount <= MAX_QUBITS && momentCount <= MAX_MOMENTS,
    momentCount,
    qubitCount,
  };
}

/**
 * Build a truncated QASM 2.0 string containing all operations up to (and
 * including) the given moment, plus all measurement lines from the original.
 *
 * @param qasmSim  The full QASM 2.0 string (for simulation).
 * @param qasmVis  The full QASM 3.0 string (for CircuitAnalyzer moment analysis).
 * @param upToMoment  Maximum moment index to include (0-based).
 */
export function truncateQasmAtMoment(
  qasmSim: string,
  qasmVis: string,
  upToMoment: number
): string {
  if (!qasmSim || !qasmVis) return '';

  const lines = qasmSim.split('\n');
  const analyzer = new CircuitAnalyzer();
  const analysis = analyzer.analyze(qasmVis);
  const { moments } = analysis;

  if (upToMoment >= moments.length - 1) {
    // Last moment → return the full circuit unchanged
    return qasmSim;
  }

  // 1. Find header boundary and line index for each moment
  let lineIdx = 0;
  let contentStart = 0;

  // Skip headers
  while (lineIdx < lines.length && isNonContentLine(lines[lineIdx])) {
    lineIdx++;
  }
  contentStart = lineIdx;

  // Walk moments to find the last line index for moments 0..upToMoment
  // Also collect measurement line indices
  const measureLineSet = new Set<number>();
  let cutoffLine = contentStart - 1; // Last content line to include
  let lastLineForMoment = -1;

  for (let mi = 0; mi < moments.length; mi++) {
    for (const stmt of moments[mi]) {
      // Advance past non-content lines
      while (lineIdx < lines.length && isNonContentLine(lines[lineIdx])) {
        lineIdx++;
      }

      if (lineIdx >= lines.length) {
        // Past end: subsequent statements share the last known line
        if (stmt.type === 'measure' && lastLineForMoment >= 0) {
          measureLineSet.add(lastLineForMoment);
        }
        continue;
      }

      if (mi <= upToMoment) {
        lastLineForMoment = lineIdx;
        cutoffLine = lineIdx;
      }

      if (stmt.type === 'measure') {
        measureLineSet.add(lineIdx);
      }

      lineIdx++;
    }
  }

  // 2. Build the truncated QASM
  const resultLines: string[] = [];

  // Add headers
  for (let i = 0; i < contentStart; i++) {
    resultLines.push(lines[i]);
  }

  // Add content up to the cutoff line
  for (let i = contentStart; i <= cutoffLine && i < lines.length; i++) {
    resultLines.push(lines[i]);
  }

  // Add any measurement lines that are AFTER the cutoff (not already included)
  const sortedMeasures = [...measureLineSet].sort((a, b) => a - b);
  for (const ml of sortedMeasures) {
    if (ml > cutoffLine && ml < lines.length) {
      resultLines.push(lines[ml]);
    }
  }

  return resultLines.join('\n');
}

/**
 * Pre-compute probability results for every moment prefix.
 * Returns a map from momentIndex → probability Record.
 *
 * Runs sequentially (one per moment) to avoid overwhelming the simulator.
 * Errors are caught per-moment and logged via console.warn — never thrown.
 */
export async function computeProgressiveCache(
  qasmSim: string,
  qasmVis: string,
  maxMoments: number
): Promise<Map<number, Record<string, number>>> {
  const cache = new Map<number, Record<string, number>>();

  // Simulate moments 0 through maxMoments-1 (the last moment = full circuit)
  for (let mi = 0; mi < maxMoments; mi++) {
    const truncated = truncateQasmAtMoment(qasmSim, qasmVis, mi);
    if (!truncated) continue;

    try {
      const result = await simulateQasm(truncated);
      if (result) {
        cache.set(mi, result);
      }
    } catch (err) {
      console.warn(`[progressive] Moment ${mi} simulation failed:`, err);
    }

    // Yield to the event loop between moments so the UI stays responsive
    await new Promise((r) => setTimeout(r, 0));
  }

  return cache;
}

/**
 * Simulate a single QASM 2.0 string and return probability results.
 * Returns null on any error (never throws).
 */
function simulateQasm(qasm: string): Promise<Record<string, number> | null> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore — QuantumCircuit is a CJS module loaded at runtime
      const QuantumCircuit = require('quantum-circuit');
      const qc = new QuantumCircuit();
      qc.importQASM(qasm, (err: any) => {
        // quantum-circuit passes [] (empty array) on success, truthy but no error
        if (err && ((Array.isArray(err) && err.length > 0) || typeof err === 'string')) {
          console.warn('[progressive] importQASM error:', err);
          resolve(null);
          return;
        }
        try {
          qc.run();
          const probabilities = qc.probabilities();
          resolve(probabilities as Record<string, number>);
        } catch (runErr) {
          console.warn('[progressive] run error:', runErr);
          resolve(null);
        }
      });
    } catch (e) {
      console.warn('[progressive] constructor error:', e);
      resolve(null);
    }
  });
}
