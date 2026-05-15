import React from 'react';
import { Panel } from './Panels';
import { Cpu } from 'lucide-react';
import { QuirkVis } from '@ljcamargo/quirkvis-react';
import { themes } from '@ljcamargo/quirkvis-core';

export const VisualizerPanel = ({ qasm }: { qasm: string }) => {
  return (
    <Panel title="Circuit Visualizer" icon={<Cpu size={14} />} className="min-h-[200px]">
      <div className="p-4 flex items-center justify-center min-h-[150px] bg-black/20">
        {qasm ? (
          <QuirkVis 
            qasm={qasm} 
            theme={themes.night} 
            fit={true}
            className="w-full max-w-full"
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
