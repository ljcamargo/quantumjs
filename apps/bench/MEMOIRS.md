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

## Bench Internationalization (English / Spanish)

**Date:** 2026-10-29
**Packages affected:** `apps/bench`

### Problem

The Bench UI was hardcoded in English. We needed a language preference that can
be selected explicitly, auto-detected from the browser, and remembered — while
switching language without reloading or losing editor/simulation state.

### Architecture

```
I18nProvider (client, in src/app/providers.tsx)
  ├─ preference: 'auto' | 'en' | 'es'   localStorage bench:language:v1
  ├─ locale: resolved from preference or navigator.languages
  ├─ t(key, {vars})                     typed flat message keys
  └─ formatPercent(value)               Intl.NumberFormat(locale)
        │
        ├─ page header, panels, visualizer, WebMCP dialog
        ├─ useSimulator (errors, via tRef)
        └─ useProgressive (moment label)
```

- **No URL routing.** The Bench is a single client page; path-based locales
  would risk remounting on switch and losing editor/run state. Path-style
  locales are reserved for the Docusaurus docs.
- `src/i18n/messages/en.ts` is the key source of truth; `es.ts` is typed as
  `Record<MessageKey, string>`, so missing/extra keys fail TypeScript.
- Resolution order: explicit preference → `navigator.languages` base match →
  English. `auto` re-detects on load and listens to `languagechange`.
- Default preference is `auto`; selecting a language writes it to
  `localStorage`. Explicit choices win on later visits.
- `<html lang>` is updated in an effect. Static HTML is English, so an
  auto-detected Spanish first visit can briefly show English before hydration;
  accepted for now.

### Decisions

- **In-house, zero-dependency layer** rather than next-intl/i18next: ~60 UI
  strings, two locales, one client page. Message modules keep a later migration
  mechanical.
- **Translate UI chrome only**: labels, titles, aria-labels, empty/status
  states, moment labels, percentage formatting, and Bench-originated errors.
  Code, samples, QASM, filenames, CSV headers, brand names, MCP tool
  names/descriptions/schemas, agent-facing errors, and console logs stay
  English/language-neutral.
- **Percentages localized, data not**: `Intl.NumberFormat` produces Spanish
  `50,0 %`; `resultsToCsv()` keeps dot decimals and `state,probability_pct`.
- **Terms:** `qubit` stays `qubit`; gate → `compuerta`; rerun → `reejecutar`;
  autorun → `autoejecutar`; circuit visualizer → `Visor del circuito`; neutral
  Spanish with infinitive actions.
- **Header space:** the desktop right-side cluster uses a single `gap-2`; no
  per-button `mx-*`/`ml-*` margins. WebMCP is indicator + logo only, GitHub is
  icon-only (label remains in the mobile menu), Docs is `Docs` in both languages.
- **Switcher placement:** desktop globe popover (`LanguageMenu`), mobile section
  in the gear menu (`HeaderMenu`). Both share `LanguageOptions`.
- **Simulator:** `useSimulator` keeps the latest `t` in a ref. If `execute`
  depended on `t`, every language switch would change the callback and trigger
  autorun again; the ref avoids recompiling. The result carries both `error`
  (localized UI) and `errorEn` (English for MCP/agents).

### Edge cases

- Invalid/missing stored preference → fall back to `auto`.
- `localStorage` unavailable (private mode) → auto-detect still works; the
  choice is not persisted.
- The provider applies the restored preference in a 0 ms task, avoiding a
  hydration mismatch and React's set-state-in-effect lint rule.
- An error already displayed is not retro-translated when the language changes;
  it updates on the next run. (Storing error codes would be the upgrade path.)
- Moment labels rebuild on locale change because `useProgressive` includes `t`
  in its memo dependencies.
- `LanguageMenu` forced the header to keep `z-40` on desktop as well, so its
  popover paints above the panel stack.

### Future

- Docs i18n with Docusaurus native locales (`en`, `es`, navbar locale dropdown,
  `i18n/es/**`, `write-translations`) — deliberately not included here.
- More Bench locales: add to `config.ts` and a new `messages/<locale>.ts`.
- If SEO/no-flicker SSR becomes required, move the Bench to path-based locales
  and persist editor state across navigation.

---

## Netlify/Bun Build: `ajv` Resolution in `next.config.ts`

