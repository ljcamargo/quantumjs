# Bench Changelog

## 0.9.1 — 2026-07-28

### Fixed

- **`U` gate compliance** — Universal gate now emits uppercase `U(theta, phi, lambda)`
  matching OpenQASM 3.0's `stdgates.inc`, fixing `MissingSemicolonError` in the
  qasm-ts parser used by quirkvis-core's `CircuitAnalyzer`.
- **CircuitAnalyzer error handling** — `buildQasmLineMap()` and
  `qasmProgressive.ts` utilities now wrap `analyze()` in try/catch, so parser
  failures degrade gracefully (no highlighting / no progressive mode) instead
  of crashing.
- **Dependencies** — `@ljcamargo/quirkvis-core` and `@ljcamargo/quirkvis-react`
  updated to `0.2.2`.

## 0.2.0 — 2026-07-27

### Added

#### Samples Explorer & File Operations
A full file-tree explorer panel for browsing and loading samples, plus
download/copy/new-file actions across all panels.

- **Samples Explorer** — Opens via the **Samples** button in the header.
  Hierarchical file tree with collapsible directories, file icons, and
  active-file highlighting. Replaces the editor panel (no layout squish).
- **Open file...** — Hidden `<input type="file">` lets users load local `.js`
  files into the editor via a file picker.
- **Download buttons** — Every panel now has a download icon in its header:
  `circuit.js` (editor), `circuit.qasm` (QASM), `results.csv` (probabilities),
  `circuit.svg` (visualizer).
- **Copy buttons** — Same locations, copies content to clipboard instead.
- **New file button** — Clears the editor (`FilePlus` icon in editor header).
- **Extension changed** — Sample files renamed from `.quantumjs` to `.js`.
  Raw-loader scoped to `src/samples/` via `include` in webpack config.
- **Barrel registry** — Samples registered in `src/sampleRegistry.ts` with
  virtual filesystem paths (e.g. `"samples/qft_sugar.js"`).

#### Interactive Circuit Visualization
The circuit diagram is now interactive — hover over any gate, barrier, or
measurement to see visual highlighting in the SVG.

- **QASM Line Highlighting** — Hovering a gate in the visualizer highlights
  the corresponding line in the generated QASM panel with a cyan background
  and left border accent. The panel auto-scrolls to bring the highlighted line
  into view.
- **Interactive Mode** — Gate shapes brighten and moment columns tint when
  hovered, providing visual feedback about the circuit's structure.

Dependencies updated to `@ljcamargo/quirkvis-core@0.2.0` and
`@ljcamargo/quirkvis-react@0.2.0`.

#### Progressive Circuit Run
After the full simulation completes, the bench pre-computes probability
distributions at each moment in the circuit. Hovering over a moment shows the
intermediate state, enabling a "circuit evolution" visualization.

- **Moment-by-moment simulation** — Each prefix of the circuit (moment 0, 0–1,
  0–2, ..., full) is simulated independently with measurements appended.
- **Background pre-computation** — Runs asynchronously after the main simulation,
  yielding to the event loop between moments to keep the UI responsive.
- **Results panel badge** — Shows `"Moment N / M"` when viewing intermediate results.
- **Complexity guard** — Automatically disabled for circuits with >8 qubits or
  >30 moments to prevent excessive simulation time.
- **Graceful error handling** — Failed moment simulations are caught and logged
  as warnings; they never interrupt the user experience.

### Changed

- `VisualizerPanel` now accepts an optional `onHover` callback prop (was
  hard-coded to `console.log`).
- `QasmPanel` refactored from a single `<pre>` blob to individually wrapped
  lines, enabling per-line highlighting.
- `ResultsPanel` now accepts `momentLabel` and `headerAction` props.
- `EditorPanel` now accepts `headerAction` prop; title changed from
  `"DSL Input"` to `"QuantumJS Editor"`.
- Sample extension changed from `.quantumjs` to `.js` (regular JavaScript,
  not a custom dialect).

### Under the Hood

- New utility: `src/lib/qasmLineMap.ts` — builds a `moment:gate:qubits` → line
  number map via `CircuitAnalyzer` from quirkvis-core.
- New utility: `src/lib/qasmProgressive.ts` — handles QASM truncation at moment
  boundaries and orchestrates background simulation caching.
- New utility: `src/lib/download.ts` — shared download, copy, and CSV helpers.
- New file: `src/sampleRegistry.ts` — barrel registry for sample files with
  virtual filesystem paths.
- Webpack raw-loader scoped to `src/samples/` directory via `include`.
- Removed `src/lib/FileTree.ts` — tree building moved inline in page.tsx.
