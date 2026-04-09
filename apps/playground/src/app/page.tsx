"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Code, Zap, Cpu, Terminal, Layers, Info } from 'lucide-react';
import { motion } from 'framer-motion';
// @ts-ignore
import QuantumCircuit from 'quantum-circuit';
import * as Quantum from 'quantum-core';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

const DEFAULT_CODE = `// Welcome to QuantumJS Playground
// The DSL now returns the circuit object for smart processing
const c = Quantum.circuit({ qubits: 5 }, Q => {
  // Apply Hadamard to all qubits
  Q.all().h();
  
  // Apply X gate to the first qubit
  Q.first().x();
  
  // Create a Bell state on bits 2 and 3
  Q.bit(2).h();
  Q.bit(2).cx(Q.bit(3));
  
  // Advanced: QFT-like descend pattern
  Q.descend((q, { iteration, last }) => {
    q.h();
  });

  // Measure everything
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
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-cyan-500/30">
        <style dangerouslySetInnerHTML={{ __html: `
        .npm-editor textarea { outline: none !important; }
        .npm-editor pre { pointer-events: none; }
      `}} />

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="text-white w-6 h-6 fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                QuantumJS <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-slate-400">v2.0 Beta</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium font-mono">Real-time DSL Playground</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={compileAndSimulate}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Run Circuit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-88px)]">
        {/* Editor Area - WIDER */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col bg-[#111114] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2 text-slate-400">
                <Code className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">DSL Input</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 npm-editor">
                <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => highlight(code, languages.javascript, 'javascript')}
                    padding={10}
                    style={{
                        fontFamily: '"Geist Mono", "Fira code", "Fira Mono", monospace',
                        fontSize: 13,
                        minHeight: '100%',
                    }}
                />
            </div>
          </div>
          
          {error && (
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-sm overflow-auto"
            >
              <Info className="w-5 h-5 flex-shrink-0" />
              <pre className="whitespace-pre-wrap">{error}</pre>
            </motion.div>
          )}
        </div>

        {/* Output Areas */}
        <div className="lg:col-span-7 grid grid-rows-2 gap-6 overflow-hidden">
          {/* QASM Output */}
          <div className="bg-[#111114] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative group">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-500/70">Generated QASM 3.0</span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>
            <div className="flex-1 p-6 overflow-auto">
                <pre 
                    className="text-sm font-mono text-slate-400 transition-colors group-hover:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: highlight(qasm, languages.clike, 'clike') }}
                />
            </div>
            <div className="absolute right-6 top-16 pointer-events-none opacity-5">
               <Cpu className="w-32 h-32" />
            </div>
          </div>

          {/* Simulation View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
             <div className="bg-[#111114] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-black/20 text-slate-400">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Probabilities</span>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                    {isSimulating ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                        <div className="w-12 h-12 border-2 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium">Running simulation...</p>
                      </div>
                    ) : results ? (
                      <div className="space-y-4">
                        {Object.entries(results).map(([state, prob]) => (
                          <div key={state} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-cyan-400">|{state}⟩</span>
                              <span className="text-slate-500">{(prob * 100).toFixed(2)}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${prob * 100}%` }}
                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-600 text-sm font-mono text-center">
                        Write code to see results
                      </div>
                    )}
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Circuit Visualizer</h3>
                    <p className="text-sm text-slate-400 max-w-[240px]">
                      Interactive circuit drawing library integration coming soon in the next update.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
