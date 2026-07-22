"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, BookOpen } from 'lucide-react';
// @ts-ignore
import QuantumCircuit from 'quantum-circuit';
import * as Quantum from '@quantum-js/dsl';

import { EditorPanel, QasmPanel, ResultsPanel, ErrorDisplay } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';
import type { HoverInfo } from '@ljcamargo/quirkvis-react';
import { buildQasmLineMap } from '../lib/qasmLineMap';

import DEFAULT_CODE from '../samples/qft_sugar.quantumjs';

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [qasm, setQasm] = useState('');
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const compileAndSimulate = useCallback(() => {
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

      setIsSimulating(true);
      const qc = new QuantumCircuit();
      qc.importQASM(outputQasm2, (err: any) => {
        if (err && Array.isArray(err) && err.length > 0) {
          const messages = err.map((e: any) => `Line ${e.line}: ${e.msg}`).join('\n');
          setError(`Simulation Error:\n${messages}`);
          setIsSimulating(false);
          return;
        } else if (err && typeof err === 'string') {
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

  // Build a memoized map: "momentIndex:gateName:q[0],q[1]" → 1-indexed QASM line
  const lineMap = useMemo(() => buildQasmLineMap(qasm), [qasm]);

  // On hover, resolve HoverInfo to a QASM line number
  const handleHover = useCallback(
    (info: HoverInfo) => {
      if (info.type === 'none') {
        setHighlightedLine(null);
        return;
      }
      // Only gates, measures, and barriers map to QASM lines
      if (info.type !== 'gate' && info.type !== 'measure' && info.type !== 'barrier') {
        setHighlightedLine(null);
        return;
      }
      const name = info.gateName || info.type;
      const qubitsStr = info.qubits?.join(',') || '';
      const key = `${info.momentIndex}:${name}:${qubitsStr}`;
      const line = lineMap.get(key);
      setHighlightedLine(line ?? null);
    },
    [lineMap]
  );

  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(compileAndSimulate, 1000);
    return () => clearTimeout(timer);
  }, [compileAndSimulate, autoRun]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-slate-200 font-sans overflow-hidden">
      {/* Header - More compact */}
      <header className="h-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <img src="/logo.svg" alt="QuantumJS" className="w-4 h-4 object-contain" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            QuantumJS <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider text-slate-400">Bench</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Autorun Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-cyan-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-cyan-400 after:rounded-full after:h-3 after:w-3 after:transition-all relative peer-checked:bg-cyan-950 border border-slate-700 peer-checked:border-cyan-700/50"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-checked:text-cyan-400">
              Autorun
            </span>
          </label>

          <button
            onClick={compileAndSimulate}
            className="h-7 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            {autoRun ? 'RERUN' : 'RUN'}
          </button>

          <a
            href="https://quantumjsdocs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 ml-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3" />
            Docs
          </a>
          <a
            href="https://github.com/ljcamargo/quantumjs"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded transition-all flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content - Tight grid */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor (40%) */}
        <div className="w-[40%] flex flex-col border-r border-white/5 h-full">
          <div className="flex-1 overflow-hidden h-full">
             <EditorPanel code={code} setCode={setCode} />
          </div>
          <ErrorDisplay error={error} />
        </div>

        {/* Right Side: Outputs (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20 h-full">
          {/* Top Half: QASM & Results */}
          <div className="flex h-[40%] border-b border-white/5 flex-shrink-0">
             <div className="flex-1 border-r border-white/5 h-full">
                <QasmPanel qasm={qasm} highlightedLine={highlightedLine} />
             </div>
             <div className="w-64 h-full">
                <ResultsPanel results={results} isSimulating={isSimulating} />
             </div>
          </div>

          {/* Bottom Half: Visualizer */}
          <div className="flex-1 overflow-hidden h-full">
             <VisualizerPanel qasm={qasm} onHover={handleHover} />
          </div>
        </div>
      </main>
    </div>
  );
}
