# Implementation Memoirs

This file records architectural decisions, algorithms, and edge-case reasoning
for the QuantumJS monorepo. It exists so that future contributors do not have to
rediscover how non-trivial features were built.

## Where memoirs live

| Scope | File |
|---|---|
| `apps/bench` | [`apps/bench/MEMOIRS.md`](apps/bench/MEMOIRS.md) |
| `packages/quantumjs` (DSL, AST, QASM emitter) and cross-cutting decisions | this file |
| Other apps | `apps/<app>/MEMOIRS.md` |

Keep entries scoped: a feature that only affects one app belongs in that app's
memoir file. The root file keeps a short index below plus library/core entries.

### Index

- Bench interactivity (QASM line highlighting, progressive moment run), night
  theme, samples explorer, file operations — see
  [`apps/bench/MEMOIRS.md`](apps/bench/MEMOIRS.md).
- Core DSL entries — below.

---

## Core DSL: `rx`/`ry`/`rz` Gates & `pi.mult()`

**Date:** 2026-07-27
**Packages affected:** `packages/quantumjs`

### Problem

Two gaps were discovered when migrating real QASMBench circuits:

1. **Missing `rx`/`ry`/`rz` methods** on `QBitProxy` — only `u()` existed for
   parametric gates. Users had to write `Q.bit(0).u([theta, -PI/2, PI/2])`
   instead of the much cleaner `Q.bit(0).rx(theta)`.
2. **Missing `mult()` helper** — `div()` existed for `π/n` expressions but
   there was no way to express `π * n` without raw `Math.PI`.

### Implementation

**`rx`/`ry`/`rz`** — Added three methods to `QBitProxy` following the same
pattern as `u()`:

```typescript
rx(theta: number | AST.Expression) {
  const expr = typeof theta === 'number'
    ? { kind: 'Literal', value: theta } as AST.Literal
    : theta;
  return this.addGate('rx', undefined, [expr]);
}
// ry, rz — identical pattern
```

These emit native OpenQASM 3.0 `rx(theta) q[n];` which is defined in
`stdgates.inc`. For QASM 2.0 compatibility, downstream simulators may need
to handle these gates or decompose them to `u(theta, -pi/2, pi/2)`.

**`mult()`** — Added a standalone `mult()` function at module level, plus
`Q.π.mult()` and `Q.π.times()` (alias) on the Circuit's π proxy:

```typescript
export function mult(left: AST.Expression, right: number | AST.Expression) {
  return {
    kind: 'BinaryExpression',
    left,
    operator: '*',
    right: typeof right === 'number' ? { kind: 'Literal', value: right } : right,
  };
}
```

### Usage patterns

| Context | Expression |
|---------|-----------|
| Inside callback (π proxy) | `Q.π.div(2)` → `(pi / 2)`, `Q.π.mult(0.5)` → `(pi * 0.5)` |
| Inside callback (times alias) | `Q.π.times(0.75)` → `(pi * 0.75)` |
| Module level (standalone) | `div(pi, 2)`, `mult(pi, 0.5)` |
| Raw JS | `Math.PI / 2` |

### Caveat: `pi.mult()` does NOT exist at module level

The module-level `pi` export is a bare AST expression object (`{ kind:
'Identifier', name: 'pi' }`), not a wrapper with methods. Use `mult(pi, 0.5)`
instead. Inside the circuit callback, `Q.π.mult(0.5)` works because `π` is a
proxy object on the Circuit instance.

---

## Uppercase `U` Gate (QASM 3.0 Compliance)

**Date:** 2026-07-27
**Packages affected:** `packages/quantumjs`

### Problem

The universal gate was emitted as lowercase `u(theta, phi, lambda)` — which is
QASM 2.0 style. OpenQASM 3.0's `stdgates.inc` defines it as uppercase
`U(theta, phi, lambda)`. The `qasm-ts` parser (used by quirkvis-core's
`CircuitAnalyzer`) rejected lowercase `u` on multi-qubit gates like `cz`,
causing `MissingSemicolonError`.

### Fix

Changed the gate name literal in `QBitProxy.u()` from `'u'` to `'U'`:

```typescript
// Before:
return this.addGate('u', undefined, exprs);
// After:
return this.addGate('U', undefined, exprs);
```

This is safe for both QASM versions:
- **QASM 3.0**: `U` is the standard gate in `stdgates.inc`
- **QASM 2.0**: `U` is the primitive gate that `qelib1.inc`'s `u` wraps around

### Error handling in consumer code

`CircuitAnalyzer.analyze()` can throw on unrecognized QASM. Consumer call sites
in the Bench are wrapped with try/catch:

| File | Function | Fallback |
|------|----------|----------|
| `apps/bench/src/lib/qasmLineMap.ts` | `buildQasmLineMap()` | Empty Map (no highlighting) |
| `apps/bench/src/lib/qasmProgressive.ts` | `analyzeProgressive()` | `{ enabled: false }` |
| `apps/bench/src/lib/qasmProgressive.ts` | `truncateQasmAtMoment()` | Full QASM unchanged |

---

## Bench memoirs moved

**Date:** 2026-10-29

The Bench-specific entries that previously lived here (interactive circuit
visualizer, progressive circuit run, night mode, samples explorer, file
operations) were moved to [`apps/bench/MEMOIRS.md`](apps/bench/MEMOIRS.md).
From now on, each app keeps its own memoir file so the root file stays focused
on the library and cross-cutting decisions.
