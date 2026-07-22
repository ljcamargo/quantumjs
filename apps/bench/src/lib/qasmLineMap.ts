import { CircuitAnalyzer } from '@ljcamargo/quirkvis-core';

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

/**
 * Build a map from "momentIndex:gateName:qubitsString" → 1-indexed QASM line number.
 *
 * Uses CircuitAnalyzer to parse the QASM into moments, then walks the QASM
 * lines alongside the moment statements.
 *
 * Edge cases handled:
 *  - Comment and header lines are skipped so they don't offset the mapping.
 *  - Multiple moment statements that originate from a single QASM line
 *    (e.g. `c = measure q;` expanding to one statement per qubit) all map
 *    to the same line number.
 *  - Barriers additionally get a qubits-less fallback key since the SVG
 *    only sets data-qv-moment + data-qv-barrier (no data-qv-qubits).
 */
export function buildQasmLineMap(qasm: string): Map<string, number> {
  if (!qasm) return new Map();

  const lines = qasm.split('\n');
  const analyzer = new CircuitAnalyzer();
  const analysis = analyzer.analyze(qasm);
  const { moments } = analysis;

  const map = new Map<string, number>();

  let lineIdx = 0;
  let lastMappedLine = 0;

  for (let mi = 0; mi < moments.length; mi++) {
    for (const stmt of moments[mi]) {
      // Advance past any non-content lines to the next gate/measure/barrier line.
      while (lineIdx < lines.length && isNonContentLine(lines[lineIdx])) {
        lineIdx++;
      }

      if (lineIdx >= lines.length) {
        // Past end of file: reuse last-mapped line for any remaining statements.
        if (lastMappedLine > 0) {
          const qubitsStr = stmt.qubits
            .map((q: { name: string; index: number }) => `${q.name}[${q.index}]`)
            .join(',');
          const key = `${mi}:${stmt.name}:${qubitsStr}`;
          map.set(key, lastMappedLine);
        }
        continue;
      }

      // Format qubits to match HoverInfo.qubits.join(',')
      const qubitsStr = stmt.qubits
        .map((q: { name: string; index: number }) => `${q.name}[${q.index}]`)
        .join(',');

      const key = `${mi}:${stmt.name}:${qubitsStr}`;
      const lineNum = lineIdx + 1; // 1-indexed line number
      map.set(key, lineNum);

      // Barriers: also store a qubits-less fallback key, because the barrier
      // SVG element only has data-qv-moment + data-qv-barrier attributes (no
      // data-qv-qubits), so HoverInfo.qubits will be undefined.
      if (stmt.type === 'barrier') {
        map.set(`${mi}:${stmt.name}:`, lineNum);
      }

      lastMappedLine = lineNum;
      lineIdx++;
    }
  }

  return map;
}
