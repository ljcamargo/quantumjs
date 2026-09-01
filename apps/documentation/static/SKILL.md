---
name: quantumjs
description: >
  Write, understand, and translate QuantumJS code — the expressive DSL
  for quantum circuit construction targeting OpenQASM 3.0. Covers circuit
  creation, every gate with exact QASM output, scoped layout staircases,
  measurement patterns, pipeline abstraction, custom functions, full
  algorithm library, and detailed translation from Qiskit and QASM into
  idiomatic QuantumJS.
---

# QuantumJS Skill

[QuantumJS](https://github.com/ljcamargo/quantumjs) is a modern quantum circuit
DSL for JavaScript/TypeScript. It compiles to OpenQASM 3.0 (with 2.0
compatibility) and features fluent chaining, context-aware loop scopes, and
structural pipelines.

---

## Table of Contents

- [Environment & Setup](#environment--setup)
- [Circuit Constructor](#circuit-constructor)
- [Qubit Selection](#qubit-selection)
- [Complete Gate Reference](#complete-gate-reference)
  - [Single-Qubit Gates](#single-qubit-gates)
  - [Rotation & Parametric Gates](#rotation--parametric-gates)
  - [Controlled Gates](#controlled-gates)
  - [Multi-Controlled Gates](#multi-controlled-gates)
  - [Special Operations](#special-operations)
- [Flexible Input](#flexible-input)
- [Measurement](#measurement)
- [Math Helpers (π expressions)](#math-helpers-π-expressions)
- [Scoped Layouts (Staircases)](#scoped-layouts-staircases)
  - [When to Use Each Staircase](#when-to-use-each-staircase)
  - [Nested Scopes (QFT Pattern)](#nested-scopes-qft-pattern)
- [Chaining Semantics](#chaining-semantics)
- [Custom Functions](#custom-functions)
- [Helper Functions Pattern](#helper-functions-pattern)
- [Conditionals](#conditionals)
- [Pipeline Abstraction](#pipeline-abstraction)
- [Comments & Breaks](#comments--breaks)
- [Full Algorithm Library](#full-algorithm-library)
- [Translation Guides](#translation-guides)
  - [Qiskit → QuantumJS](#qiskit--quantumjs)
  - [OpenQASM → QuantumJS](#openqasm--quantumjs)
  - [Full QFT Translation Walkthrough](#full-qft-translation-walkthrough)
- [Bench Environment](#bench-environment)
- [Idiomatic Style Guide](#idiomatic-style-guide)
- [Common Pitfalls](#common-pitfalls)

---

## Environment & Setup

### Installing as a library

```bash
npm install @quantum-js/dsl
```

```javascript
import { circuit, pipeline, pi, div, mult } from '@quantum-js/dsl';
```

### The Bench (live IDE)

The Bench at [quantumjs.netlify.app](https://quantumjs.netlify.app) is a
sandboxed eval environment. Only the `Quantum` global is available:

```javascript
// In the Bench, use Quantum.circuit() instead of circuit()
const c = Quantum.circuit({ qubits: 2 }, Q => {
  Q.bit(0).h();
  Q.all().measure();
});
return c;  // ← ALWAYS return the circuit
```

**Not available in the Bench:** `import`, `require`, `circuit()` bare function,
`pipeline()` bare function — use `Quantum.circuit()` and `Quantum.pipeline()`.

---

## Circuit Constructor

```javascript
// Minimum: just qubit count
circuit({ qubits: 3 }, Q => { ... });

// With explicit classical bits (defaults to 1)
circuit({ qubits: 3, bits: 3 }, Q => { ... });

// With QASM version override
circuit({ qubits: 3, version: '2.0' }, Q => { ... });
```

Compile:

```javascript
c.compile();                    // OpenQASM 3.0 (default)
c.compile({ version: '2.0' }); // OpenQASM 2.0
```

The callback naming convention is `Q` (for the `Circuit` instance):

```javascript
const c = circuit({ qubits: 2 }, Q => {
  // Q is the Circuit — all methods chain off it
});
```

---

## Qubit Selection

Every gate method is called on a **qubit proxy** — an object representing one
or more qubits:

```javascript
Q.bit(0);                        // Single qubit by index
Q.bits([0, 2, 3]);               // Multiple specific qubits
Q.all();                         // All qubits
Q.first();                       // Index 0
Q.last();                        // Index n-1
```

---

## Complete Gate Reference

Each entry shows the QuantumJS call and its exact OpenQASM 3.0 output.

### Single-Qubit Gates

| Method | QASM output | Notes |
|--------|-------------|-------|
| `Q.bit(i).h()` | `h q[i];` | Hadamard |
| `Q.bit(i).x()` | `x q[i];` | Pauli X (NOT) |
| `Q.bit(i).y()` | `y q[i];` | Pauli Y |
| `Q.bit(i).z()` | `z q[i];` | Pauli Z |
| `Q.bit(i).s()` | `s q[i];` | Phase (√Z) |
| `Q.bit(i).s_()` | `sdg q[i];` | S† (inverse phase) |
| `Q.bit(i).t()` | `t q[i];` | T (π/8, √S) |
| `Q.bit(i).t_()` | `tdg q[i];` | T† (inverse T) |
| `Q.bit(i).id()` | `id q[i];` | Identity |
| `Q.bit(i).reset()` | `reset q[i];` | Reset to \|0⟩ |

### Rotation & Parametric Gates

| Method | QASM output | Notes |
|--------|-------------|-------|
| `Q.bit(i).u([t, p, l])` | `U(t, p, l) q[i];` | Universal gate (3 Euler angles) |
| `Q.bit(i).rx(theta)` | `rx(theta) q[i];` | Rx rotation |
| `Q.bit(i).ry(theta)` | `ry(theta) q[i];` | Ry rotation |
| `Q.bit(i).rz(phi)` | `rz(phi) q[i];` | Rz rotation |

**Parameters** can be:
- Raw JS numbers: `Q.bit(0).rx(Math.PI / 2)`
- π expressions: `Q.bit(0).rx(Q.π.div(2))`
- Module-level: `Q.bit(0).rx(mult(pi, 0.5))` (requires `import { pi, mult }`)

### Controlled Gates

First argument is **always** the target qubit. Control comes from the proxy.

| Method | QASM output | Notes |
|--------|-------------|-------|
| `.cx(target)` | `cx q[ctrl], q[tgt];` | CNOT |
| `.cnot(target)` | `cx q[ctrl], q[tgt];` | Alias for cx |
| `.cy(target)` | `cy q[ctrl], q[tgt];` | Controlled-Y |
| `.cz(target)` | `cz q[ctrl], q[tgt];` | Controlled-Z |
| `.ch(target)` | `ch q[ctrl], q[tgt];` | Controlled-H |
| `.cp(target, theta)` | `cp(theta) q[ctrl], q[tgt];` | Controlled phase |
| `.cu1(target, theta)` | `cp(theta) q[ctrl], q[tgt];` | Alias for cp |
| `.swap(target)` | `swap q[a], q[b];` | Swap two qubits |

**Chained controlled gates** (control multiple targets):

```javascript
// Single control, multiple targets
Q.bit(0).cx(Q.bit(1)).cx(Q.bit(2));
// Output:
//   cx q[0], q[1];
//   cx q[0], q[2];

// Multi-control with .bits()
Q.bits([0, 1]).cx(Q.bits([2, 3]));
// Output:
//   cx q[0], q[2];
//   cx q[1], q[3];
```

**Self-control is silently skipped**: `Q.bit(0).cx(Q.bit(0))` produces nothing.

### Multi-Controlled Gates

| Method | QASM output | Notes |
|--------|-------------|-------|
| `.ccx(b, c)` | `ccx q[a], q[b], q[c];` | Toffoli gate |
| `.toffoli(b, c)` | `ccx q[a], q[b], q[c];` | Alias for ccx |

**Argument order:** The calling proxy is the first control, `b` is the second
control, `c` is the target:

```javascript
Q.bit(0).ccx(Q.bit(1), Q.bit(2));
// => ccx q[0], q[1], q[2];
```

**Overlapping qubits are silently skipped:** `Q.bit(0).ccx(Q.bit(1), Q.bit(0))`
produces nothing (control and target cannot be the same qubit).

### Special Operations

```javascript
Q.barrier();                    // barrier all qubits
Q.barrier([0, 1]);              // barrier q[0], q[1]
```

**`repeat` helper** — applies a gate multiple times:

```javascript
Q.bit(0).repeat(3, 'h');        // h q[0]; × 3
```

---

## Flexible Input

The `input()` method prepares initial state without manual X gates:

```javascript
Q.input("101");                 // X on q[0], q[2]  (big-endian default)
Q.input("101", { endian: 'little' }); // X on q[0], q[1]
Q.input("XXIZI");               // Pauli string (I = identity, skipped)
Q.input(['X', 'H', 'S']);       // Explicit gate array
Q.input((Q) => { Q.bit(0).h(); Q.bit(1).x(); }); // Callback form
```

**Behavior:** `0` and `I` are always skipped (ground state → no gate needed).
`1` maps to `X`, other letters map to their corresponding gate.

---

## Measurement

```javascript
// Single qubit → single classical bit
Q.bit(0).measure();              // q[0] → c[0]
Q.bit(1).measureTo(0);           // q[1] → c[0] (explicit target)
Q.bit(1).measureTo(cbit);        // q[1] → cbit (CBitProxy target)

// All qubits → all classical bits (one-to-one)
Q.all().measure();               // c = measure q;

// Basis transformations (tomography)
Q.bit(0).measureX();             // H + measure  (X basis)
Q.bit(0).measureY();             // S† + H + measure  (Y basis)
Q.bit(0).measureZ();             // measure  (Z basis, default)
Q.bit(0).measureW();             // S + H + T + H + measure  (W basis)
Q.bit(0).measureV();             // S + H + T† + H + measure
```

---

## Math Helpers (π expressions)

Two levels of π arithmetic:

### Inside the circuit callback (via `Q.π`)

```javascript
Q.bit(0).rz(Q.π.div(4));         // (pi / 4)
Q.bit(0).rx(Q.π.mult(0.5));      // (pi * 0.5)
Q.bit(0).ry(Q.π.times(0.75));    // (pi * 0.75) — times is an alias for mult
```

### At module level (standalone functions)

```javascript
import { pi, div, mult } from '@quantum-js/dsl';

Q.bit(0).rz(div(pi, 2));         // (pi / 2)
Q.bit(0).rx(mult(pi, 0.25));     // (pi * 0.25)
```

**Important:** `pi` at module level is a bare AST expression object, not a
wrapper — `pi.mult()` does NOT exist. Use `mult(pi, 0.5)` instead.

---

## Scoped Layouts (Staircases)

Context-aware loops that dynamically manage sizes, offsets, and iteration
context. These are QuantumJS's most idiomatic feature.

Each scope provides these context properties:
- **`q.iteration`** — absolute qubit index of the current sub-circuit's active qubit
- **`q.size`** — number of qubits in the current sub-circuit
- **`q.offset`** — starting qubit index of this sub-circuit
- **`q.parentSpan`** — total qubits in the parent circuit
- **`q.inverseSpan`** — distance from the bottom of the parent circuit

### growDown — Top-aligned, growing

```javascript
// Starts with 1 qubit at top, grows toward bottom
Q.growDown(q => {
  q.first().cx(q.last());
});
// Iterations: size=1, size=2, ..., size=n
```

### growUp — Bottom-aligned, growing

```javascript
// Starts with 1 qubit at bottom, grows toward top
Q.growUp(q => {
  q.first().cx(q.last());
});
// Iterations: size=1, size=2, ..., size=n (bottom-aligned)
```

### shrinkUp — Top-aligned, shrinking

```javascript
// Starts with n qubits at top, shrinks toward bottom
Q.shrinkUp(q => {
  q.last().h();
});
// Iterations: size=n, size=n-1, ..., size=1
```

### shrinkDown — Bottom-aligned, shrinking

```javascript
// Starts with n qubits at bottom, shrinks toward top
Q.shrinkDown(q => {
  q.last().h();
});
// Iterations: size=n, size=n-1, ..., size=1 (bottom-aligned)
```

### When to Use Each Staircase

| Pattern | Use | Example |
|---------|-----|---------|
| Controlled gates cascade growing from top | `growDown` | CNOT ladder: cx(0,1), cx(0,2), cx(0,3) |
| Controlled gates cascade growing from bottom | `growUp` | CNOT ladder bottom-anchored |
| Rotations shrinking from the top | `shrinkUp` | QFT — most significant qubit first |
| Rotations shrinking from the bottom | `shrinkDown` | Inverse QFT |

### Nested Scopes (QFT Pattern)

Nesting staircases creates the canonical QFT structure. The outer scope
iterates over qubits from most-to-least significant. The inner scope applies
controlled phase rotations to all previously-iterated qubits:

```javascript
Q.shrinkUp(q => {
  Q.shrinkDown(r => {
    if (r.iteration < q.iteration) {
      r.last().cp(
        r.first(),
        Q.π.div(2 ** (1 + q.iteration - r.iteration))
      );
    }
  });
  q.last().h().brk();
});
```

**What this produces (4 qubits):**
```
h q[3];                              ← shrinkUp iteration 0
cp(pi/2) q[3], q[2];                 ← shrinkDown r.iteration=0, q.iteration=1
h q[2];
cp(pi/4) q[3], q[1];                 ← shrinkDown r.iteration=0, q.iteration=2
cp(pi/2) q[2], q[1];
h q[1];
cp(pi/8) q[3], q[0];                 ← shrinkDown r.iteration=0, q.iteration=3
cp(pi/4) q[2], q[0];
cp(pi/2) q[1], q[0];
h q[0];
```

### Loop Helper (simple repeat, no staircase context)

```javascript
Q.loop(4, q => {
  q.bit(0).h().cx(q.bit(1));
});
```

---

## Chaining Semantics

Each gate method returns the same qubit proxy, so operations compose linearly:

```javascript
// Single qubit, sequential gates:
Q.bit(0).h().x().y().z();
// => h q[0];  x q[0];  y q[0];  z q[0];

// Multiple qubits via .bits():
Q.bits([0, 2]).x().y();
// => x q[0];  x q[2];  y q[0];  y q[2];
// Each gate in the chain applies to ALL selected qubits

// Mixed single and controlled:
Q.bit(0).h().cx(Q.bit(1)).measure();
// => h q[0];  cx q[0], q[1];  measure q[0] -> c[0];
```

---

## Custom Functions

Register reusable functions on the circuit instance:

```javascript
const c = circuit({ qubits: 4 }, Q => {
  Q.addFunction('swapGate', (q, a, b) => {
    q.bit(a).cx(q.bit(b));
    q.bit(b).cx(q.bit(a));
    q.bit(a).cx(q.bit(b));
  });

  Q.fnc.swapGate(0, 1);    // Use it
  Q.fnc.swapGate(2, 3);    // Reuse it
});
```

---

## Helper Functions Pattern

For complex circuits, define external helpers that take `Q` as a parameter.
This is the pattern used by QASMBench-migrated circuits:

```javascript
// --- Helper definitions (outside circuit callback, at module level) ---

function rx(Q, qubit, theta) {
  Q.bit(qubit).u([theta, -Math.PI / 2, Math.PI / 2]);
}
function ry(Q, qubit, theta) {
  Q.bit(qubit).u([theta, 0, 0]);
}
function rz(Q, qubit, phi) {
  Q.bit(qubit).u([0, 0, phi]);
}
function u3(Q, qubit, theta, phi, lambda) {
  Q.bit(qubit).u([theta, phi, lambda]);
}

// Composed decomposition (e.g. PhasedISWAP):
function phasedISWAP(Q, a, b, k) {
  const p = Math.PI;
  rz(Q, a, p * 0.25);
  rz(Q, b, p * -0.25);
  Q.bit(a).cx(Q.bit(b));
  Q.bit(a).h();
  Q.bit(b).cx(Q.bit(a));
  rz(Q, a, p * k);
  Q.bit(b).cx(Q.bit(a));
  rz(Q, a, p * -k);
  Q.bit(a).h();
  Q.bit(a).cx(Q.bit(b));
  rz(Q, a, p * -0.25);
  rz(Q, b, p * 0.25);
}

// --- Circuit using helpers ---
const c = circuit({ qubits: 4 }, Q => {
  phasedISWAP(Q, 0, 1, -0.5);
  phasedISWAP(Q, 2, 3, 0.5);
  Q.all().measure();
});
```

This pattern is essential for translating Cirq/Qiskit circuits that use
decompositions of gates like `PhasedISWAP`, `ZZ**k`, `YY**k`, etc.

---

## Conditionals

```javascript
// Post-measurement conditional
Q.bit(0).measure();
Q.bit(1).x()._if(Q.cbit(0));          // X on q[1] if c[0] == 1

// Block-style
Q.bit(1)._if(Q.cbit(0), q => q.x());

// Inverse condition
Q.bit(1).x()._if(Q.cbit(0).isFalse()); // X on q[1] if c[0] == 0
```

**Important:** The `_if()` conditions the **preceding** gate when used without
a callback. With a callback, the condition wraps the callback body.

---

## Pipeline Abstraction

```javascript
import { pipeline } from '@quantum-js/dsl';

const job = pipeline(
  { qubits: 3 },
  "101",                    // Input stage
  Q => Q.all().measure(),   // Output stage
  Q => {
    // Core algorithm
    Q.bit(0).cx(Q.bit(1));
  }
);

job.compile();              // Full QASM
job.run(simulator);         // Simulate
```

---

## Comments & Breaks

```javascript
Q.comment("3-bit Quantum Fourier Transform");  // => // 3-bit Quantum Fourier Transform
Q.brk();                                         // => //  (empty comment line)
```

Uses: annotating algorithm stages, visual separation in the QASM output.

---

## Expressiveness Spectrum

QuantumJS supports multiple levels of expressiveness. Choose the style that
matches the user's needs.

### Level 1: Idiomatic (staircases, `input()`, high-level)

Best for clean, maintainable circuits. Uses scoped layouts, `input()`, and
fluent chaining. This is the **preferred style**.

```javascript
// 4-qubit QFT — fully idiomatic
const c = circuit({ qubits: 4 }, Q => {
  Q.input("1011");
  Q.barrier();
  Q.shrinkUp(q => {
    Q.shrinkDown(r => {
      if (r.iteration < q.iteration) {
        r.last().cp(
          r.first(),
          Q.π.div(2 ** (1 + q.iteration - r.iteration))
        );
      }
    });
    q.last().h().brk();
  });
  Q.barrier();
  Q.all().measure();
});
return c;
```

### Level 2: Gate-by-gate (QASM-like, explicit)

Best for direct translations from QASM or Qiskit, or when the user wants to
see the exact gate sequence. Uses explicit index-based operations.

```javascript
// Same 4-qubit QFT — explicit, gate-by-gate
const c = circuit({ qubits: 4 }, Q => {
  Q.bit(3).h();
  Q.bit(2).cp(Q.bit(3), Q.π.div(8));
  Q.bit(2).h();
  Q.bit(1).cp(Q.bit(3), Q.π.div(16));
  Q.bit(1).cp(Q.bit(2), Q.π.div(8));
  Q.bit(1).h();
  Q.bit(0).cp(Q.bit(3), Q.π.div(32));
  Q.bit(0).cp(Q.bit(2), Q.π.div(16));
  Q.bit(0).cp(Q.bit(1), Q.π.div(8));
  Q.bit(0).h();
  Q.all().measure();
});
return c;
```

### When to use each level

| User request | Style | Rationale |
|---|---|---|
| "Translate this QASM" | Level 2 (gate-by-gate) | Mirrors the source structure, easy to verify |
| "Write a QFT circuit" | Level 1 (idiomatic) | Shorter, intent-revealing, maintainable |
| "Translate this Qiskit code" | Level 2 (gate-by-gate) | Direct mapping from Qiskit calls |
| "Optimize / refactor this circuit" | Level 1 (idiomatic) | Scoped layouts often produce cleaner structure |
| "Educational / tutorial" | Both | Show both styles so the user learns the range |

**Rule of thumb:** default to Level 1 (idiomatic) unless the user explicitly
asks for a literal QASM translation or provides QASM/Qiskit source.

---

## Translation Guides

### Qiskit → QuantumJS

| Qiskit | QuantumJS |
|--------|-----------|
| `QuantumCircuit(2, 2)` | `circuit({ qubits: 2, bits: 2 }, Q => { ... })` |
| `qc.h(0)` | `Q.bit(0).h()` |
| `qc.x(0)` | `Q.bit(0).x()` |
| `qc.y(0)` | `Q.bit(0).y()` |
| `qc.z(0)` | `Q.bit(0).z()` |
| `qc.s(0)` | `Q.bit(0).s()` |
| `qc.sdg(0)` | `Q.bit(0).s_()` |
| `qc.t(0)` | `Q.bit(0).t()` |
| `qc.tdg(0)` | `Q.bit(0).t_()` |
| `qc.cx(0, 1)` | `Q.bit(0).cx(Q.bit(1))` |
| `qc.cy(0, 1)` | `Q.bit(0).cy(Q.bit(1))` |
| `qc.cz(0, 1)` | `Q.bit(0).cz(Q.bit(1))` |
| `qc.ch(0, 1)` | `Q.bit(0).ch(Q.bit(1))` |
| `qc.swap(0, 1)` | `Q.bit(0).swap(Q.bit(1))` |
| `qc.ccx(0, 1, 2)` | `Q.bit(0).ccx(Q.bit(1), Q.bit(2))` |
| `qc.rz(pi/2, 0)` | `Q.bit(0).rz(Q.π.div(2))` |
| `qc.rx(pi/2, 0)` | `Q.bit(0).rx(Q.π.div(2))` |
| `qc.ry(pi/2, 0)` | `Q.bit(0).ry(Q.π.div(2))` |
| `qc.cp(pi/2, 0, 1)` | `Q.bit(0).cp(Q.bit(1), Q.π.div(2))` |
| `qc.u(pi, pi/2, 0, 0)` | `Q.bit(0).u([Math.PI, Math.PI/2, 0])` |
| `qc.measure(0, 0)` | `Q.bit(0).measureTo(0)` or `Q.bit(0).measure()` |
| `qc.measure_all()` | `Q.all().measure()` |
| `qc.barrier()` | `Q.barrier()` |
| `qc.reset(0)` | `Q.bit(0).reset()` |
| `qc.x(0).c_if(c, 1)` | `Q.bit(0).x()._if(Q.cbit(0))` |
| `initialize('101', [0,1,2])` | `Q.input("101")` |
| `for i in range(n):` | `Q.loop(n, q => { ... })` or JS `for` loop |

**High-level pattern mapping:**

| Qiskit concept | QuantumJS alternative |
|----------------|----------------------|
| `with qc.if_test( ... )` | `Q.bit(0)._if(Q.cbit(0), q => q.x())` |
| `qc.append(custom_gate, [q0, q1])` | `Q.fnc.myGate(0, 1)` after `Q.addFunction(...)` |
| `QuantumCircuit.compose()` | Pipeline or `sub()` scopes |
| `qc.initialize()` | `Q.input()` |
| `AerSimulator.run(qc)` | Pipeline's `.run(simulator)` |

### OpenQASM → QuantumJS

| OpenQASM 3.0 | QuantumJS |
|--------------|-----------|
| `h q[0];` | `Q.bit(0).h()` |
| `x q[0];` | `Q.bit(0).x()` |
| `y q[0];` | `Q.bit(0).y()` |
| `z q[0];` | `Q.bit(0).z()` |
| `s q[0];` | `Q.bit(0).s()` |
| `sdg q[0];` | `Q.bit(0).s_()` |
| `t q[0];` | `Q.bit(0).t()` |
| `tdg q[0];` | `Q.bit(0).t_()` |
| `id q[0];` | `Q.bit(0).id()` |
| `reset q[0];` | `Q.bit(0).reset()` |
| `U(theta, phi, lambda) q[0];` | `Q.bit(0).u([theta, phi, lambda])` |
| `rx(theta) q[0];` | `Q.bit(0).rx(theta)` |
| `ry(theta) q[0];` | `Q.bit(0).ry(theta)` |
| `rz(phi) q[0];` | `Q.bit(0).rz(phi)` |
| `cx q[0], q[1];` | `Q.bit(0).cx(Q.bit(1))` |
| `cy q[0], q[1];` | `Q.bit(0).cy(Q.bit(1))` |
| `cz q[0], q[1];` | `Q.bit(0).cz(Q.bit(1))` |
| `ch q[0], q[1];` | `Q.bit(0).ch(Q.bit(1))` |
| `cp(theta) q[0], q[1];` | `Q.bit(0).cp(Q.bit(1), theta)` |
| `swap q[0], q[1];` | `Q.bit(0).swap(Q.bit(1))` |
| `ccx q[0], q[1], q[2];` | `Q.bit(0).ccx(Q.bit(1), Q.bit(2))` |
| `measure q[0] -> c[0];` | `Q.bit(0).measure()` or `Q.bit(0).measureTo(0)` |
| `c[0] = measure q[0];` | `Q.bit(0).measure()` |
| `barrier q[0], q[1];` | `Q.barrier([0, 1])` |
| `if (c == 1) x q[0];` | `Q.bit(0).x()._if(Q.cbit(0))` |
| `// comment` | `Q.comment("comment")` |

### Full QFT Translation Walkthrough

**QASM input:**
```qasm
OPENQASM 3.0;
include "stdgates.inc";
qubit[3] q;
bit[3] c;
h q[2];
cp(pi/2) q[2], q[1];
h q[1];
cp(pi/4) q[2], q[0];
cp(pi/2) q[1], q[0];
h q[0];
c = measure q;
```

**Step-by-step translation:**

| QASM line | Translation | Reasoning |
|-----------|-------------|-----------|
| `h q[2];` | `Q.bit(2).h()` | Direct: `.h()` on qubit 2 |
| `cp(pi/2) q[2], q[1];` | `Q.bit(2).cp(Q.bit(1), Q.π.div(2))` | `.cp(target, theta)`, control is the proxy's qubit |
| `h q[1];` | `Q.bit(1).h()` | Direct |
| `cp(pi/4) q[2], q[0];` | `Q.bit(2).cp(Q.bit(0), Q.π.div(4))` | Control q[2], target q[0] |
| `cp(pi/2) q[1], q[0];` | `Q.bit(1).cp(Q.bit(0), Q.π.div(2))` | Control q[1], target q[0] |
| `h q[0];` | `Q.bit(0).h()` | Direct |
| `c = measure q;` | `Q.all().measure()` | Measure all |

**Result:**
```javascript
const c = circuit({ qubits: 3 }, Q => {
  Q.bit(2).h();
  Q.bit(2).cp(Q.bit(1), Q.π.div(2));
  Q.bit(1).h();
  Q.bit(2).cp(Q.bit(0), Q.π.div(4));
  Q.bit(1).cp(Q.bit(0), Q.π.div(2));
  Q.bit(0).h();
  Q.all().measure();
});
```

**Idiomatic improvement (using staircases):**
```javascript
const c = circuit({ qubits: 3 }, Q => {
  Q.shrinkUp(q => {
    Q.shrinkDown(r => {
      if (r.iteration < q.iteration) {
        r.last().cp(r.first(),
          Q.π.div(2 ** (1 + q.iteration - r.iteration)));
      }
    });
    q.last().h().brk();
  });
  Q.all().measure();
});
```

---

## Bench Environment

When writing code for the Bench:

1. **Use `Quantum.circuit(...)`** not bare `circuit(...)`. Only `Quantum` is global.
2. **Always `return c;`** — the Bench expects the circuit object back.
3. **All samples use `.js` extension** — they're regular JavaScript, no special dialect.
4. **Samples are registered** in `src/sampleRegistry.ts`. Each entry needs an import + path.
5. **Samples live** in `src/samples/` — the raw-loader is scoped to that directory.

---

## Idiomatic Style Guide

1. **Prefer staircases over for-loops** for QFT, IQFT, and triangular structures.
2. **Use `Q.input()`** instead of manual X gates for binary state prep.
3. **Chain calls** where natural: `Q.bit(0).h().cx(Q.bit(1)).measure()`.
4. **Use `Q.all()`** for operations on every qubit.
5. **Name the circuit callback parameter `Q`** by convention.
6. **Always `return c;`** at the end.
7. **Use `Q.π.div(n)` and `Q.π.mult(n)`** over raw `Math.PI / n` for readable QASM.
8. **Wrap decompositions in helper functions** for circuits with repeated gate patterns.
9. **Use `Q.comment()`** to label algorithm stages.
10. **Prefer explicit qubit indices** over hard-to-read `.bits()` on large selections.

---

## Common Pitfalls

| Pitfall | Why | Fix |
|---------|-----|-----|
| `Q.bit(0).cx(Q.bit(1)).cx(Q.bit(0))` | Second cx has ctrl=q[0], tgt=q[0] — skipped | Ensure target != control |
| `Q.bits([0,1]).cx(Q.bits([0,1]))` | Self-mapping: cx(0,0) and cx(1,1) — both skipped | Use `Q.all().cx(Q.bit(0))` for broadcast to single target |
| Using `pi.mult(0.5)` at module level | `pi` is a bare AST object, not a wrapper | Use `mult(pi, 0.5)` or inside callback `Q.π.mult(0.5)` |
| Forgetting `return c;` in the Bench | Bench needs the circuit object | Always end with `return c;` |
| Importing in the Bench | `import` is not available | Use `Quantum.circuit()` instead |
| Using `.quantumjs` extension | Misleading — looks like a custom dialect | Use `.js` extension |
| Expecting `u(...)` in QASM output | Lowercase `u` is QASM 2.0 style | The DSL emits `U(...)` (uppercase, QASM 3.0) |