**Date:** 2026-10-29
**Packages affected:** `apps/bench`, root `package.json`

### Problem

Netlify (Bun install) failed before compiling:

```
Error: Cannot find module 'ajv/dist/compile/codegen'
  ajv-formats/dist/limit.js
  schema-utils/dist/validate.js
  terser-webpack-plugin/dist/index.js
  apps/bench/next.config.compiled.js
```

`next.config.ts` imported `terser-webpack-plugin` to set
`keep_classnames`/`keep_fnames` for `quantum-circuit`. That plugin's
`schema-utils → ajv-formats` requires `ajv@8`, but the monorepo also needs
`ajv@6` (eslint, `schema-utils@3`, loaders) and Bun hoisted v6 to the repo root.
Node resolution from the root `ajv-formats` then found v6, which has no
`dist/compile/codegen`. npm's local install had a nested `ajv@8`; Bun's did not.

### Fix

- Next 16 already supports the same behavior through its built-in minifier:
  `next build --webpack --no-mangling`. Internally this sets
  `keep_classnames: true` / `keep_fnames: true`, so `quantum-circuit` keeps the
  names it needs. The build script now uses it.
- Removed the custom `TerserPlugin` from `next.config.ts` and the now-unused
  root `terser-webpack-plugin` devDependency. `next.config.ts` only does Node
  polyfills + the scoped raw-loader again.
- Verified the production client chunk still contains `QASMParser`,
  `QASMLexer`, and `MainprogContext`.

### Gotcha

Do **not** reintroduce a custom terser/minimizer plugin in `next.config.ts`
without solving ajv hoisting at the workspace level. The supported path is the
`--no-mangling` flag; it removes the fragile config-time module resolution
entirely. Any build command change must keep `--webpack --no-mangling`.

---

## New-file Template & Empty-document Guard

**Date:** 2026-10-29
**Packages affected:** `apps/bench`

### Problem

Pressing **New** cleared the editor. Autorun then evaluated the empty string
and surfaced “Code must return a Quantum.Circuit object”, even though nothing
was wrong — the document was simply new/empty.

### Change

- **New inserts a template** (`NEW_FILE_TEMPLATE` in `src/lib/source.ts`):
  a valid `Quantum.circuit({ qubits: 2, bits: 2 })` scaffold with commented
example gates and `return c;`. The autorun therefore produces an empty circuit
  instead of an error.
- **Blank sources are not evaluated.** `hasExecutableCode()` strips block and
  line comments, then checks for remaining non-whitespace. If nothing is left,
  `useSimulator.execute()` clears `qasm3`, `qasm2`, `probabilities`, and
  `error` and resolves immediately. This also covers a user deleting the
  template or leaving only comments.
- **New moved to the header**, next to Samples. New/Open are document lifecycle
  actions; Copy/Download remain in the editor panel header as content actions.
  `useFileActions` accepts an optional `onNew` callback so the page can clear
  `activeSamplePath` (no stale sample highlight after starting a new file).

### Edge cases

- Comment-only documents are treated as empty (no compile, no error).
- `//` inside a string can be stripped by the heuristic, but any real statement
  remaining keeps the document executable; nothing valid is skipped.
- MCP `compile_simulate_draw` with empty code returns empty QASM/probabilities
  and `error: null` rather than a misleading circuit-return error.

---

## Mobile polish pass

**Date:** 2026-10-29
**Packages affected:** `apps/bench`

### Changes

- **Header identity & spacing:** kept the `QuantumJS` brand label next to the
  mark on mobile ("Bench" is the surface name, not the brand; desktop still
  shows `QuantumJS [Bench]`), restored left padding so the left edge
  balances the right-side controls, and hid the desktop `QuantumJS` title as
  before.
- **Logo crop:** the SVG is a white glyph inside a full-bleed circle, so the
  apparent padding is inside the asset. On mobile the image is scaled 1.35× and
  clipped to a circular 20px mask: the circle edge stays put while the glyph
  fills it. Desktop keeps the original 16px, un-scaled mark.
- **Icon-only mobile controls:** the Samples button drops its background/chrome
  and shows just the folder icon (cyan when open). Run/Rerun becomes a 36px
  icon-only control with no background; when autorun is on it uses `RotateCw`
  (replay semantics) instead of the play triangle. Desktop keeps the bordered
  buttons and labels unchanged.
