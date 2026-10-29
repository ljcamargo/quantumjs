# Bench Implementation Memoirs

Architecture decisions, algorithms, and edge-case reasoning for `apps/bench`.
This file is the app-scoped counterpart of the monorepo `/MEMOIRS.md`.

Convention: one entry per non-trivial feature/change, newest first or grouped
by feature. Include **date**, **packages affected**, **problem**,
**architecture**, and **edge cases** — the goal is that a future contributor
never has to rediscover *why* something is the way it is.

Related documents:

- `apps/bench/AGENTS.md` — fast orientation for agents (structure, invariants).
- `apps/bench/CHANGELOG.md` — user-visible changes.
- `apps/documentation/docs/bench/bench.mdx` — public Bench docs.
- `/MEMOIRS.md` — monorepo index + library (`packages/quantumjs`) memoirs.

---

## Agent Docs Split & Responsiveness Baseline

**Date:** 2026-10-29
**Packages affected:** `apps/bench` (docs only)

### Problem

`apps/bench/AGENTS.md` only contained the Next.js "this is not the Next.js you
know" banner, so agents had to rediscover the whole app structure, data flow,
and undocumented invariants by reading ~2.4k lines of source. Bench-specific
memoirs were mixed into the root `MEMOIRS.md` alongside library entries.

### Change

- `apps/bench/AGENTS.md` is now a real orientation guide: directory map, data
  flow, state ownership, panel map, feature invariants, gotchas, task→file
  table, and verification checklist.
- Bench memoirs (interactive visualizer, progressive run, night theme, samples
  explorer, file operations) moved here from `/MEMOIRS.md`.
- `/MEMOIRS.md` now keeps the monorepo index + `packages/quantumjs` entries.
- Convention from now on: **app-scoped memoirs live in `apps/<app>/MEMOIRS.md`**.

### Responsiveness baseline (current state)

The desktop layout is fixed and accepted as-is. It is a two-column flex layout:

```
main: flex
├── left  w-[40%]  → Editor (+ ErrorDisplay) or Samples Explorer
└── right flex-1
    ├── top h-[40%] → QASM (flex-1) | Results (w-64)
    └── bottom flex-1 → Circuit Visualizer
```

Constraints agreed for future mobile work (not yet implemented):

1. One scroll region per panel; never `overflow-auto` inside `overflow-auto`.
2. No page-level scrolling on mobile; use a `100dvh` shell and let expanded
   panel bodies absorb remaining height (`flex-1 basis-0 min-h-0`).
3. Mobile layout is a CodePen-style vertical stack of collapsible panels
   (Code and Circuit prioritized), not the desktop grid squeezed.
4. Desktop must remain pixel-identical; prefer CSS-only structure switching
   (`flex` → `lg:grid`) over mounting panels twice.
5. Future panels (richer file explorer, Bloch sphere, agentic panel) should be
   added through a panel list/registry, not new hard-coded layout branches.
6. Hover-only features need touch equivalents (tap-to-pin and/or a moment
   stepper writing `setFocusedMoment`).

Known issues captured during the audit: `h-screen` + `overflow-hidden`,
nested scroll containers (`Panel` + child panel + visualizer), crowded header,
hover-only QASM/moment interactions, "Fit Both" shrinking wide circuits, and
`WebMCPDialog` using `90vh` with two independent scroll areas.

---

## Interactive Circuit Visualizer (QASM Line Highlighting)

**Date:** 2026-07-27
**Packages affected:** `apps/bench`
**Dependencies:** `@ljcamargo/quirkvis-react@0.2.0`, `@ljcamargo/quirkvis-core@0.2.0`

### Problem

When a user hovers over a gate, barrier, or measurement in the QuirkVis SVG circuit
diagram, the corresponding line in the generated QASM panel should be highlighted
and scrolled into view.

### Architecture

```
HoverInfo from QuirkVis
  │  { momentIndex, gateName, qubits, type }
  ▼
handleHover() in page.tsx
  │  builds key "momentIndex:gateName:q[0],q[1]"
  ▼
buildQasmLineMap(qasm)
  │  Map<"0:h:q[0]", 6>  (momentIdx:gateName:qubits → 1-indexed line)
  ▼
QasmPanel(highlightedLine=6)
  │  wraps each QASM line in <div data-line="N">
  │  applies bg-cyan-500/10 + border-l-2 border-cyan-400 to target
  │  scrollIntoView({ behavior: 'smooth', block: 'center' })
  ▼
Line highlighted + scrolled
```

### Key Algorithm: `buildQasmLineMap()`

The function walks the QASM string line-by-line alongside the CircuitAnalyzer's
moment structure. It maps each gate/measure/barrier statement to its QASM line
number.

