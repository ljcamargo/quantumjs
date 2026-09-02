// components/WebMCPDialog.tsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useWebMCPStatus } from 'webmcp-react';

// Define proper types instead of 'any'
interface ToolProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: ToolProperty;
}

interface ToolInputSchema {
  type: string;
  properties?: Record<string, ToolProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

interface ToolInfo {
  name: string;
  description: string;
  inputSchema?: ToolInputSchema;
}

// Add this helper function near the top of the component
const sortTools = (tools: ToolInfo[]): ToolInfo[] => {
  return [...tools].sort((a, b) => {
    const getPriority = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('skill')) return 2; // Highest priority = goes to bottom
      if (lower.includes('doc')) return 1;
      return 0;
    };

    const aPriority = getPriority(a.name);
    const bPriority = getPriority(b.name);

    // If priorities differ, sort by priority (higher goes to bottom)
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name);
  });
};

// Example prompts based on your tools
const EXAMPLE_PROMPTS = [
  "Compile and simulate a quantum circuit with QFT",
  "List all available quantum samples",
  "Open the QFT sample and execute it",
  "Show me a circuit diagram for the current code",
  "Create a new document explaining quantum gates",
  "List my documents and summarize the recent ones"
];

export function WebMCPDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { available } = useWebMCPStatus();
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && available) {
      const fetchTools = async () => {
        setLoading(true);
        setError(null);
        try {
          if (typeof document !== 'undefined' && document.modelContext) {
            // @ts-expect-error - Model Context API may not be typed
            const result = await document.modelContext.getTools();
            let fetchedTools: ToolInfo[] = [];
            if (result && result.tools) {
              fetchedTools = result.tools;
            } else if (Array.isArray(result)) {
              fetchedTools = result;
            } else {
              throw new Error('Unexpected response format from getTools()');
            }
            // Sort tools with doc/skill keywords to the bottom
            setTools(sortTools(fetchedTools));
          } else {
            //  @ts-expect-error - Model Context API may not be typed
            if (window.modelContext) {
              //  @ts-expect-error - Model Context API may not be typed
              const result = await window.modelContext.getTools();
              let fetchedTools: ToolInfo[] = [];
              if (result && result.tools) {
                fetchedTools = result.tools;
              } else if (Array.isArray(result)) {
                fetchedTools = result;
              } else {
                throw new Error('Unexpected response format from getTools()');
              }
              // Sort tools with doc/skill keywords to the bottom
              setTools(sortTools(fetchedTools));
            } else {
              setTools([]);
            }
          }
        } catch (err) {
          console.error('Failed to fetch WebMCP tools:', err);
          setError('Could not load available tools. The Model Context API may not be available.');
          setTools([]);
        } finally {
          setLoading(false);
        }
      };
      fetchTools();
    }
  }, [isOpen, available]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <img src="/webmcp.svg" alt="QuantumJS" className="w-8 h-8 object-contain" />
              WebMCP Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Available tools that AI agents can discover and use
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="px-4 py-3 bg-cyan-950/20 border-b border-white/5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${available ? 'bg-green-400' : 'bg-slate-500'}`} />
            <span className="text-sm font-medium text-white">
              {available ? 'Tools available' : 'No tools available'}
            </span>
          </div>
        </div>

        {/* Tools List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-amber-400 bg-amber-950/20 p-4 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-sm">No tools registered</p>
              <p className="text-xs mt-2 text-slate-500">
                Tools will appear here once registered with WebMCP
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <CheckCircle className="w-4 h-4 text-cyan-400 mt-1. shrink-0" />
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono text-cyan-300 bg-cyan-950/30 rounded break-all">
                      {tool.name}
                    </code>
                    <p className="text-xs text-slate-300 mt-1">
                      {tool.description || 'No description provided'}
                    </p>
                    {tool.inputSchema && (
                      <details className="mt-2 text-xs text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-300">
                          View schema
                        </summary>
                        <pre className="mt-1 p-2 bg-black/30 rounded overflow-x-auto text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                          {(() => {
                            try {
                              // If inputSchema is a string, parse it first
                              const schemaObj = typeof tool.inputSchema === 'string'
                                ? JSON.parse(tool.inputSchema)
                                : tool.inputSchema;
                              return JSON.stringify(schemaObj, null, 2);
                            } catch {
                              // If parsing fails, just stringify as is
                              return JSON.stringify(tool.inputSchema, null, 2);
                            }
                          })()}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Example Prompts */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Try asking</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                className="text-xs text-left bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors border border-white/5 hover:border-white/10 w-full"
                onClick={() => {
                  navigator.clipboard?.writeText(prompt).catch(() => {});
                }}
              >
                  {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 text-center shrink-0">
          <p className="text-xs text-slate-500">
            Tools operate on this in-browser workspace. No data is synced to servers.
          </p>
        </div>
      </div>
    </div>
  );
}
