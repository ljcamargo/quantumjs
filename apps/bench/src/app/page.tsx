"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Play, RotateCw, BookOpen, FolderOpen, Download, Copy, FilePlus } from 'lucide-react';

import { EditorPanel, QasmPanel, ResultsPanel, SamplesPanel } from '../components/Panels';
import { VisualizerPanel } from '../components/VisualizerPanel';
import type { VisualizerPanelHandle } from '../components/VisualizerPanel';
import { GitHubIcon } from '../components/icons';
import { HeaderMenu } from '../components/HeaderMenu';
import type { HoverInfo } from '@ljcamargo/quirkvis-react';
import { buildQasmLineMap } from '../lib/qasmLineMap';
import { buildSampleTree } from '../lib/sampleTree';
import { useQuantumPipeline } from '../hooks/useQuantumPipeline';
import { useFileActions } from '../hooks/useFileActions';
import sampleEntries, { getSampleCode } from '../sampleRegistry';
import { useMcpTool, useWebMCPStatus } from 'webmcp-react';
import { useDocsTools } from '../hooks/useDocsTools';
import { useMobilePanels, type PanelId } from '../hooks/useMobilePanels';
import { WebMCPDialog } from '../components/WebMCPDialog';

const sampleTree = buildSampleTree(sampleEntries);
const DEFAULT_CODE = getSampleCode('samples/qft_sugar.js')!;

