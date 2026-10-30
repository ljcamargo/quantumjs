/**
 * English is the source of truth for message keys.
 * Add a key here first; `es.ts` is typed from this object, so a missing
 * Spanish translation is a TypeScript error.
 */
export const en = {
  // Language switcher
  'language.label': 'Language',
  'language.auto': 'Auto',

  // Header
  'header.samples': 'Samples',
  'header.samples.open': 'Open samples',
  'header.samples.close': 'Close samples',
  'header.newFile': 'New file',
  'header.autorun': 'Autorun',
  'header.run': 'RUN',
  'header.rerun': 'RERUN',
  'header.runAria': 'Run circuit',
  'header.rerunAria': 'Rerun circuit',
  'header.docs': 'Docs',
  'header.github': 'GitHub',
  'header.settings': 'Settings and links',

  // Panel titles
  'panel.editor.title': 'QuantumJS Editor',
  'panel.qasm.title': 'Generated QASM 3.0',
  'panel.results.title': 'Probabilities',
  'panel.results.titleWithMoment': 'Probabilities — {moment}',
  'panel.circuit.title': 'Circuit Visualizer',
  'panel.explorer.title': 'Explorer',
  'panel.explorer.close': 'Close explorer',
  'panel.focus': 'Focus panel',

  // Results / moments
  'results.moment': 'Moment {current} / {total}',
  'results.simulating': 'Simulating...',
  'results.runToSee': 'Run to see results',

  // States / empty views
  'state.waitingQasm': 'Waiting for QASM...',
  'state.openFile': 'Open file...',
  'state.noSamples': 'No samples found',
  'state.tapPanel': 'Tap a panel header to open it.',

  // Content actions
  'action.copyCode': 'Copy code',
  'action.downloadCode': 'Download code',
  'action.copyQasm': 'Copy QASM',
  'action.downloadQasm': 'Download QASM',
  'action.copyResults': 'Copy probabilities CSV',
  'action.downloadResults': 'Download probabilities CSV',
  'action.copySvg': 'Copy SVG',
  'action.downloadSvg': 'Download SVG',

  // Visualizer fit/zoom
  'visualizer.fitBoth': 'Fit Both',
  'visualizer.fitWidth': 'Fit Width',
  'visualizer.fitHeight': 'Fit Height',
  'visualizer.manualZoom': 'Manual Zoom',
  'visualizer.zoomIn': 'Zoom in',
  'visualizer.zoomOut': 'Zoom out',

  // WebMCP dialog (UI chrome only; tool names/descriptions stay as provided)
  'webmcp.title': 'WebMCP Tools',
  'webmcp.close': 'Close',
  'webmcp.subtitle': 'Available tools that AI agents can discover and use',
  'webmcp.available': 'Tools available',
  'webmcp.unavailable': 'No tools available',
  'webmcp.noneRegistered': 'No tools registered',
  'webmcp.noneRegisteredHint':
    'Tools will appear here once registered with WebMCP',
  'webmcp.noDescription': 'No description provided',
  'webmcp.viewSchema': 'View schema',
  'webmcp.tryAsking': 'Try asking',
  'webmcp.footer':
    'Tools operate on this in-browser workspace. No data is synced to servers.',
  'webmcp.loadError':
    'Could not load available tools. The Model Context API may not be available.',

  // WebMCP example prompts
  'webmcp.prompt.qft': 'Compile and simulate a quantum circuit with QFT',
  'webmcp.prompt.listSamples': 'List all available quantum samples',
  'webmcp.prompt.openQft': 'Open the QFT sample and execute it',
  'webmcp.prompt.diagram': 'Show me a circuit diagram for the current code',
  'webmcp.prompt.createDoc': 'Create a new document explaining quantum gates',
  'webmcp.prompt.listDocs': 'List my documents and summarize the recent ones',

  // Bench-originated errors
  'error.mustReturnCircuit':
    "Code must return a Quantum.Circuit object (e.g., 'return c;')",
  'error.simulation': 'Simulation Error:',
} as const;

export type MessageKey = keyof typeof en;
