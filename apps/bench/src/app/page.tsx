"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Play } from 'lucide-react';
// @ts-ignore
import QuantumCircuit from 'quantum-circuit';
import * as Quantum from 'quantumjs';

import { EditorPanel, QasmPanel, ResultsPanel, ErrorDisplay } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';

import DEFAULT_CODE from '../samples/qft_sugar.quantumjs';

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [qasm, setQasm] = useState('');
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

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
        <div className="flex items-center gap-4">
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
                <QasmPanel qasm={qasm} />
             </div>
             <div className="w-64 h-full">
                <ResultsPanel results={results} isSimulating={isSimulating} />
             </div>
          </div>

          {/* Bottom Half: Visualizer */}
          <div className="flex-1 overflow-hidden h-full">
             <VisualizerPanel qasm={qasm} />
          </div>
        </div>
      </main>
    </div>
  );
}