export default function Playground() {

  // Compile + simulate + moment-cache pipeline, in one composed hook.
  const pipeline = useQuantumPipeline(DEFAULT_CODE);
  const {
    code, qasm3, probabilities, error, isRunning, autoRun, setAutoRun, setCode, run,
    setFocusedMoment, isCachingMoments, displayResults, momentLabel,
    runWithMoment,
  } = pipeline;

  // Download / copy / new-file actions
  const actions = useFileActions(code, qasm3, probabilities, setCode);

  // UI state
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [activeSamplePath, setActiveSamplePath] = useState('samples/qft_sugar.js');
  const [showSamples, setShowSamples] = useState(false);
  const [showWebMCPDialog, setShowWebMCPDialog] = useState(false);
  const [webMCPVisible, setWebMCPVisible] = useState(false);

  // Mobile panel stack. On desktop the state is inert: `.bench-main` is a grid
  // and Panel forces every body visible, so the console layout is unchanged.
  const { openCount, isOpen, toggle, focus } = useMobilePanels();
  const panelChrome = (id: PanelId, extraClass = '') => ({
    id,
    collapsed: !isOpen(id),
    className: `${isOpen(id) ? 'bench-panel-open' : 'bench-panel-closed'} ${extraClass}`,
    onToggle: () => toggle(id),
    onFocus: () => focus(id),
  });

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
  const { available: webMcpAvailable } = useWebMCPStatus();
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

  useEffect(() => {
    if (webMcpAvailable) {
      const timer = setTimeout(() => {
        setWebMCPVisible(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [webMcpAvailable]);

  return (
    <div className="bench-shell flex flex-col bg-[#0a0a0c] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="relative z-40 lg:z-auto h-12 lg:h-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between gap-2 pl-3 pr-4 lg:px-4 flex-shrink-0">
        <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
          {/* The logo SVG is a glyph inside a full-bleed circle; on mobile the
           * glyph is scaled up and circularly clipped so the mark reads bigger
           * without growing the header. Desktop keeps the original sizing. */}
          <div className="w-5 h-5 lg:w-4 lg:h-4 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-full">
            <img
              src="/logo.svg"
              alt="QuantumJS"
              className="w-full h-full object-cover scale-[1.35] lg:scale-100"
            />
          </div>
          <span className="lg:hidden text-sm font-bold tracking-tight text-white">Bench</span>
          <h1 className="hidden lg:flex text-sm font-bold tracking-tight text-white items-center gap-1.5">
            QuantumJS <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider text-slate-400">Bench</span>
          </h1>
          <button
            onClick={() => setShowSamples((v) => !v)}
            aria-label={showSamples ? 'Close samples' : 'Open samples'}
            aria-expanded={showSamples}
            className={`h-9 w-9 lg:h-6 lg:w-auto ml-2 lg:ml-2 px-0 lg:px-2 text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              showSamples
                ? 'text-cyan-400 lg:bg-cyan-600 lg:text-white'
                : 'text-slate-400 hover:text-slate-200 lg:bg-slate-800 lg:text-slate-400 lg:hover:bg-slate-700'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
            <span className="hidden lg:inline">Samples</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* WebMCP is desktop-only: it is not part of the mobile experience. */}
          {webMcpAvailable &&
            <button
              onClick={() => setShowWebMCPDialog(true)}
              className={`
                max-lg:hidden h-5 mx-4 flex gap-0.5 hover:opacity-80 transition-opacity cursor-pointer relative items-center
                ${webMCPVisible ? 'opacity-100 ease-[cubic-bezier(0.15,0.85,0.45,1)]' : 'opacity-0 ease-[cubic-bezier(0.55,0,1,0.45)]'}
                transition-opacity duration-2500
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
              <span className="text-xs tracking-tight text-white flex items-center gap-1.5">
                WebMCP
              </span>
              <img src="/webmcp.svg" alt="QuantumJS" className="w-4 h-4 object-contain" />
            </button>
          }
          {/* Autorun Toggle (desktop; mobile lives in the gear menu) */}
          <label className="max-lg:hidden flex items-center gap-2 cursor-pointer select-none">
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
            aria-label={autoRun ? 'Rerun circuit' : 'Run circuit'}
            title={autoRun ? 'Rerun circuit' : 'Run circuit'}
            className="h-9 w-9 lg:h-7 lg:w-auto px-0 lg:px-3 bg-transparent lg:bg-cyan-600 hover:text-cyan-400 lg:hover:bg-cyan-500 lg:hover:text-white text-slate-400 lg:text-white text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            {autoRun ? (
              <RotateCw className="w-4 h-4 lg:hidden" />
            ) : (
              <Play className="w-4 h-4 lg:hidden" />
            )}
            <Play className="hidden lg:block w-3 h-3 fill-current" />
            <span className="hidden lg:inline">{autoRun ? 'RERUN' : 'RUN'}</span>
          </button>

          <a
            href="https://quantumjsdocs.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex h-7 ml-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded transition-all items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3" />
            Docs
          </a>
          <a
            href="https://github.com/ljcamargo/quantumjs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex h-7 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded transition-all items-center gap-1.5"
          >
            <GitHubIcon />
            GitHub
          </a>

          <HeaderMenu autoRun={autoRun} setAutoRun={setAutoRun} />
        </div>
      </header>

      {/* Main content: mobile vertical panel stack / desktop console grid */}
      <main className="bench-main flex-1">
        <EditorPanel
          {...panelChrome(
            'editor',
            `bench-area-editor lg:border-r lg:border-white/5 ${showSamples ? 'hidden' : ''}`
          )}
          code={code}
          setCode={setCode}
          error={error}
          headerAction={
            <div className="flex items-center gap-0.5">
              <button onClick={actions.handleNewCode} className="panel-icon-btn" title="New file">
                <FilePlus size={12} />
              </button>
              <button onClick={actions.handleCopyCode} className="panel-icon-btn" title="Copy code">
                <Copy size={12} />
              </button>
              <button onClick={actions.handleDownloadCode} className="panel-icon-btn" title="Download code">
                <Download size={12} />
              </button>
            </div>
          }
        />

        {/* DOM order below is the mobile stack order: Code, QASM, Circuit,
            Results. The desktop grid places them via grid-area, so both
            arrangements share one mounted component tree. */}
        <QasmPanel
          {...panelChrome('qasm', 'bench-area-qasm lg:border-b lg:border-white/5')}
          qasm={qasm3}
          highlightedLine={highlightedLine}
          headerAction={
            <div className="flex items-center gap-0.5">
              <button onClick={actions.handleCopyQasm} className="panel-icon-btn" title="Copy QASM">
                <Copy size={12} />
              </button>
              <button onClick={actions.handleDownloadQasm} className="panel-icon-btn" title="Download QASM">
                <Download size={12} />
              </button>
            </div>
          }
        />

        <VisualizerPanel
          {...panelChrome('circuit', 'bench-area-circuit')}
          ref={visualizerRef}
          qasm={qasm3}
          onHover={handleHover}
        />

        <ResultsPanel
          {...panelChrome('results', 'bench-area-results lg:border-b lg:border-white/5')}
          results={displayResults}
          isSimulating={isRunning || isCachingMoments}
          momentLabel={momentLabel}
          headerAction={
            displayResults ? (
              <div className="flex items-center gap-0.5">
                <button onClick={actions.handleCopyResults} className="panel-icon-btn" title="Copy probabilities CSV">
                  <Copy size={12} />
                </button>
                <button onClick={actions.handleDownloadResults} className="panel-icon-btn" title="Download probabilities CSV">
                  <Download size={12} />
                </button>
              </div>
            ) : undefined
          }
        />

        {!showSamples && openCount === 0 && (
          <div className="lg:hidden flex flex-1 items-center justify-center px-6 text-center text-[11px] text-slate-600">
            Tap a panel header to open it.
          </div>
        )}

        {/* Explorer: desktop replaces the editor slot; mobile is a full-screen
            sheet over the stack. Same component, no duplicate mounting. */}
        <SamplesPanel
          id="explorer"
          className={`bench-area-editor ${
            showSamples ? 'max-lg:fixed max-lg:inset-0 max-lg:z-50' : 'hidden'
          }`}
          tree={sampleTree}
          activePath={activeSamplePath}
          onSelect={handleSelectSample}
          onClose={() => setShowSamples(false)}
          onFileOpen={handleFileOpen}
        />
      </main>
      {/* WebMCP Dialog (desktop-only; hidden with the trigger on mobile) */}
      <div className="max-lg:hidden">
        <WebMCPDialog
          isOpen={showWebMCPDialog}
          onClose={() => setShowWebMCPDialog(false)}
        />
      </div>
    </div>
  );
}
