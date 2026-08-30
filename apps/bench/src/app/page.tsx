"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { Play, BookOpen, FolderOpen, Download, Copy, FilePlus } from 'lucide-react';

import { EditorPanel, QasmPanel, ResultsPanel, SamplesPanel, ErrorDisplay } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';
import { GitHubIcon } from '../components/icons';
import type { HoverInfo } from '@ljcamargo/quirkvis-react';
import { buildQasmLineMap } from '../lib/qasmLineMap';
import { buildSampleTree } from '../lib/sampleTree';
import { useSimulator } from '../hooks/useSimulator';
import { useProgressive } from '../hooks/useProgressive';
import { useFileActions } from '../hooks/useFileActions';
import sampleEntries, { getSampleCode } from '../sampleRegistry';

const sampleTree = buildSampleTree(sampleEntries);
const DEFAULT_CODE = getSampleCode('samples/qft_sugar.js')!;

export default function Playground() {
  // Simulation pipeline (code → QASM → probabilities)
  const sim = useSimulator(DEFAULT_CODE);
  const { qasm, qasmSim, results, error, isSimulating, autoRun, setAutoRun, setCode } = sim;

  // Progressive moment-by-moment results + hovered moment
  const prog = useProgressive(qasm, qasmSim, isSimulating, results);
  const { setHoveredMoment } = prog;

  // Download / copy / new-file actions
  const actions = useFileActions(sim.code, qasm, results, setCode);

  // UI state
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [activeSamplePath, setActiveSamplePath] = useState('samples/qft_sugar.js');
  const [showSamples, setShowSamples] = useState(false);

  // Hover → QASM line + moment
  const lineMap = useMemo(() => buildQasmLineMap(qasm), [qasm]);
  const handleHover = useCallback(
    (info: HoverInfo) => {
      if (info.type === 'none') {
        setHighlightedLine(null);
        setHoveredMoment(null);
        return;
      }
      if (info.momentIndex >= 0) setHoveredMoment(info.momentIndex);
      if (info.type !== 'gate' && info.type !== 'measure' && info.type !== 'barrier') {
        setHighlightedLine(null);
        return;
      }
      const name = info.gateName || info.type;
      const qubitsStr = info.qubits?.join(',') || '';
      const key = `${info.momentIndex}:${name}:${qubitsStr}`;
      let line = lineMap.get(key);
      if (line == null) line = lineMap.get(`${info.momentIndex}:${name}:`);
      setHighlightedLine(line ?? null);
    },
    [lineMap, setHoveredMoment]
  );

  const handleSelectSample = useCallback(
    (path: string) => {
      const code = getSampleCode(path);
      if (code) {
        setCode(code);
        setActiveSamplePath(path);
        setShowSamples(false);
      }
    },
    [setCode]
  );

  const handleFileOpen = useCallback(
    (fileCode: string) => {
      setCode(fileCode);
      setShowSamples(false);
    },
    [setCode]
  );

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <img src="/logo.svg" alt="QuantumJS" className="w-4 h-4 object-contain" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            QuantumJS <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider text-slate-400">Bench</span>
          </h1>
          <button
            onClick={() => setShowSamples((v) => !v)}
            className={`h-6 ml-2 px-2 text-[10px] font-bold rounded transition-all flex items-center gap-1.5 ${
              showSamples
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Samples</span>
          </button>
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
            onClick={sim.run}
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
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content - Tight grid */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor (40%) */}
        <div className="w-[40%] flex flex-col border-r border-white/5 h-full">
          <div className="flex-1 overflow-hidden h-full">
            {showSamples ? (
              <SamplesPanel
                tree={sampleTree}
                activePath={activeSamplePath}
                onSelect={handleSelectSample}
                onClose={() => setShowSamples(false)}
                onFileOpen={handleFileOpen}
              />
            ) : (
              <EditorPanel
                code={sim.code}
                setCode={setCode}
                headerAction={
                  <div className="flex items-center gap-0.5">
                    <button onClick={actions.handleNewCode} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="New file">
                      <FilePlus size={12} />
                    </button>
                    <button onClick={actions.handleCopyCode} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Copy code">
                      <Copy size={12} />
                    </button>
                    <button onClick={actions.handleDownloadCode} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Download code">
                      <Download size={12} />
                    </button>
                  </div>
                }
              />
            )}
          </div>
          <ErrorDisplay error={error} />
        </div>

        {/* Right Side: Outputs (60%) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20 h-full">
          {/* Top Half: QASM & Results */}
          <div className="flex h-[40%] border-b border-white/5 flex-shrink-0">
            <div className="flex-1 border-r border-white/5 h-full">
              <QasmPanel
                qasm={qasm}
                highlightedLine={highlightedLine}
                headerAction={
                  <div className="flex items-center gap-0.5">
                    <button onClick={actions.handleCopyQasm} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Copy QASM">
                      <Copy size={12} />
                    </button>
                    <button onClick={actions.handleDownloadQasm} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Download QASM">
                      <Download size={12} />
                    </button>
                  </div>
                }
              />
            </div>
            <div className="w-64 h-full">
              <ResultsPanel
                results={prog.displayResults}
                isSimulating={isSimulating || prog.isProgressing}
                momentLabel={prog.momentLabel}
                headerAction={
                  prog.displayResults ? (
                    <div className="flex items-center gap-0.5">
                      <button onClick={actions.handleCopyResults} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Copy results CSV">
                        <Copy size={12} />
                      </button>
                      <button onClick={actions.handleDownloadResults} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Download results CSV">
                        <Download size={12} />
                      </button>
                    </div>
                  ) : undefined
                }
              />
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
