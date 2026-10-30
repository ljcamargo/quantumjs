import React, { forwardRef, useImperativeHandle, useState, useRef, useCallback, useEffect } from 'react';
import { Panel, type PanelChromeProps } from './Panels';
import { Cpu, Maximize, ArrowLeftRight, ArrowUpDown, Search, Plus, Minus, Download, Copy } from 'lucide-react';
import { QuirkVis } from '@ljcamargo/quirkvis-react';
import type { HoverInfo } from '@ljcamargo/quirkvis-react';
import { themes } from '@ljcamargo/quirkvis-core';
import { downloadSvg, copyToClipboard, svgToString } from '../lib/download';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useI18n } from '../i18n';

export type VisualizerPanelHandle = {
  /** Returns the currently rendered SVG markup, or null if nothing is rendered yet. */
  getSvgString: () => string | null;
  /**
   * Resolves with the SVG markup once the visualizer has actually rendered
   * `qasm`. If the panel is already showing it, resolves immediately;
   * otherwise it waits for the next matching render (e.g. after a state
   * update triggered by an MCP tool call). Resolves with `null` if the
   * render hasn't happened within `timeoutMs`.
   */
  waitForRender: (qasm: string, timeoutMs?: number) => Promise<string | null>;
};

type VisualizerPanelProps = {
  qasm: string;
  onHover?: (info: HoverInfo) => void;
} & PanelChromeProps;

type FitMode = 'both' | 'width' | 'height' | 'none';

export const VisualizerPanel = forwardRef<VisualizerPanelHandle, VisualizerPanelProps>(
  ({ qasm, onHover, ...chrome }, ref) => {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    // Waiters keyed by the qasm they're waiting to see rendered.
    const pendingWaiters = useRef<Map<string, Array<(svg: string | null) => void>>>(new Map());

    const getSvgElement = useCallback((): SVGSVGElement | null => {
      const svg = svgContainerRef.current?.querySelector('svg');
      return svg ? (svg as SVGSVGElement) : null;
    }, []);

    const getSvgString = useCallback((): string | null => {
      const svg = getSvgElement();
      return svg ? svgToString(svg) : null;
    }, [getSvgElement]);

    // Fires after every commit where `qasm` changed. By the time this effect
    // runs, QuirkVis (a child) has already committed its own render/effects
    // for this qasm — React guarantees child effects run before parent
    // effects in the same commit — so the SVG in the DOM is current.
    useEffect(() => {
      const waiters = pendingWaiters.current.get(qasm);
      if (!waiters || waiters.length === 0) return;
      const svg = getSvgString();
      waiters.forEach((resolve) => resolve(svg));
      pendingWaiters.current.delete(qasm);
    }, [qasm, getSvgString]);

    const waitForRender = useCallback(
      (targetQasm: string, timeoutMs = 3000): Promise<string | null> => {
        if (qasm === targetQasm) {
          return Promise.resolve(getSvgString());
        }
        return new Promise((resolve) => {
          const list = pendingWaiters.current.get(targetQasm) ?? [];
          list.push(resolve);
          pendingWaiters.current.set(targetQasm, list);

          setTimeout(() => {
            const stillPending = pendingWaiters.current.get(targetQasm);
            if (!stillPending) return; // already resolved by the effect
            const idx = stillPending.indexOf(resolve);
            if (idx !== -1) stillPending.splice(idx, 1);
            if (stillPending.length === 0) pendingWaiters.current.delete(targetQasm);
            resolve(null); // timed out
          }, timeoutMs);
        });
      },
      [qasm, getSvgString]
    );

    useImperativeHandle(ref, () => ({ getSvgString, waitForRender }), [getSvgString, waitForRender]);

    const handleDownloadSvg = useCallback(() => {
      const svg = getSvgElement();
      if (svg) downloadSvg('circuit.svg', svg);
    }, [getSvgElement]);

    const handleCopySvg = useCallback(() => {
      const svg = getSvgElement();
      if (svg) copyToClipboard(svgToString(svg));
    }, [getSvgElement]);

    // Hover is pointer-only. On mobile the interaction is disabled entirely
    // (QuirkVis then skips its mouse handlers); touch affordances can be added
    // later without touching the desktop behaviour.
    const isDesktop = useIsDesktop();
    const { t } = useI18n();

    // Desktop keeps "fit both" as its default. Mobile defaults to "fit width"
    // so wide circuits stay readable and scroll vertically instead of shrinking
    // to fit a short panel. A user choice always wins over the default.
    const [selectedFit, setSelectedFit] = useState<FitMode | null>(null);
    const fitMode: FitMode = selectedFit ?? (isDesktop ? 'both' : 'width');
    const [zoom, setZoom] = useState(1);

    const headerAction = (
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopySvg}
          className="panel-icon-btn"
          title={t('action.copySvg')}
        >
          <Copy size={12} />
        </button>
        <button
          onClick={handleDownloadSvg}
          className="panel-icon-btn"
          title={t('action.downloadSvg')}
        >
          <Download size={12} />
        </button>
        {/* Fit/zoom controls are desktop-only for now: mobile uses fit-width. */}
        <div className="hidden items-center gap-1 lg:flex">
          <button
            onClick={() => setSelectedFit('both')}
            className={`p-1 rounded transition-colors ${fitMode === 'both' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={t('visualizer.fitBoth')}
          >
            <Maximize size={10} />
          </button>
          <button
            onClick={() => setSelectedFit('width')}
            className={`p-1 rounded transition-colors ${fitMode === 'width' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={t('visualizer.fitWidth')}
          >
            <ArrowLeftRight size={10} />
          </button>
          <button
            onClick={() => setSelectedFit('height')}
            className={`p-1 rounded transition-colors ${fitMode === 'height' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={t('visualizer.fitHeight')}
          >
            <ArrowUpDown size={10} />
          </button>
          <button
            onClick={() => setSelectedFit('none')}
            className={`p-1 rounded transition-colors ${fitMode === 'none' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={t('visualizer.manualZoom')}
          >
            <Search size={10} />
          </button>
          {fitMode === 'none' && (
            <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-1">
              <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} aria-label={t('visualizer.zoomOut')} title={t('visualizer.zoomOut')} className="text-slate-500 hover:text-slate-300 transition-colors"><Minus size={10} /></button>
              <span className="text-[8px] font-mono w-8 text-center text-slate-400">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => z + 0.1)} aria-label={t('visualizer.zoomIn')} title={t('visualizer.zoomIn')} className="text-slate-500 hover:text-slate-300 transition-colors"><Plus size={10} /></button>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Panel title={t('panel.circuit.title')} icon={<Cpu size={14} />} headerAction={headerAction} {...chrome}>
        <div ref={svgContainerRef} className="relative flex min-h-0 flex-1 overflow-auto bg-black/20 p-4">
          {qasm ? (
            <QuirkVis
              qasm={qasm}
              theme={themes.night}
              fitWidth={fitMode === 'both' || fitMode === 'width'}
              fitHeight={fitMode === 'both' || fitMode === 'height'}
              zoom={zoom}
              interactive={isDesktop}
              onHover={
                isDesktop
                  ? onHover || ((info) => console.log('QirkVis hover:', info))
                  : undefined
              }
              className={`${fitMode === 'none' ? '' : 'w-full'} m-auto`}
            />
          ) : (
            <div className="text-slate-700 text-[10px] font-mono">
              {t('state.waitingQasm')}
            </div>
          )}
        </div>
      </Panel>
    );
  }
);

VisualizerPanel.displayName = 'VisualizerPanel';
