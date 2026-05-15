"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Play } from 'lucide-react';
// @ts-ignore
import QuantumCircuit from 'quantum-circuit';
import * as Quantum from 'quantum-core';

import { EditorPanel, QasmPanel, ResultsPanel, ErrorDisplay } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';

const DEFAULT_CODE = `// Welcome to QuantumJS Playground
const c = Quantum.circuit({ qubits: 3 }, Q => {
  Q.all().h();
  Q.bit(0).cx(Q.bit(1));
  Q.bit(1).cx(Q.bit(2));
  Q.all().barrier().measure();
});

return c;`;

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [qasm, setQasm] = useState('');
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

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
    const timer = setTimeout(compileAndSimulate, 1000);
    return () => clearTimeout(timer);
  }, [compileAndSimulate]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-slate-200 font-sans overflow-hidden">
      {/* Header - More compact */}
      <header className="h-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="text-white w-3.5 h-3.5 fill-white/20" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            QuantumJS <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider text-slate-400">Beta</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={compileAndSimulate}
            className="h-7 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            RUN
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
