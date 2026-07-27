# Bench Changelog

## 0.2.0 — 2026-07-27

### Added

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
- `ResultsPanel` now accepts a `momentLabel` prop to display the current moment
  context during hover.

### Under the Hood

- New utility: `src/lib/qasmLineMap.ts` — builds a `moment:gate:qubits` → line
  number map via `CircuitAnalyzer` from quirkvis-core.
- New utility: `src/lib/qasmProgressive.ts` — handles QASM truncation at moment
  boundaries and orchestrates background simulation caching.
