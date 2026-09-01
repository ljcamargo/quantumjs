"use client";

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Play, BookOpen, FolderOpen, Download, Copy, FilePlus } from 'lucide-react';

import { EditorPanel, QasmPanel, ResultsPanel, SamplesPanel, ErrorDisplay } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';
import type { VisualizerPanelHandle } from '../components/VisualizerPanel';
import { GitHubIcon } from '../components/icons';
import type { HoverInfo } from '@ljcamargo/quirkvis-react';
import { buildQasmLineMap } from '../lib/qasmLineMap';
import { buildSampleTree } from '../lib/sampleTree';
import { useQuantumPipeline } from '../hooks/useQuantumPipeline';
import { useFileActions } from '../hooks/useFileActions';
import sampleEntries, { getSampleCode } from '../sampleRegistry';
import { useMcpTool, useWebMCPStatus } from 'webmcp-react';
import { useDocsTools } from '../hooks/useDocsTools';

const sampleTree = buildSampleTree(sampleEntries);
const DEFAULT_CODE = getSampleCode('samples/qft_sugar.js')!;

export default function Playground() {

  // Compile + simulate + moment-cache pipeline, in one composed hook.
  const pipeline = useQuantumPipeline(DEFAULT_CODE);
  const {
    code, qasm3, probabilities, error, isRunning, autoRun, setAutoRun, setCode, run,
    focusedMoment, setFocusedMoment, isCachingMoments, displayResults, momentLabel,
    runWithMoment,
  } = pipeline;

  // Download / copy / new-file actions
  const actions = useFileActions(code, qasm3, probabilities, setCode);

  // UI state
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [activeSamplePath, setActiveSamplePath] = useState('samples/qft_sugar.js');
  const [showSamples, setShowSamples] = useState(false);

  const visualizerRef = useRef<VisualizerPanelHandle>(null);

  // Hover → QASM line + moment
  const lineMap = useMemo(() => buildQasmLineMap(qasm3), [qasm3]);
  const handleHover = useCallback(
    (info: HoverInfo) => {
      if (info.type === 'none') {
        setHighlightedLine(null);
        setFocusedMoment(null);
        return;
      }
      if (info.momentIndex >= 0) setFocusedMoment(info.momentIndex);
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
    [lineMap, setFocusedMoment]
  );

  const handleSelectSample = useCallback(
    (path: string) => {
      const sampleCode = getSampleCode(path);
      if (sampleCode) {
        setCode(sampleCode);
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

  // WebMCP
  const { available: webmcpAvailable } = useWebMCPStatus();
  const { execute: executeCompileTool } = useMcpTool({
    name: 'compile_simulate_draw',
    description: 'Compiles quantum code, triggers real-time simulation, and extracts the resulting math and layout structures. Use this tool anytime code is modified or debugged.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The raw quantum source code to run in the editor.',
        },
        momentum: {
          type: 'integer',
          description: 'Optional gate execution index to truncate simulation to a specific momentum (for step-by-step debugging/hover simulation). Omit or set to -1 for full circuit execution.',
        },
        includeSvg: {
          type: 'boolean',
          description: 'If true, also return the rendered circuit diagram as an SVG string. Omit or set to false to skip (faster, smaller response).',
        },
      },
      required: ['code'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { code: newCode, momentum, includeSvg } = args as {
        code: string;
        momentum?: number;
        includeSvg?: boolean;
      };
      const result = await runWithMoment(newCode, momentum);

      let svg: string | null = null;
      if (includeSvg && !result.error) {
        svg = (await visualizerRef.current?.waitForRender(result.qasm3)) ?? null;
      }
      return {
        content: [],
        structuredContent: {
          qasm: result.qasm2,
          probabilities: result.probabilities,
          moment: result.moment,
          error: result.error,
          ...(includeSvg ? { svg } : {}),
        },
      };
    },
  });
  useMcpTool({
    name: 'list_samples',
    description: 'List Sample Available',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    handler: async () => {
      return {
        content: [],
        structuredContent: {
          sampleEntries: sampleEntries
        },
      };
    },
  });
  useMcpTool({
    name: 'open_sample',
    description: 'Open a sample by path, loading its code into the editor. Optionally compiles and simulates it immediately.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The sample path, e.g. "samples/qft_simple.js" (matches a `path` from list_samples).',
        },
        execute: {
          type: 'boolean',
          description: 'If true, also compile and simulate the sample immediately after opening it (equivalent to calling compile_simulate_draw with this sample\'s code).',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { path, execute: shouldExecute } = args as { path: string; execute?: boolean };

      const sampleCode = getSampleCode(path);
      if (!sampleCode) {
        return {
          content: [],
          structuredContent: {
            path,
            error: `No sample found at path "${path}"`,
          },
        };
      }

      setCode(sampleCode);
      setActiveSamplePath(path);
      setShowSamples(false);

      if (!shouldExecute) {
        return {
          content: [],
          structuredContent: { path, code: sampleCode },
        };
      }

      const compileResult = await executeCompileTool({ code: sampleCode });

      return {
        content: [],
        structuredContent: {
          path,
          code: sampleCode,
          ...compileResult.structuredContent,
        },
      };
    },
  });
  useDocsTools();

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
          {/* WebMCP Logo */}
          {webmcpAvailable &&
            <div className="h-5 mx-4 flex gap-0.5">
              <span className="text-xs tracking-tight text-white flex items-center gap-1.5">
                WebMCP
              </span>
              <img src="/webmcp.svg" alt="QuantumJS" className="w-4 h-4 object-contain" />

            </div>
          }
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
            onClick={run}
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
                code={code}
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
                qasm={qasm3}
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
                results={displayResults}
                isSimulating={isRunning || isCachingMoments}
                momentLabel={momentLabel}
                headerAction={
                  displayResults ? (
                    <div className="flex items-center gap-0.5">
                      <button onClick={actions.handleCopyResults} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Copy probabilities CSV">
                        <Copy size={12} />
                      </button>
                      <button onClick={actions.handleDownloadResults} className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Download probabilities CSV">
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
            <VisualizerPanel ref={visualizerRef} qasm={qasm3} onHover={handleHover} />
          </div>
        </div>
      </main>
    </div>
  );
}
