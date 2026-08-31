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

export type SimRunResult = {
  code: string;
  qasm3: string;
  qasm2: string;
  probabilities: Record<string, number> | null;
  error: string | null;
};

export function useSimulator(initialCode: string) {
  const [code, setCode] = useState(initialCode);
  const [qasm3, setQasm3] = useState('');
  const [qasm2, setQasm2] = useState('');
  const [probabilities, setProbabilities] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

  // Core pipeline: runs for a given source string and resolves with the
  // *complete* result. Doesn't read back from React state anywhere.
  const execute = useCallback((sourceCode: string): Promise<SimRunResult> => {
    return new Promise((resolve) => {
      setError(null);
      setIsRunning(true);

      let compiledQasm3 = '';
      let compiledQasm2 = '';

      const finish = (result: SimRunResult) => {
        setIsRunning(false);
        resolve(result);
      };

      try {
        const fn = new Function('Quantum', sourceCode);
        const circuitObj = fn(Quantum);
        if (!circuitObj || typeof circuitObj.compile !== 'function') {
          throw new Error("Code must return a Quantum.Circuit object (e.g., 'return c;')");
        }

        compiledQasm3 = circuitObj.compile({ version: '3.0' });
        compiledQasm2 = circuitObj.compile({ version: '2.0' });
        setQasm3(compiledQasm3);
        setQasm2(compiledQasm2);

        const qc = new QuantumCircuit();
        qc.importQASM(compiledQasm2, (err: QasmError[] | string) => {
          if ((Array.isArray(err) && err.length > 0) || typeof err === 'string') {
            const detail = Array.isArray(err)
              ? err.map((e) => `Line ${e.line}: ${e.msg}`).join('\n')
              : err;
            const msg = `Simulation Error:\n${detail}`;
            setError(msg);
            finish({ code: sourceCode, qasm3: compiledQasm3, qasm2: compiledQasm2, probabilities: null, error: msg });
            return;
          }
          qc.run();
          const probs = qc.probabilities();
          setProbabilities(probs);
          finish({ code: sourceCode, qasm3: compiledQasm3, qasm2: compiledQasm2, probabilities: probs, error: null });
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        finish({ code: sourceCode, qasm3: compiledQasm3, qasm2: compiledQasm2, probabilities: null, error: msg });
      }
    });
  }, []);

  // UI-driven run: uses whatever `code` currently is
  const run = useCallback(() => {
    void execute(code);
  }, [execute, code]);

  // MCP-driven / programmatic run: takes code explicitly, updates the
  // editor state too, and returns the full result object.
  const runWithCode = useCallback(
    (newCode: string) => {
      setCode(newCode);
      return execute(newCode);
    },
    [execute]
  );

  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(run, 1000);
    return () => clearTimeout(timer);
  }, [run, autoRun]);

  return {
    code,
    setCode,
    qasm3,
    qasm2,
    probabilities,
    error,
    isRunning,
    autoRun,
    setAutoRun,
    run,
    runWithCode,
  };
}
