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
- **The app is responsive, with one DOM and two CSS arrangements.** At `lg`
  (`64rem` / 1024 px) it renders the accepted desktop console; below it, a
  CodePen-style vertical stack of collapsible panels. Desktop is preserved;
  mobile defaults to **Editor + Circuit**, max two open, persisted in
  localStorage. See [Layout & responsive architecture](#8-layout--responsive-architecture).
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
    │   ├── globals.css         ← Tailwind v4, scrollbars, `.bench-main` grid,
    │   │                         `.bench-panel-*`, `.panel-icon-btn`
    │   └── page.tsx            ← "use client": shell, state, MCP tools
    ├── components/
    │   ├── Panels.tsx          ← Panel shell + Editor/QASM/Results/Samples/Error
    │   ├── VisualizerPanel.tsx ← QuirkVis wrapper, fit/zoom, SVG export, ref API
    │   ├── HeaderMenu.tsx      ← mobile gear menu (Autorun, Docs, GitHub)
    │   ├── WebMCPDialog.tsx    ← tool discovery modal (desktop only)
    │   └── icons.tsx           ← GitHubIcon
    ├── hooks/
    │   ├── useSimulator.ts     ← code state, compile, simulate, autorun
    │   ├── useProgressive.ts   ← moment cache + focused moment + displayResults
    │   ├── useQuantumPipeline.ts ← composes simulator + progressive (runWithMoment)
    │   ├── useFileActions.ts   ← copy/download/new callbacks
    │   ├── useMobilePanels.ts  ← mobile stack open set, max-2 eviction, persistence
    │   ├── useIsDesktop.ts     ← behavioral media query (hover, mobile fit default)
    │   └── useDocsTools.ts     ← 5 docs-related WebMCP tools
    ├── lib/
    │   ├── qasmLineMap.ts      ← moment/gate → QASM line number map
    │   ├── qasmProgressive.ts  ← moment analysis, QASM truncation, cache compute
    │   ├── download.ts         ← Blob download, clipboard, CSV, SVG serialize
    │   ├── sampleTree.ts       ← flat sample paths → nested TreeNode
    │   └── source.ts           ← New-file template + empty-document guard
    ├── samples/                ← 12 sample circuits (.js, raw-loaded)
    ├── sampleRegistry.ts       ← explicit barrel: path + code (edit to add samples)
    └── types/raw.d.ts          ← note about raw-loader typings
```

### `src/app/page.tsx` responsibilities (one file, ~400 lines)

- owns UI-only state: `highlightedLine`, `activeSamplePath`, `showSamples`,
  `showWebMCPDialog`, `webMCPVisible`, `visualizerRef`
- owns the mobile panel stack via `useMobilePanels()` and passes
  `collapsed`/`onToggle`/`onFocus` (through `panelChrome(id, extraClass)`)
- derives `lineMap` from `qasm3` for hover → QASM line highlighting
- registers Bench WebMCP tools: `compile_simulate_draw`, `list_samples`,
  `open_sample` and calls `useDocsTools()`
- renders header + `main.bench-main`, with panels as direct children in
  **mobile order** (Editor, Circuit, QASM, Results, Explorer)
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
| `showSamples`, `activeSamplePath` | `page.tsx` | desktop: replaces editor; mobile: full-screen sheet |
| mobile open set | `useMobilePanels` | max 2, LRU eviction, persisted; ignored on desktop |
| `isDesktop` | `useIsDesktop` | behavior only: hover on/off, mobile fit default |
| `fitMode`, `zoom` | `VisualizerPanel` | local controls |
| `expandedDirs` | `SamplesPanel` | local tree state |

`useQuantumPipeline` is a thin composition layer: it spreads both hooks and
adds `runWithMoment(code, momentum?)` for MCP callers.

---

## 7. Panel components

`src/components/Panels.tsx`

- **`Panel`** — shared shell: title + icon + optional `headerAction`/`badge`,
  plus the mobile collapse API (`id`, `collapsed`, `onToggle`, `onFocus`).
  Its content wrapper is `overflow-hidden`: **the panel body owns the only
  scroll region**, never the shell. On desktop `collapsed` is inert — the
  body uses `hidden lg:flex` so the console always shows every panel.
- **`EditorPanel`** — `react-simple-code-editor` + Prism JS highlighting.
  Injects a `<style>` block that forces `white-space: pre` and lets the inner
  editor expand to the longest line (horizontal scroll lives here). Renders
  `ErrorDisplay` as a footer and shows a red dot in the header on error.
- **`QasmPanel`** — splits Prism-highlighted HTML per line, wraps each line in
  `[data-line="N"]`, scrolls the highlighted line into view. Do not collapse
  back to one `<pre>` blob; line wrappers are required for highlighting.
- **`ResultsPanel`** — probability bars; shows `Moment N / M` via `momentLabel`.
- **`SamplesPanel`** — recursive `TreeNode` explorer + hidden file input for
  "Open file...". Desktop: replaces the editor slot. Mobile: full-screen
  `fixed inset-0 z-50` sheet (same mounted component, toggled by CSS).
- **`ErrorDisplay`** — fixed-height scrollable error strip under the editor
  (its own region, sibling of the editor scroller — not nested).

`src/components/VisualizerPanel.tsx`

- Wraps `QuirkVis` with `themes.night`, `interactive`, and fit/zoom controls.
- **Hover is pointer-only:** `interactive`/`onHover` are enabled only when
  `useIsDesktop()` is true, so touch devices get no hover side effects.
- Mobile defaults to **fit width** (readable, vertical scroll); desktop keeps
  **fit both**. A user choice overrides the default. Fit/zoom controls are
  hidden on mobile for now.
- Exposes an imperative handle (`getSvgString`, `waitForRender`) so MCP tools
  can return SVG after React commits the new QASM render.
- Fit modes: `both | width | height | none`; manual zoom shown only for `none`.
- QuirkVis is CSS-responsive: `fitWidth`/`fitHeight` set `width/height: 100%`
  on the SVG wrapper and rely on `viewBox` + `preserveAspectRatio`, so it does
  not need a `ResizeObserver`. The wrapper uses `m-auto` (not flex centering)
  so tall SVGs remain scrollable from the top.

---

## 8. Layout & responsive architecture

### Breakpoint

`lg` = **`64rem` / 1024 px** (Tailwind's `lg`, matched in `globals.css` and
`useIsDesktop`). Below it the app renders the mobile stack; at and above it the
desktop console.

Why 1024: the desktop grid gives the editor 40% and Results 16rem. At 768 px
that leaves QASM ~205 px (and at 800 px ~230 px), which is unusable; at 1024 px
it gets ~360 px. Result: tablet portrait → mobile stack, tablet landscape →
console.

### One DOM, two arrangements

`main.bench-main` is a **flex column** by default and a **CSS grid** at `lg`.
Panels are direct children, always mounted, in mobile order:

```
Editor → QASM → Circuit → Results        (+ Explorer, handled separately)
```

Grid areas place the same nodes into the desktop console; no component
(especially the QuirkVis SVG or the editor) is ever mounted twice.

```css
/* globals.css, >= 64rem */
.bench-main {
  display: grid;
  gap: 1px;                     /* reproduces the old wrapper-border seams */
  background-color: rgb(255 255 255 / 0.05);
  grid-template-columns: 40% minmax(0, 1fr) 16rem;
  grid-template-rows: 40% minmax(0, 1fr);
  grid-template-areas:
    "editor qasm results"
    "editor circuit circuit";
}
.bench-area-editor  { grid-area: editor; }
.bench-area-qasm    { grid-area: qasm; }
.bench-area-results { grid-area: results; }
.bench-area-circuit { grid-area: circuit; }
```

### Mobile stack (below `lg`)

- `useMobilePanels` owns the open set (`PanelId[]`).
- **Max 2 open.** Opening a third evicts the least-recently-expanded one.
- Default: **Editor + Circuit**. Persisted under `bench:mobilePanels:v1`
  (restored after mount, so SSR/hydration stay clean).
- Collapsed panel = fixed header bar only (`flex: 0 0 auto`); open panel =
  `flex: 1 1 0%` with `min-height: 0`, sharing the remaining height.
- **Focus** button (maximize) makes one panel solo; pressing it again restores
  the default pair. Useful in landscape.
- All panels collapsed → “Tap a panel header to open it.” placeholder.
- Editor is hidden while the Explorer is open. Explorer is a full-screen
  `fixed inset-0 z-50` sheet on mobile; on desktop it still replaces the editor
  slot. Same `SamplesPanel` instance, toggled by CSS.
- Mobile header: circularly clipped logo + `QuantumJS` brand label, icon-only Samples
  and Run (no button chrome), gear menu (Autorun, Docs, GitHub). **WebMCP is
  hidden entirely on mobile.** Desktop header keeps WebMCP, Autorun, Docs,
  GitHub inline and is visually unchanged.

### Scroll rule (enforced)

- `.bench-main` never scrolls. Root uses `.bench-shell` (`height: 100vh;
  height: 100dvh;` + `overflow-hidden`); mobile
  browser chrome is handled by `dvh`, plus `env(safe-area-inset-bottom)`.
- `Panel` content wrapper is `overflow-hidden`; it is **not** a scroller.
- Exactly one scroll region per panel body:
  `EditorPanel → .npm-editor`, `QasmPanel`, `ResultsPanel`,
  `VisualizerPanel`, `SamplesPanel`.
- `ErrorDisplay` is a sibling of the editor scroller (its own region), never
  nested inside it.
- **Never add an `overflow-auto` around a panel that already scrolls.**
- Auditing in the browser console:

```js
[...document.querySelectorAll('*')].filter((el) => {
  const s = getComputedStyle(el);
  const scrolls = /auto|scroll/.test(s.overflowY + s.overflowX);
  return scrolls && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
});
// Each result should be a leaf panel body with no scrolling ancestor.
```

### Desktop console (must be preserved)

```
┌─ header h-10 (lg) ─────────────────────────────────────────┐
├────────── 40% ──────────┬─ qasm (1fr) ─┬─ results 16rem ───┤
│                         │              │                   │
│  Editor / Explorer      ├──────────────┴───────────────────┤
│  + ErrorDisplay         │  Circuit Visualizer (1fr)        │
└─────────────────────────┴──────────────────────────────────┘
```

Panels use 1 px `border-white/5`, background `#111114`, page `#0a0a0c`.

### Responsive behavior summary

| Concern | Desktop (`lg+`) | Mobile (`<lg`) |
|---|---|---|
| Structure | CSS grid console | flex column stack |
| Mobile | max 2 open, headers always visible; order Editor → QASM → Circuit → Results |
| Default open | n/a | Editor + Circuit |
| Header | logo + title, WebMCP, Autorun, Docs, GitHub | clipped logo + `QuantumJS`, icon-only Samples/Run, gear menu |
| Explorer | replaces editor slot | full-screen sheet |
| Hover (QASM line, moments) | enabled | **disabled** (pointer-only) |
| Visualizer fit | `both` | `width` |
| Scrolling | one region per panel | one region per expanded panel; no page scroll |

### Touch / hover status

Hover-driven features are intentionally **disabled on touch**: QuirkVis receives
`interactive={isDesktop}` and no `onHover`, so no mouse side effects. Moment
steppers, tap-to-pin, Bloch sphere, agentic panel, etc. are future work and
must not assume hover.

### Adding a future panel

1. Add its id to `PanelId` + `VALID_PANELS` in `useMobilePanels.ts`.
2. Mount it as a direct child of `main.bench-main` in the desired mobile order
   and pass `panelChrome('<id>', 'bench-area-<area>')`.
3. Add a `.bench-area-<area>` rule and a grid-area to `globals.css` `lg` block
   (or let it reuse an existing area / tab group).
4. Ensure exactly one scroll region inside its `Panel` body.
5. Update this file, `MEMOIRS.md`, and the public Bench docs.

### Rules

1. **Desktop stays pixel-identical** (screenshots at 1024+).
2. **No nested scrolling**, ever.
3. **No page-level scroll on mobile.**
4. **Do not mount panels twice** for the two layouts; use CSS.
5. New UI must work without hover; hover is an enhancement.
6. Keep mobile touch targets **≥ 36 px** (panel bars are 40 px; `.panel-icon-btn`
   is 36 px on mobile, 16 px on desktop).

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
- **Blank documents are skipped.** `hasExecutableCode()` strips block/line
  comments; whitespace/comment-only sources clear `qasm3`, `qasm2`,
  `probabilities`, and `error` without evaluating. This is why a new/cleared
  editor does not show “must return a circuit”. The New action inserts
  `NEW_FILE_TEMPLATE` (a valid empty circuit) from `src/lib/source.ts`.
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
| New-file template / blank-document guard | `src/lib/source.ts`, `src/hooks/useFileActions.ts`, `src/hooks/useSimulator.ts` |
| Download/copy/new actions | `src/hooks/useFileActions.ts`, `src/lib/download.ts` |
| Compile/simulate/autorun | `src/hooks/useSimulator.ts`, `src/hooks/useQuantumPipeline.ts` |
| Header, panel layout, mobile shell | `src/app/page.tsx`, `src/app/globals.css` |
| Mobile open/closed state, persistence, max-2 | `src/hooks/useMobilePanels.ts` |
| Mobile header gear menu (Autorun/Docs/GitHub) | `src/components/HeaderMenu.tsx` |
| Breakpoint / pointer-vs-touch behavior | `src/hooks/useIsDesktop.ts`, `VisualizerPanel.tsx` |
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
- New (header, next to Samples) → loads the valid empty-circuit template, closes
  the explorer, clears the sample highlight, and produces no error
- delete the entire editor (or leave only comments) → QASM/probabilities clear
  and no “must return a circuit” error appears
- copy/download produce `circuit.js`, `circuit.qasm`, `results.csv`, `circuit.svg`
- Visualizer fit modes + manual zoom (desktop)
- WebMCP dialog lists tools when the API is available (desktop only)
- **Desktop layout unchanged** at ≥1024 px (compare screenshots)
- mobile widths 320 / 375 / 390 / 430 px and landscape 844×390:
  - Editor + Circuit open by default; QASM/Results collapsed
  - opening a third panel evicts the oldest (max 2)
  - focus button makes a panel solo; pressing again restores Editor + Circuit
  - Samples opens a full-screen sheet and closes back to the same stack
  - gear menu exposes Autorun/Docs/GitHub; WebMCP is absent
  - no hover highlight fires on tap; visualizer defaults to fit width
  - no horizontal body scroll, no nested scroll traps, editor usable with the
    on-screen keyboard
  - `document.documentElement.scrollHeight <= window.innerHeight`

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