- **Gear menu stacking:** the header is now `relative z-40` on mobile. Its
  `backdrop-blur` stacking context previously painted below the panel stack, so
  the dropdown was partially hidden behind panels. The full-screen Explorer
  sheet stays `z-50` so it still covers the header.
- **Mobile panel order:** changed to **Editor → QASM → Circuit → Results** so
  the generated QASM sits directly under the source that produced it, before
  the circuit diagram. Desktop placement is unchanged (grid areas).
- **Editor text size:** 14 px on mobile instead of 16 px. iOS Safari auto-zooms
  focused inputs below 16 px, so an `@supports (-webkit-touch-callout: none)`
  rule keeps 16 px on iOS only; other mobile browsers and DevTools get 14 px.

---

## Responsive Mobile Shell (CodePen-style panel stack)

**Date:** 2026-10-29
**Packages affected:** `apps/bench`

### Problem

The Bench was desktop-only: a hard-coded 40/60 flex split with `h-screen` and
nested scroll containers. On phones every panel was squeezed side by side,
the header overflowed, and hover-only features were unreachable.

### Decisions

- Breakpoint: **`lg` = `64rem` / 1024 px**. Below it the desktop grid leaves
  the QASM column under ~360 px, so tablet portrait uses the stack and tablet
  landscape uses the console.
- **One DOM, two arrangements.** Panels are direct children of
  `main.bench-main`, always in mobile order (Editor → QASM → Circuit →
  Results). `.bench-main` is a flex column by default and a CSS grid at `lg`;
  grid areas map the same nodes into the console. QuirkVis/editor never mount
  twice.
- **Mobile stack:** `useMobilePanels` keeps at most two panels open, evicting
  the least-recently-expanded when a third opens. Default is Editor + Circuit;
  state persists in `localStorage` (`bench:mobilePanels:v1`) and is restored
  after mount to keep SSR/hydration clean. Collapsed panels are header-only;
  open panels share the remaining height (`flex: 1 1 0%`, `min-height: 0`).
  A focus button makes one panel solo, and pressing it again restores the
  default pair.
- **One scroll region per panel.** `Panel` content is `overflow-hidden`; the
  panel body owns the only scroller. Root is `.bench-shell` (`100dvh` with a
  `100vh` fallback) and never scrolls,
  with `env(safe-area-inset-bottom)`.
- **Header:** mobile hides the title and WebMCP entirely, keeps icon + Samples
  + Run, and moves Autorun/Docs/GitHub into a gear menu (`HeaderMenu`). Desktop
  header untouched.
- **Explorer:** same `SamplesPanel`; desktop replaces the editor slot, mobile
  renders it as a full-screen `fixed inset-0` sheet.
- **Hover is pointer-only.** `useIsDesktop` gates `interactive`/`onHover` on
  QuirkVis, so touch devices have no hover side effects. Mobile defaults to
  **fit width** (desktop keeps `fit both`); fit/zoom controls are hidden on
  mobile for now.
- Desktop seams were reproduced with a 1 px `gap` + border-tinted background
  on the grid, because the old layout had wrapper borders in addition to the
  panel borders.

### Edge cases handled

- Hydration: the media-query hook uses a server snapshot of “desktop”; mobile
  behavior switches immediately after hydration without a mismatch. Mobile
  panel state is restored in a task, not synchronously in an effect (lint).
- `hidden` vs `flex`: Tailwind emits `.hidden` after `.flex`, so the explorer
  stays `hidden` until `showSamples` removes it. `lg:`/`max-lg:` variants are
  aligned with the 64rem breakpoint.
- Tall SVGs: the visualizer scroller uses `m-auto` for centering instead of
  flex `items-center`, so overflowing content remains reachable from the top.
- Explorer/mobile overlay keeps the editor mounted underneath, preserving
  undo/document state while browsing samples.

### Not included (future)

- Moment stepper and tap-to-pin for QASM/moment focusing on touch.
- Mobile fit/zoom controls.
- Bloch sphere / agentic / richer file explorer panels. New panels must add a
  `PanelId`, a grid area, and a single scroll region (see `AGENTS.md`).

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

Constraints agreed for the mobile work (see the responsive shell entry above,
where they were implemented):

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
