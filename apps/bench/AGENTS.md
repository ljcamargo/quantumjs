# QuantumJS Bench — Agent Guide

> Read this file before changing anything in `apps/bench`.
> For *why* a feature is built the way it is, read `apps/bench/MEMOIRS.md`.
> Monorepo-wide context lives in `/README.md` and `/MEMOIRS.md`.

---

## TL;DR

- `apps/bench` is a **single-page, fully client-side Next.js 16 App Router app**.
- One client component (`src/app/page.tsx`) owns all UI state and renders four
  panels: **Editor**, **QASM**, **Probabilities**, **Circuit Visualizer**
  (+ **Samples Explorer** toggled in the editor slot).
- Pipeline: `DSL code → compile QASM 3.0 (display) + QASM 2.0 (sim) → simulate
  → probabilities`, plus a background *moment-by-moment* cache for hover
  previews.
- No API routes, no server actions, no database. Everything runs in the browser.
- **The current layout is desktop-only.** `page.tsx` uses hard-coded
  percentages with no responsive breakpoints. Mobile support is an active,
  planned workstream — see [Layout & responsive work](#8-layout--responsive-work).
- The desktop layout is considered **correct and must be preserved** when
  mobile work happens.

---

## 1. What the Bench is

An in-browser quantum IDE for the QuantumJS DSL:

| Capability | Where |
|---|---|
| Write circuit code (Prism-highlighted editor, autorun) | `src/components/Panels.tsx` → `EditorPanel` |
| Compile to OpenQASM 3.0 and 2.0 | `src/hooks/useSimulator.ts` |
| Statevector simulation → probabilities | `src/hooks/useSimulator.ts` (`quantum-circuit`) |
| SVG circuit diagram (QuirkVis) | `src/components/VisualizerPanel.tsx` |
| Hover gate → highlight matching QASM line | `src/lib/qasmLineMap.ts` + `QasmPanel` |
| Hover moment → probabilities at that moment | `src/lib/qasmProgressive.ts` + `src/hooks/useProgressive.ts` |
| Built-in samples / local file open | `src/sampleRegistry.ts`, `src/lib/sampleTree.ts` |
| Download/copy/new-file actions | `src/hooks/useFileActions.ts`, `src/lib/download.ts` |
| WebMCP tools for AI agents | `src/app/page.tsx`, `src/hooks/useDocsTools.ts` |

Live app: <https://quantumjs.netlify.app> · Docs: <https://quantumjsdocs.netlify.app>

---

## 2. Commands

Run from the **repo root** unless noted.

```bash
npm install                      # or: bun install (repo uses bun.lockb + Netlify uses bun)
npm run dev --workspace=bench    # next dev --webpack  (http://localhost:3000)
npm run build --workspace=bench  # next build --webpack
npm run lint --workspace=bench   # eslint
```

From `apps/bench` the same is `bun dev`, `bun run build`, `bun run lint`.

**Always use Webpack flags.** `package.json` pins `--webpack` because the
simulator needs Node polyfills (`fs`, `path`, `os` fallbacks in
`next.config.ts`). Do not switch to Turbopack without re-verifying the
simulator bundle.

`prebuild` copies `../../agent-skills/quantumjs/SKILL.md` to `public/SKILL.md`.
**Edit the source skill in `agent-skills/quantumjs/SKILL.md`, never
`apps/bench/public/SKILL.md`** — the latter is generated.

The Bench consumes the library through `"@quantum-js/dsl": "file:../../packages/quantumjs"`,
which resolves to the package's **`dist/`** output. After editing
`packages/quantumjs/src`, rebuild the library before testing the Bench:

```bash
bun x tsc --project packages/quantumjs      # what Netlify runs
# or
npm run build --workspace=@quantum-js/dsl
```

Dependencies are hoisted to the **root** `node_modules` (partial copies exist
under `apps/bench/node_modules`). Resolve packages like
`node_modules/@ljcamargo/quirkvis-react` from the repo root.

---

## 3. Non-negotiable repo rules

1. **This is not the Next.js you know.** The app uses Next.js `16.2.3` with
   React `19.2.4`. Before using a Next API, read the relevant guide under the
   repo-root `node_modules/next/dist/docs/` (App Router section
   `01-app/`). Heed deprecation notices; do not rely on training-data APIs.
2. **Preserve the desktop layout.** It is currently accepted as-is. Mobile
   work must be additive (`lg:` breakpoints / mobile-only affordances) and
   verified with desktop screenshots.
3. **No nested scrolling.** See [§8](#8-layout--responsive-work).
4. **Keep the Bench client-only** unless a task explicitly introduces server
   work. There is no `app/api/` directory today.
5. **Samples are plain JavaScript**, not a custom language. They use the
   `Quantum` global and must `return` a circuit/pipeline. Never use
   `import`/`require` inside a sample.
6. **Do not edit generated output**: `.next/`, `build.log`, `public/SKILL.md`,
   `*.tsbuildinfo`.
7. **Document non-trivial changes** in `apps/bench/MEMOIRS.md` (app-scoped) or
   `/MEMOIRS.md` (library/core or cross-cutting).

---

## 4. Directory map

```
apps/bench/
├── AGENTS.md                  ← you are here
├── MEMOIRS.md                 ← app-scoped architecture decisions + edge cases
├── README.md                  ← human quick start
├── CHANGELOG.md               ← user-facing changes
├── netlify.toml               ← build from repo root, publish .next
├── next.config.ts             ← webpack raw-loader + node polyfills + terser
├── eslint.config.mjs
├── public/
│   ├── SKILL.md               ← GENERATED from agent-skills/ (prebuild)
│   └── *.svg, logo.png        ← static assets
└── src/
    ├── app/
    │   ├── layout.tsx          ← fonts, metadata, GA scripts, <Providers>
    │   ├── providers.tsx       ← <WebMCPProvider name="quantumjs">
    │   ├── globals.css         ← Tailwind v4 import, dark scrollbars
    │   └── page.tsx            ← "use client": layout, state, MCP tools
    ├── components/
    │   ├── Panels.tsx          ← Panel shell + Editor/QASM/Results/Samples/Error
    │   ├── VisualizerPanel.tsx ← QuirkVis wrapper, fit/zoom, SVG export, ref API
    │   ├── WebMCPDialog.tsx    ← tool discovery modal
    │   └── icons.tsx           ← GitHubIcon
    ├── hooks/
    │   ├── useSimulator.ts     ← code state, compile, simulate, autorun
    │   ├── useProgressive.ts   ← moment cache + focused moment + displayResults
    │   ├── useQuantumPipeline.ts ← composes simulator + progressive (runWithMoment)
    │   ├── useFileActions.ts   ← copy/download/new callbacks
    │   └── useDocsTools.ts     ← 5 docs-related WebMCP tools
    ├── lib/
    │   ├── qasmLineMap.ts      ← moment/gate → QASM line number map
    │   ├── qasmProgressive.ts  ← moment analysis, QASM truncation, cache compute
    │   ├── download.ts         ← Blob download, clipboard, CSV, SVG serialize
    │   └── sampleTree.ts       ← flat sample paths → nested TreeNode
    ├── samples/                ← 12 sample circuits (.js, raw-loaded)
    ├── sampleRegistry.ts       ← explicit barrel: path + code (edit to add samples)
    └── types/raw.d.ts          ← note about raw-loader typings
```

### `src/app/page.tsx` responsibilities (one file, ~400 lines)

- owns UI-only state: `highlightedLine`, `activeSamplePath`, `showSamples`,
  `showWebMCPDialog`, `webMCPVisible`, `visualizerRef`
- derives `lineMap` from `qasm3` for hover → QASM line highlighting
- registers Bench WebMCP tools: `compile_simulate_draw`, `list_samples`,
  `open_sample` and calls `useDocsTools()`
- renders header + the two-column desktop layout
- **state stays here**; panels are presentational and receive props

---

## 5. Runtime data flow

```
 user types
    │  setCode (useSimulator)
    ▼
 autorun debounce (1000 ms)  ── or ── Run button / MCP compile tool
    │
    ▼
 new Function('Quantum', sourceCode) → circuit object
    │
    ├── circuit.compile({ version: '3.0' }) → qasm3  → QASM panel + QuirkVis
    └── circuit.compile({ version: '2.0' }) → qasm2  → quantum-circuit simulator
                                                          │
                                                          ▼
                                                   probabilities
                                                          │
                       useProgressive (≤8 qubits, ≤30 moments)
                       ├─ analyzeProgressive(qasm3)  → momentCount/enabled
                       ├─ for each moment: truncateQasmAtMoment(qasm2, qasm3, m)
                       │                   → simulate → cache[m]
                       └─ focus moment (hover) → displayResults = cache[m]
```

Important split: **`qasm3` is for display/analysis, `qasm2` is for
simulation.** Mixing them up is the most common bug in this app.

---

## 6. State ownership

| State | Owner | Notes |
|---|---|---|
| `code` | `useSimulator` | single source of truth for editor content |
| `qasm3` / `qasm2` | `useSimulator` | display vs simulation formats |
| `probabilities` | `useSimulator` | full-circuit simulation result |
| `error` | `useSimulator` | rendered by `ErrorDisplay` under the editor |
| `isRunning` | `useSimulator` | drives spinners in Results |
| `autoRun` | `useSimulator` | 1 s debounce; default `true` |
| `focusedMoment` | `useProgressive` | `null` = full circuit |
| `momentCache` | `useProgressive` | keyed by the `qasm3` it belongs to |
| `displayResults` | `useProgressive` | cached moment OR full results |
| `highlightedLine` | `page.tsx` | derived from visualizer hover via `buildQasmLineMap` |
| `showSamples`, `activeSamplePath` | `page.tsx` | Samples panel replaces editor (no layout reflow) |
| `fitMode`, `zoom` | `VisualizerPanel` | local controls |
| `expandedDirs` | `SamplesPanel` | local tree state |

`useQuantumPipeline` is a thin composition layer: it spreads both hooks and
adds `runWithMoment(code, momentum?)` for MCP callers.

---

## 7. Panel components

`src/components/Panels.tsx`

- **`Panel`** — shared shell: title + icon + optional `headerAction`, content
  area. Used by every panel. **It currently applies `overflow-auto` to its
  content wrapper, while several children add their own `overflow-auto`. That
  is the nested-scroll source to fix during responsive work.**
- **`EditorPanel`** — `react-simple-code-editor` + Prism JS highlighting.
  Injects a `<style>` block that forces `white-space: pre` and lets the inner
  editor expand to the longest line (horizontal scroll lives here).
- **`QasmPanel`** — splits Prism-highlighted HTML per line, wraps each line in
  `[data-line="N"]`, scrolls the highlighted line into view. Do not collapse
  back to one `<pre>` blob; line wrappers are required for highlighting.
- **`ResultsPanel`** — probability bars; shows `Moment N / M` via `momentLabel`.
- **`SamplesPanel`** — recursive `TreeNode` explorer + hidden file input for
  "Open file...". Replaces the editor panel; it is not an overlay.
- **`ErrorDisplay`** — fixed-height scrollable error strip under the editor.

`src/components/VisualizerPanel.tsx`

- Wraps `QuirkVis` with `themes.night`, `interactive`, and fit/zoom controls.
- Exposes an imperative handle (`getSvgString`, `waitForRender`) so MCP tools
  can return SVG after React commits the new QASM render.
- Fit modes: `both | width | height | none`; manual zoom shown only for `none`.
- QuirkVis is CSS-responsive: `fitWidth`/`fitHeight` set `width/height: 100%`
  on the SVG wrapper and rely on `viewBox` + `preserveAspectRatio`, so it does
  not need a `ResizeObserver`.

---

## 8. Layout & responsive work

### Current desktop layout (must be preserved)

```
┌─ header h-10 ───────────────────────────────────────────────┐
├────────────── 40% ──────────────┬──────────── 60% ───────────┤
│                                │  QASM (flex-1) │ Results   │
│  Editor  (or Samples Explorer) │                │ w-64      │
│  + ErrorDisplay                ├────────────────┴───────────┤
│                                │  Circuit Visualizer        │
└────────────────────────────────┴────────────────────────────┘
```

- Root: `h-screen overflow-hidden`, `body { overflow: hidden }`.
- Main: `flex`; left `w-[40%]`; right `flex-1`.
- Right column: top row `h-[40%]`, bottom `flex-1`.
- There are **no `sm:`/`md:`/`lg:` layout breakpoints** today (only
  `hidden sm:inline` on the Samples label).
- Panels use a 1 px `border-white/5`, background `#111114`, page `#0a0a0c`.

### Agreed constraints for any mobile work

1. **One scroll region per panel; zero nested scrolls.** No
   `overflow-auto` wrapping another `overflow-auto`.
2. **No page-level scroll on mobile.** Use a fixed shell sized with `100dvh`
   (not `100vh`) minus header; expanded panel bodies absorb the remaining
   height and are the only scrollers.
3. **Collapsible/toggleable stacked panels on mobile** (CodePen-style):
   compact always-visible panel headers; expanded bodies share the remaining
   height (`flex-1 basis-0 min-h-0`). Code and Circuit are the priority panels.
4. **Desktop stays pixel-identical.** Prefer CSS-only structure switching
   (`flex` on mobile → `lg:grid` with explicit areas) over duplicating
   components, so QuirkVis and the editor are never mounted twice.
5. **Design for future panels** (richer file explorer, Bloch sphere, agentic
   panel). New panels must be added as entries in a panel registry/list, not
   as new hard-coded layout branches.
6. **Touch parity for hover features.** QASM line highlighting and progressive
   moments are hover-driven. Mobile needs a tap-to-pin and/or prev/next moment
   control that writes `setFocusedMoment` directly.
7. Respect safe areas (`env(safe-area-inset-*)`) and keep touch targets ≥ 40 px
   on mobile (headers can stay dense on desktop).

### Known mobile problems to solve

- `h-screen` + `overflow-hidden` clips content; the 40/60 split stays
  side-by-side on phones and squeezes all panels.
- Nested scroll containers (Panel + Editor + QASM/Results/Visualizer +
  Visualizer's own `overflow-auto`).
- Header is crowded: logo, Samples, WebMCP, Autorun, Run, Docs, GitHub.
- Hover-only interactions (QASM line highlight, moment evolution) are
  unreachable on touch.
- Visualizer "Fit Both" can shrink wide circuits to unreadable sizes.
- `WebMCPDialog` uses `90vh` and contains two independent scroll areas.

> Any layout change must be proposed and approved first. Do not start
> restructuring the panels without sign-off.

---

## 9. Feature invariants & gotchas

### QASM line mapping (`src/lib/qasmLineMap.ts`)

- Key format: `"momentIndex:gateName:qubits"` where qubits are `q[0],q[1]`.
- Walks QASM lines and `CircuitAnalyzer` moments in lockstep; **skips comments
  and headers** so line numbers do not drift.
- Bulk `measure` (`c = measure q;`) expands to one statement per qubit —
  remaining statements reuse the last mapped line.
- Barriers get an extra key without the qubit suffix because QuirkVis does not
  emit `data-qv-qubits` for barriers.
- `CircuitAnalyzer.analyze()` can throw → return an empty map and disable
  highlighting rather than crashing.

### Progressive simulation (`src/lib/qasmProgressive.ts`)

- Enabled only when `qubitCount ≤ 8` **and** `momentCount ≤ 30`.
- `truncateQasmAtMoment(qasm2, qasm3, m)` analyses `qasm3` but slices `qasm2`;
  it re-appends all measurement lines after the cutoff.
- Cache is populated sequentially with a `setTimeout(0)` yield per moment.
- Per-moment failures are `console.warn`-only and skipped.
- `useProgressive` discards caches when `qasm3` changes; never show a stale
  moment for a different circuit.

### Simulator (`src/hooks/useSimulator.ts`)

- Executes user code with `new Function('Quantum', code)` → no `import`,
  `require`, or bare `circuit()`; the code must `return` the circuit.
- Autorun timeout is **1000 ms**; it re-triggers whenever `run` changes, which
  includes `code` changes. Cleanup clears the timer.
- `runWithCode(code)` sets editor state and returns the full result — used by
  MCP tools so the UI stays in sync.
- QASM 2.0 is what `quantum-circuit` imports; QASM 3.0 is what QuirkVis and
  `CircuitAnalyzer` parse.

### Visualizer

- QuirkVis re-renders its SVG from `qasm`/`theme`/`interactive`; sizing is CSS.
- `waitForRender` relies on parent effects running after child effects in the
  same commit. Do not move that effect into a layout-effect with different
  ordering assumptions.
- SVG export serializes the live DOM SVG — no extra dependency.

### Samples

- Add a file under `src/samples/` and register it in `src/sampleRegistry.ts`
  (explicit import + entry). There is intentionally **no**
  `require.context()`; barrel imports are deterministic.
- Paths are virtual and start with `samples/`; nested directories work
  automatically via `buildSampleTree`.
- Raw-loader is scoped to `src/samples/` in `next.config.ts`, so normal `.js`
  imports elsewhere are untouched.
- The default editor content is `samples/qft_sugar.js` (hard-coded in
  `page.tsx`).

### WebMCP

- Provider: `src/app/providers.tsx` (`WebMCPProvider name="quantumjs"`).
- Bench tools live in `src/app/page.tsx`; docs tools in
  `src/hooks/useDocsTools.ts`.
- Tools return `{ content: [], structuredContent: {...} }`.
- `compile_simulate_draw` supports `momentum` (moment index, -1/omitted = full)
  and `includeSvg`.
- Docs tools fetch remote JSON/Markdown from `https://quantumjsdocs.netlify.app`
  (`sitemap.json`, page `.md`, `llms*.txt`, `SKILL.md`) and cache promises at
  module scope.
- Adding a tool = one `useMcpTool({...})` call; no registration file.

---

## 10. Where to change what

| Task | Files |
|---|---|
| Editor behavior / highlighting | `src/components/Panels.tsx` (`EditorPanel`) |
| QASM display or line highlight | `src/components/Panels.tsx` (`QasmPanel`), `src/lib/qasmLineMap.ts` |
| Probability UI / moment badge | `src/components/Panels.tsx` (`ResultsPanel`), `src/hooks/useProgressive.ts` |
| Circuit rendering, fit/zoom, SVG export | `src/components/VisualizerPanel.tsx` |
| Samples list / explorer / open file | `src/sampleRegistry.ts`, `src/lib/sampleTree.ts`, `Panels.tsx` |
| Download/copy/new actions | `src/hooks/useFileActions.ts`, `src/lib/download.ts` |
| Compile/simulate/autorun | `src/hooks/useSimulator.ts`, `src/hooks/useQuantumPipeline.ts` |
| Header, panel layout, mobile shell | `src/app/page.tsx`, `src/app/globals.css` |
| WebMCP Bench tools | `src/app/page.tsx` |
| WebMCP docs tools | `src/hooks/useDocsTools.ts` |
| WebMCP tool browser modal | `src/components/WebMCPDialog.tsx` |
| Global styles / scrollbars | `src/app/globals.css` |
| Build/bundler config | `next.config.ts`, `package.json`, `netlify.toml` |

---

## 11. Verification checklist

There is no automated test suite. Before finishing a Bench change:

```bash
npm run lint --workspace=bench
npm run build --workspace=bench
```

Manual checks (dev server):

- type a circuit → autorun compiles after ~1 s; Run button also works
- intentional syntax error → `ErrorDisplay` shows it, app does not crash
- invalid QASM edge cases → visualizer still renders or shows its own error
- hover a gate → QASM line highlights and scrolls into view
- hover a moment → Results shows `Moment N / M`; leaving resumes full results
- Samples → open each sample; "Open file..." loads a local `.js`
- copy/download produce `circuit.js`, `circuit.qasm`, `results.csv`, `circuit.svg`
- Visualizer fit modes + manual zoom
- WebMCP dialog lists tools when the API is available
- **Desktop layout unchanged** at ≥1024 px (compare screenshots)
- mobile widths 320 / 375 / 390 / 430 px and landscape 844×390:
  no horizontal body scroll, no nested scroll traps, editor usable with the
  on-screen keyboard

---

## 12. Docs & memoirs

- `apps/bench/MEMOIRS.md` — app-scoped decisions, algorithms, edge cases.
  Add an entry for every non-obvious change (date, packages affected,
  problem, architecture, edge cases).
- `/MEMOIRS.md` — monorepo index + library/core entries
  (`packages/quantumjs`).
- `apps/bench/CHANGELOG.md` — user-visible changes for the Bench.
- `apps/documentation/docs/bench/bench.mdx` — public Bench documentation
  (update when behavior/UI changes in a user-visible way).
- `agent-skills/quantumjs/SKILL.md` — what agents learn about writing
  QuantumJS; `apps/bench/public/SKILL.md` is copied from it at prebuild.

Keep this file current: if you add a module, panel, hook, tool, or build
constraint, update the map and the relevant table here.
