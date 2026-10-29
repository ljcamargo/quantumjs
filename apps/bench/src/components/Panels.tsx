import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { Terminal, Layers, Code, Info, FileCode, FolderOpen, Folder, ChevronRight, ChevronDown, Maximize2 } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface PanelProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  badge?: React.ReactNode;
  /** Mobile only: body hidden when true. Desktop always shows the body. */
  collapsed?: boolean;
  /** Mobile only: header tap toggles expansion. */
  onToggle?: () => void;
  /** Mobile only: expand this panel to the full stack height. */
  onFocus?: () => void;
}

export type PanelChromeProps = Pick<
  PanelProps,
  'id' | 'className' | 'badge' | 'collapsed' | 'onToggle' | 'onFocus'
>;

export const Panel: React.FC<PanelProps> = ({
  id,
  title,
  icon,
  children,
  className = '',
  headerAction,
  badge,
  collapsed = false,
  onToggle,
  onFocus,
}) => {
  const contentId = `panel-content-${id}`;
  // Mobile-only collapse semantics. On desktop the body is always visible, so
  // the header must not advertise a toggle (or react to Enter).
  const isDesktop = useIsDesktop();
  const canToggle = !isDesktop && Boolean(onToggle);

  return (
    <div className={`bench-panel flex flex-col bg-[#111114] border border-white/5 shadow-2xl ${className}`}>
      <div className="min-h-10 lg:min-h-0 px-2 lg:px-3 py-0 lg:py-1.5 border-b border-white/5 flex items-center justify-between gap-1.5 bg-black/40 flex-shrink-0">
        <button
          type="button"
          onClick={canToggle ? onToggle : undefined}
          tabIndex={canToggle ? undefined : -1}
          aria-expanded={canToggle ? !collapsed : undefined}
          aria-controls={canToggle ? contentId : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 lg:py-0 text-left text-slate-400 lg:pointer-events-none lg:cursor-default"
        >
          <span className="text-slate-500 flex-shrink-0">{icon}</span>
          <span className="truncate text-[10px] font-bold uppercase tracking-widest">{title}</span>
          {badge}
          {onToggle && (
            <ChevronDown
              size={14}
              className={`ml-auto flex-shrink-0 text-slate-600 transition-transform lg:hidden ${
                collapsed ? '-rotate-90' : ''
              }`}
            />
          )}
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onFocus && (
            <button
              type="button"
              onClick={onFocus}
              aria-label={`Focus ${title} panel`}
              title="Focus panel"
              className="panel-icon-btn lg:hidden"
            >
              <Maximize2 size={12} />
            </button>
          )}
          {headerAction}
        </div>
      </div>
      {/* Exactly one scroll region lives inside each panel body, never here. */}
      <div
        id={contentId}
        className={`flex flex-1 flex-col min-h-0 overflow-hidden ${
          collapsed ? 'hidden lg:flex' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export const EditorPanel = ({
  code,
  setCode,
  headerAction,
  error,
  ...chrome
}: {
  code: string;
  setCode: (c: string) => void;
  headerAction?: React.ReactNode;
  error?: string | null;
} & PanelChromeProps) => (
  <Panel
    title="QuantumJS Editor"
    icon={<Code size={14} />}
    headerAction={headerAction}
    {...chrome}
    badge={
      error ? (
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
      ) : (
        chrome.badge
      )
    }
  >
    <div className="npm-editor min-h-0 flex-1 overflow-auto">
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
    <ErrorDisplay error={error ?? null} />
  </Panel>
);

export const QasmPanel = ({ qasm, highlightedLine, headerAction, ...chrome }: { qasm: string; highlightedLine?: number | null; headerAction?: React.ReactNode } & PanelChromeProps) => {
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
    <Panel title="Generated QASM 3.0" icon={<Terminal size={14} />} headerAction={headerAction} {...chrome}>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto p-4">
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

export const ResultsPanel = ({ results, isSimulating, momentLabel, headerAction, ...chrome }: { results: any, isSimulating: boolean; momentLabel?: string; headerAction?: React.ReactNode } & PanelChromeProps) => {
  const panelTitle = momentLabel ? `Probabilities — ${momentLabel}` : 'Probabilities';
  return (
    <Panel title={panelTitle} icon={<Layers size={14} />} headerAction={headerAction} {...chrome}>
      <div className="min-h-0 flex-1 overflow-auto p-4">
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

// ─── File tree node component (recursive) ─────────────────────────────────

const TreeNode = ({
  node,
  depth,
  activePath,
  expandedDirs,
  onToggle,
  onSelect,
}: {
  node: { name: string; path: string; type: 'file' | 'directory'; children?: any[] };
  depth: number;
  activePath: string | null;
  expandedDirs: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}) => {
  const isDir = node.type === 'directory';
  const isExpanded = expandedDirs.has(node.path);
  const isActive = !isDir && node.path === activePath;

  return (
    <li>
      <button
        onClick={() => (isDir ? onToggle(node.path) : onSelect(node.path))}
        className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded transition-colors ${
          isActive
            ? 'bg-cyan-500/15 text-cyan-300'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {isDir ? (
          <>
            <span className="flex-shrink-0 w-3.5 flex justify-center">
              {isExpanded ? (
                <ChevronDown size={10} className="text-slate-500" />
              ) : (
                <ChevronRight size={10} className="text-slate-500" />
              )}
            </span>
            <Folder
              size={13}
              className={`flex-shrink-0 ${
                isExpanded ? 'text-cyan-500' : 'text-slate-500'
              }`}
            />
          </>
        ) : (
          <>
            <span className="flex-shrink-0 w-3.5" />
            <FileCode
              size={13}
              className={`flex-shrink-0 ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            />
          </>
        )}
        <span className="text-[13px] font-medium truncate">{node.name}</span>
      </button>

      {isDir && isExpanded && node.children && (
        <ul className="list-none m-0 p-0">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              expandedDirs={expandedDirs}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const SamplesPanel = ({
  tree,
  activePath,
  onSelect,
  onClose,
  onFileOpen,
  ...chrome
}: {
  tree: { name: string; path: string; type: 'file' | 'directory'; children?: any[] };
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: () => void;
  onFileOpen?: (code: string, filename: string) => void;
} & PanelChromeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onFileOpen) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        onFileOpen(content, file.name);
      };
      reader.readAsText(file);
      // Reset so the same file can be picked again
      e.target.value = '';
    },
    [onFileOpen]
  );
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => {
    // Root expanded by default; show samples/ contents directly
    const dirs = new Set<string>();
    if (tree.children) {
      for (const child of tree.children) {
        if (child.type === 'directory') dirs.add(child.path);
      }
    }
    return dirs;
  });

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return (
    <Panel
      title="Explorer"
      icon={<FolderOpen size={14} />}
      headerAction={
        <button
          onClick={onClose}
          className="panel-icon-btn"
          title="Close explorer"
        >
          <span className="text-[10px] font-bold">✕</span>
        </button>
      }
      {...chrome}
    >
      <div className="min-h-0 flex-1 overflow-auto text-[12px]">
        {tree.children && tree.children.length > 0 ? (
          <ul className="list-none m-0 p-0">
            {tree.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={0}
                activePath={activePath}
                expandedDirs={expandedDirs}
                onToggle={toggleDir}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center text-slate-600 text-[10px]">
            No samples found
          </div>
        )}
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".js"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Open local file action */}
        <div className="border-t border-white/5 mt-2 pt-2 px-3">
          <button
            onClick={onFileOpen ? handleFilePick : undefined}
            className={`w-full text-left py-1.5 px-2 rounded flex items-center gap-2 ${
              onFileOpen
                ? 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <FolderOpen size={13} />
            <span className="text-[10px]">Open file...</span>
          </button>
        </div>
      </div>
    </Panel>
  );
};

export const ErrorDisplay = ({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <div className="bg-red-500/10 border-t border-red-500/20 p-2 flex gap-2 text-red-400 text-[10px] font-mono overflow-auto max-h-24 lg:max-h-32 flex-shrink-0">
      <Info size={12} className="flex-shrink-0 mt-0.5" />
      <pre className="whitespace-pre-wrap">{error}</pre>
    </div>
  );
};