```ts
for each moment mi:
  for each statement stmt in moments[mi]:
    skip non-content lines (headers, comments, blanks)
    key = `${mi}:${stmt.name}:${qubitsStr}`
    map.set(key, lineIdx + 1)
    lineIdx++
```

### Edge Cases Handled

#### 1. Comments offsetting line numbers
`Q.comment("text")` in the DSL produces `// text` in the QASM, but CircuitAnalyzer
**ignores** comment statements — they don't exist in the moments array. If the
sequential walk doesn't skip them, every comment shifts all subsequent line numbers
by 1.

**Fix:** The walker skips any line starting with `//` before matching each
moment statement. This handles both explicit comments and empty `brk()` comments.

#### 2. Barriers have no `data-qv-qubits` in SVG
The QuirkVis SVG renderer sets `data-qv-barrier="true"` and `data-qv-moment="N"`
on barrier elements, but **not** `data-qv-qubits`. The resulting HoverInfo has
`qubits: undefined`.

**Fix:** A fallback key `"momentIndex:barrier:"` (no qubits suffix) is stored for
each barrier. The handler tries the full key first, then falls back to the
qubits-less key.

#### 3. Bulk measurement on one QASM line
`Q.all().measure()` compiles to `c = measure q;` — a single QASM line.
CircuitAnalyzer expands this into one statement per qubit, each in a separate
moment (because each targets a different classical bit).

**Fix:** When the walker reaches the end of the file but there are still
unconsumed moment statements, it reuses `lastMappedLine` for all remaining
statements. All 4 measure statements map to line 22.

#### 4. QASM 2.0 vs 3.0
CircuitAnalyzer parses QASM 3.0 (used for display), but `quantum-circuit`
expects QASM 2.0 (used for simulation). Both formats have the same gate line
count — only the header and measurement syntax differ.

**Fix:** The `truncateQasmAtMoment()` utility accepts both strings: it uses
QASM 3.0 for CircuitAnalyzer moment analysis and truncates QASM 2.0 for
simulation. The line walker's `isNonContentLine()` helper recognizes both formats.

---

## Progressive Circuit Run (Moment-by-Moment Evolution)

**Date:** 2026-07-27
**Packages affected:** `apps/bench`
**Dependencies:** `quantum-circuit`, `@ljcamargo/quirkvis-core@0.2.0`

### Problem

When the user hovers over a moment in the circuit visualizer, the results panel
should show the probability distribution *at that intermediate point* in the
circuit — not just the final distribution. This enables a "circuit evolution"
visualization for educational and debugging purposes.

### Architecture

```
Full autorun completes (results populated)
  │
  ▼
analyzeProgressive(qasm) → { enabled, momentCount, qubitCount }
  │  checks ≤8 qubits + ≤30 moments
  ▼ (async, in background)
computeProgressiveCache(qasmSim, qasmVis, momentCount)
  │  for each moment mi:
  │    truncateQasmAtMoment(qasmSim, qasmVis, mi) → truncated QASM
  │    simulateQasm(truncated QASM) → probability record
  │    cache.set(mi, probabilities)
  │    yield to event loop (setTimeout 0)
  │  return cache
  ▼
When user hovers moment N:
  displayResults = progressiveCache.get(N) ?? fullResults
  momentLabel = "Moment N / M"
```

### Truncation Algorithm: `truncateQasmAtMoment()`

Builds a QASM 2.0 string containing only the circuit prefix up to moment N,
plus all measurement lines from the full circuit.

```
Input: full QASM 2.0 string, upToMoment
Output: truncated QASM 2.0 string

1. Parse QASM 3.0 via CircuitAnalyzer → get moments array
2. Walk QASM 2.0 lines alongside moments to find cutoff line
3. Result = header lines + content lines up to cutoff + all measure lines
```

The last moment returns the full circuit unchanged (no truncation needed).

### Complexity Limits

| Parameter | Limit | Rationale |
|-----------|-------|-----------|
| Qubits | ≤ 8 | 2^8 = 256 states, simulator is fast |
| Moments | ≤ 30 | 30 sequential simulations is ~2 seconds |
| Both | must pass | Large/deep circuits would timeout the browser |

If the circuit exceeds either limit, `progressiveCache` is never populated and
the panel shows only the full simulation results.

### Caching Strategy

- Cache is a `Map<number, Record<string, number>>` — moment index → per-qubit
  measurement probabilities
- Pre-computation starts after full simulation completes (success or failure)
- Cleanup function cancels in-flight pre-computation when circuit re-compiles
- Between each moment simulation, the function yields to the event loop via
  `await new Promise(r => setTimeout(r, 0))` to keep the UI responsive
- Each moment's simulation is wrapped in try/catch; failures are `console.warn`'d
  and the cache entry is skipped

### Edge Cases

