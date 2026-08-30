import { useCallback, useEffect, useState } from 'react';
// @ts-expect-error — quantum-circuit has no type declarations
import QuantumCircuit from 'quantum-circuit';
import * as Quantum from '@quantum-js/dsl';

/**
 * Owns the code editor document and the compile+simulate pipeline:
 *   DSL code → QASM 3.0 (display) → QASM 2.0 (simulation) → probabilities.
 *
 * Also manages the autorun debounce and exposes `run()` for manual runs.
 */
type QasmError = { line: number; msg: string };

export function useSimulator(initialCode: string) {
  const [code, setCode] = useState(initialCode);
  const [qasm, setQasm] = useState('');
  const [qasmSim, setQasmSim] = useState('');
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

  const run = useCallback(() => {
    setError(null);
    try {
      const execute = new Function('Quantum', code);
      const circuitObj = execute(Quantum);

      if (!circuitObj || typeof circuitObj.compile !== 'function') {
        throw new Error("Code must return a Quantum.Circuit object (e.g., 'return c;')");
      }

      const outputQasm3 = circuitObj.compile({ version: '3.0' });
      setQasm(outputQasm3);

      const outputQasm2 = circuitObj.compile({ version: '2.0' });
      setQasmSim(outputQasm2);

      setIsSimulating(true);
      const qc = new QuantumCircuit();
      qc.importQASM(outputQasm2, (err: QasmError[] | string) => {
        if (Array.isArray(err) && err.length > 0) {
          const messages = err.map((e) => `Line ${e.line}: ${e.msg}`).join('\n');
          setError(`Simulation Error:\n${messages}`);
          setIsSimulating(false);
          return;
        } else if (typeof err === 'string') {
          setError(`Simulation Error: ${err}`);
          setIsSimulating(false);
          return;
        }

        qc.run();
        const probabilities = qc.probabilities();
        setResults(probabilities);
        setIsSimulating(false);
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
      setIsSimulating(false);
    }
  }, [code]);

  // Autorun: debounce re-simulation 1s after code changes
  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(run, 1000);
    return () => clearTimeout(timer);
  }, [run, autoRun]);

  return {
    code,
    setCode,
    qasm,
    qasmSim,
    results,
    error,
    isSimulating,
    autoRun,
    setAutoRun,
    run,
  };
}
