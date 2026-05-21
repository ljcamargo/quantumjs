import React, { useState } from 'react';
import { Panel } from './Panels';
import { Cpu, Maximize, ArrowLeftRight, ArrowUpDown, Search, Plus, Minus } from 'lucide-react';
import { QuirkVis } from '@ljcamargo/quirkvis-react';
import { themes } from '@ljcamargo/quirkvis-core';

export const VisualizerPanel = ({ qasm }: { qasm: string }) => {
  const [fitMode, setFitMode] = useState<'both' | 'width' | 'height' | 'none'>('both');
  const [zoom, setZoom] = useState(1);

  const headerAction = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setFitMode('both')}
        className={`p-1 rounded transition-colors ${fitMode === 'both' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        title="Fit Both"
      >
        <Maximize size={10} />
      </button>
      <button
        onClick={() => setFitMode('width')}
        className={`p-1 rounded transition-colors ${fitMode === 'width' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        title="Fit Width"
      >
        <ArrowLeftRight size={10} />
      </button>
      <button
        onClick={() => setFitMode('height')}
        className={`p-1 rounded transition-colors ${fitMode === 'height' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        title="Fit Height"
      >
        <ArrowUpDown size={10} />
      </button>
      <button
        onClick={() => setFitMode('none')}
        className={`p-1 rounded transition-colors ${fitMode === 'none' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
        title="Manual Zoom"
      >
        <Search size={10} />
      </button>
      {fitMode === 'none' && (
        <div className="flex items-center gap-1 ml-1 border-l border-white/10 pl-1">
          <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-slate-500 hover:text-slate-300 transition-colors"><Minus size={10} /></button>
          <span className="text-[8px] font-mono w-8 text-center text-slate-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => z + 0.1)} className="text-slate-500 hover:text-slate-300 transition-colors"><Plus size={10} /></button>
        </div>
      )}
    </div>
  );

  return (
    <Panel title="Circuit Visualizer" icon={<Cpu size={14} />} className="h-full" headerAction={headerAction}>
      <div className="flex-1 flex items-center justify-center bg-black/20 overflow-auto p-4 relative h-full min-h-[150px]">
        {qasm ? (
          <QuirkVis
            qasm={qasm}
            theme={themes.night}
            fitWidth={fitMode === 'both' || fitMode === 'width'}
            fitHeight={fitMode === 'both' || fitMode === 'height'}
            zoom={zoom}
            className={`${fitMode === 'none' ? '' : 'w-full h-full'} flex items-center justify-center`}
          />
        ) : (
          <div className="text-slate-700 text-[10px] font-mono">
            Waiting for QASM...
          </div>
        )}
      </div>
    </Panel>
  );
};
