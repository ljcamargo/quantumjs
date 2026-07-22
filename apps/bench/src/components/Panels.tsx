import React, { useRef, useMemo, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { Terminal, Layers, Cpu, Code, Info } from 'lucide-react';

interface PanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, icon, children, className = "", headerAction }) => (
  <div className={`flex flex-col bg-[#111114] border border-white/5 shadow-2xl h-full ${className}`}>
    <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between bg-black/40 flex-shrink-0">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-slate-500">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      {headerAction}
    </div>
    <div className="flex-1 overflow-auto min-h-0">
      {children}
    </div>
  </div>
);

export const EditorPanel = ({ code, setCode }: { code: string, setCode: (c: string) => void }) => (
  <Panel title="DSL Input" icon={<Code size={14} />}>
    <div className="npm-editor h-full overflow-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        .npm-editor textarea { outline: none !important; }
        .npm-editor pre { pointer-events: none; }
        /* Enable both horizontal and vertical scrolling */
        .npm-editor textarea, .npm-editor pre {
          white-space: pre !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
        }
        /* Force the inner react-simple-code-editor to expand to fit the longest line */
        .npm-editor > div {
          width: max-content !important;
          min-width: 100%;
          min-height: 100%;
        }
      `}} />
      <Editor
        value={code}
        onValueChange={setCode}
        highlight={code => highlight(code, languages.javascript, 'javascript')}
        padding={10}
        style={{
          fontFamily: '"Geist Mono", "Fira code", "Fira Mono", monospace',
          fontSize: 14,
        }}
      />
    </div>
  </Panel>
);

export const QasmPanel = ({ qasm, highlightedLine }: { qasm: string; highlightedLine?: number | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const highlightedHtml = useMemo(
    () => (qasm ? highlight(qasm, languages.clike, 'clike') : ''),
    [qasm]
  );

  const lines = useMemo(() => {
    if (!highlightedHtml) return [];
    // Prism preserves newlines in the output, so we can split safely
    return highlightedHtml.split('\n');
  }, [highlightedHtml]);

  // Scroll to highlighted line when it changes
  useEffect(() => {
    if (highlightedLine != null && containerRef.current) {
      const target = containerRef.current.querySelector(
        `[data-line="${highlightedLine}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedLine]);

  return (
    <Panel title="Generated QASM 3.0" icon={<Terminal size={14} />}>
      <div ref={containerRef} className="p-4 h-full overflow-auto">
        <pre className="text-[13px] font-mono text-cyan-500/80 whitespace-pre">
          {lines.length === 0 ? (
            <span className="text-slate-700">Waiting for QASM...</span>
          ) : (
            lines.map((lineHtml: string, i: number) => {
              const lineNum = i + 1;
              const isHighlighted = highlightedLine === lineNum;
              return (
                <div
                  key={i}
                  data-line={lineNum}
                  className={`${
                    isHighlighted
                      ? 'bg-cyan-500/10 border-l-2 border-cyan-400 pl-2 -ml-3'
                      : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: lineHtml || '\u00A0' }}
                />
              );
            })
          )}
        </pre>
      </div>
    </Panel>
  );
};

export const ResultsPanel = ({ results, isSimulating, momentLabel }: { results: any, isSimulating: boolean; momentLabel?: string }) => {
  const panelTitle = momentLabel ? `Probabilities — ${momentLabel}` : 'Probabilities';
  return (
    <Panel title={panelTitle} icon={<Layers size={14} />}>
      <div className="p-4 h-full overflow-auto">
        {isSimulating ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-[10px] font-medium">Simulating...</p>
          </div>
        ) : results ? (
          <div className="space-y-3">
            {Object.entries(results as Record<string, number>).map(([state, prob]) => (
              <div key={state} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-cyan-400">|{state}⟩</span>
                  <span className="text-slate-500">{(prob * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-500"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-mono text-center">
            Run to see results
          </div>
        )}
      </div>
    </Panel>
  );
};

export const ErrorDisplay = ({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <div className="bg-red-500/10 border-t border-red-500/20 p-2 flex gap-2 text-red-400 text-[10px] font-mono overflow-auto max-h-32">
      <Info size={12} className="flex-shrink-0 mt-0.5" />
      <pre className="whitespace-pre-wrap">{error}</pre>
    </div>
  );
};