#### 1. Simulation failures in partial circuits
Truncated circuits may produce invalid QASM (e.g., mid-circuit measurements or
conditional gates depending on unmeasured classical registers). All errors are
caught per-moment and logged — never thrown.

#### 2. Duplicate results with full simulation
The last moment (M-1) produces the same result as the full simulation. This is
by design — it means hovering over the last column shows the same result as the
panel, which is consistent behavior.

#### 3. Race conditions with re-compilation
If the user edits the code and the circuit re-compiles while pre-computation is
running, the old cache is discarded via the `cancelled` flag in the effect
cleanup function.

---

## Theme: Night Mode in Bench

The Bench uses `themes.night` from `@ljcamargo/quirkvis-core` for a dark-themed
circuit visualization that matches the overall dark UI of the app.

---

## Samples Explorer & File Tree

**Date:** 2026-07-27
**Packages affected:** `apps/bench`

### Problem

The Bench needed a way for users to browse, load, and manage multiple code
samples. Future plans include a full file explorer connected to remote storage,
so the component must be designed as a generic file tree from day one.

### Architecture

```
sampleRegistry.ts (barrel)
  │  imports each .js file via raw-loader
  │  exports flat SampleEntry[] + getSampleCode()
  ▼
page.tsx: buildSampleTree(entries) → TreeNode
  │  splits each path by "/" to build nested tree
  │  e.g. "samples/qft/qft_sugar.js" → samples/ > qft/ > qft_sugar.js
  ▼
SamplesPanel(tree, activePath, onSelect, onFileOpen)
  │  renders recursive TreeNode components
  │  collapsible directories with ChevronRight/ChevronDown
  │  active file highlighted with cyan bg
  │  "Open file..." button triggers hidden <input type="file">
```

### Key Design Decisions

#### 1. Barrel over require.context()
`require.context()` with raw-loader is unreliable in webpack 5 — the exported
format may be the raw string or wrapped in a module object depending on the
module system. Explicit imports through a barrel file (`sampleRegistry.ts`)
are deterministic and proven to work.

**Cost:** 3 lines per sample (one import + one array entry). This is acceptable
and trivially scriptable for automation.

#### 2. Virtual filesystem paths
Paths in the barrel start with `samples/` (e.g. `"samples/qft_sugar.js"`),
mirroring the actual directory structure. Future subdirectories naturally
extend this: `"samples/qft/qft_sugar.js"`.

#### 3. Extension: `.js` not `.quantumjs`
The `.quantumjs` extension was misleading — it looks like a custom language
dialect. The files are regular JavaScript that use the `Quantum` global.

**Change:**
- Files renamed from `*.quantumjs` to `*.js`
- Webpack raw-loader rule scoped with `include: path.resolve('src/samples')`
  to avoid intercepting normal `.js` files
- TypeScript module declarations replaced with `@ts-expect-error` annotations

#### 4. Panel switch, not overlay
Samples panel uses a panel switch (replaces the editor in the left 40% pane)
rather than a drawer or overlay. This keeps the layout stable — no squishing,
no reflow of the right-side panels.

#### 5. Stub for future file explorer
"Open file..." button is already functional (reads local `.js` files via
FileReader). A disabled stub at the bottom signals future capabilities
(e.g. connecting to remote buckets, showing `/some/file.js` paths).

---

## File Operations: Download, Copy, New

**Date:** 2026-07-27
**Packages affected:** `apps/bench`

### Problem

Users need to export their work: save source code, download generated QASM,
export probability results as CSV, and capture the circuit diagram as SVG.
Copy-to-clipboard is faster for quick sharing. A "New file" button clears
the editor to start fresh.

### What each panel provides

| Panel | Copy | Download | Other |
|-------|------|----------|-------|
| QuantumJS Editor | Source code | `circuit.js` | New file (`FilePlus`) |
| QASM | QASM text | `circuit.qasm` | — |
| Probabilities | CSV text | `results.csv` | — |
| Circuit Visualizer | SVG markup | `circuit.svg` | — |

### Implementation

- **`src/lib/download.ts`** — shared utilities:
  - `downloadText(filename, content)` — Blob + anchor click
  - `downloadSvg(filename, svgElement)` — XMLSerializer
  - `downloadResultsCsv(filename, results)` — converts to CSV first
  - `copyToClipboard(text)` — `navigator.clipboard.writeText()`
  - `resultsToCsv(results)` — converts Record to CSV string
  - `svgToString(svgElement)` — XMLSerializer to string
- Each panel accepts an optional `headerAction` prop for icon buttons
- Buttons use `Download`, `Copy`, and `FilePlus` icons at `size={12}`

### Why SVG doesn't need a library change

QuirkVis renders an inline `<svg>` element in the DOM. We extract it via
`svgContainerRef.current.querySelector('svg')` and serialize it with
`XMLSerializer`. No new dependency or feature request needed.
