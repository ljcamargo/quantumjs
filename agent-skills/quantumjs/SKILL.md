---
name: quantumjs
description: >
  Write, understand, and translate QuantumJS code — the expressive DSL
  for quantum circuit construction targeting OpenQASM 3.0. Covers circuit
  creation, gate operations, scoped layouts, measurement, pipelines, and
  translation from Qiskit and QASM into idiomatic QuantumJS.
---

# QuantumJS Skill

[QuantumJS](https://github.com/ljcamargo/quantumjs) is a modern quantum circuit
DSL for JavaScript/TypeScript. It compiles to compliant OpenQASM 3.0 (with 2.0
compatibility) and features fluent chaining, context-aware loop scopes, and
structural pipelines.

---

## Table of Contents

- [Installation](#installation)
- [Basic Circuit](#basic-circuit)
- [Gate Reference](#gate-reference)
- [Flexible Input](#flexible-input)
- [Measurement](#measurement)
- [Scoped Layouts (Staircases)](#scoped-layouts-staircases)
- [Qubit Selection](#qubit-selection)
- [Custom Functions](#custom-functions)
- [Pipeline Abstraction](#pipeline-abstraction)
- [Conditionals](#conditionals)
- [Common Algorithms](#common-algorithms)
- [Translation Guides](#translation-guides)
  - [Qiskit → QuantumJS](#qiskit--quantumjs)
  - [OpenQASM → QuantumJS](#openqasm--quantumjs)

---

## Installation

```bash
npm install @quantum-js/dsl
# or
bun add @quantum-js/dsl
```

Import into your project:

```javascript
import { circuit, pipeline, pi, div } from '@quantum-js/dsl';
```

In the Bench (live IDE), the `Quantum` global is pre-defined.

---

## Basic Circuit

Use the `circuit()` factory — it takes a config and a callback where the DSL
is active. Always `return c;` at the end (the Bench expects a circuit back).

```javascript
const c = circuit({ qubits: 2 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.all().measure();
});

const qasm3 = c.compile();               // OpenQASM 3.0 (default)
const qasm2 = c.compile({ version: '2.0' }); // OpenQASM 2.0
```

**Key rule:** The callback receives a `Circuit` instance (`Q`). All operations
chain off `Q`.

---

## Gate Reference

### Single-Qubit Gates

```javascript
Q.bit(0).h().x().y().z().s().s_().t().t_().id().reset();
//          ──  ──  ──  ──  ─  ───  ─  ───  ──  ─────
//          H   X   Y   Z   S   S†   T   T†   Id  Reset
```

Rotation gate (3 Euler angles):

```javascript
Q.bit(0).u([theta, phi, lambda]);
```

### Parametric / Rotation Gates (`rx`, `ry`, `rz`)

Built-in rotation gates emit native OpenQASM 3.0 `rx`, `ry`, `rz`:

```javascript
// Inside circuit callback (Q.π helpers):
Q.bit(0).rx(Q.π.div(2));       // Rx(π/2)
Q.bit(0).ry(Math.PI / 4);       // Ry(π/4) with raw JS number
Q.bit(0).rz(Q.π.mult(0.5));     // Rz(π * 0.5)
Q.bit(0).rx(Q.π.times(0.75));   // Rx(π * 0.75) — times is an alias for mult

// At module level (standalone helpers):
import { pi, div, mult } from '@quantum-js/dsl';
Q.bit(0).ry(div(pi, 4));        // Ry(π/4)
Q.bit(0).rz(mult(pi, 0.5));     // Rz(π * 0.5)

// With raw JS Math:
Q.bit(0).rx(Math.PI / 2);       // Rx(π/2)
```

**Important:** `Q.π.div(n)` divides π by `n`. `Q.π.mult(n)` multiplies π by `n`.
`Q.π.times(n)` is an alias for `mult`. At module level, use `div(pi, n)` and
`mult(pi, n)` as standalone functions.

### Controlled Gates

First argument is the target qubit:

```javascript
Q.bit(0).cx(Q.bit(1));   // CNOT — control q[0], target q[1]
Q.bit(0).cy(Q.bit(1));
Q.bit(0).cz(Q.bit(1));
Q.bit(0).ch(Q.bit(1));   // Controlled-H
```

Controlled Phase:

```javascript
Q.bit(0).cp(Q.bit(1), Q.π.div(2));  // CP(π/2) — also aliased as .cu1()
```

Swap:

```javascript
Q.bit(0).swap(Q.bit(1));
```

### Multi-Controlled Gates

```javascript
Q.bit(0).ccx(Q.bit(1), Q.bit(2));  // Toffoli / CCX
Q.bit(0).toffoli(Q.bit(1), Q.bit(2));
```

Barrier:

```javascript
Q.barrier();                    // All qubits
Q.barrier([0, 1]);              // Specific qubits only
```

### Gate Chaining

All gate methods return the qubit proxy, so you can chain:

```javascript
Q.bit(0).h().cx(Q.bit(1)).measure();
```

---

## Flexible Input

Prepare an initial quantum state without writing X gates manually:

```javascript
Q.input("101");                 // X on q[0] and q[2] (big-endian by default)
Q.input("101", { endian: 'little' }); // X on q[0] and q[1]
Q.input("XXIZI");               // Pauli string (I = Identity, skipped)
Q.input(['X', 'H', 'S']);      // Explicit gate array
```

`input()` automatically skips ground states (`0`, `I`) to keep QASM output clean.

---

## Measurement

```javascript
Q.bit(0).measure();              // Measure q[0] → classical bit 0
Q.bit(1).measureTo(0);           // Measure q[1] → classical bit 0 (explicit)
Q.all().measure();               // Measure all qubits (one-to-one mapping)

// Basis transformations (tomography helpers):
Q.bit(0).measureX();             // H + measure  (X basis)
Q.bit(0).measureY();             // S† + H + measure  (Y basis)
Q.bit(0).measureW();             // S + H + T + H + measure  (W basis)
Q.bit(0).measureV();             // S + H + T† + H + measure
```

---

## Qubit Selection

Fluent helpers for selecting qubits:

```javascript
Q.bit(0);                        // Single qubit by index
Q.bits([0, 2]);                  // Multiple specific qubits
Q.all();                         // All qubits in the circuit
Q.first();                       // First qubit (index 0)
Q.last();                        // Last qubit (index n-1)
```

---

## Scoped Layouts (Staircases)

**Context-aware loops** that dynamically manage sizes, offsets, and iteration
context. These are the most idiomatic QuantumJS feature — use them for QFT,
Grover, and any circuit with a regular structure.

Each scoped loop provides `q.iteration` (absolute qubit index) and `q.size`
(current sub-circuit size) inside the callback.

### growDown (top-aligned, growing)

Sub-circuits grow from top, aligned to the top qubit:

```javascript
Q.growDown(q => {
  q.first().cx(q.last());
});
// Iteration: size=1, size=2, size=3, ... (starting from top)
```

### growUp (bottom-aligned, growing)

Sub-circuits grow from top, aligned to the bottom qubit:

```javascript
Q.growUp(q => {
  q.first().cx(q.last());
});
// Iteration: size=1, size=2, ... (bottom-aligned)
```

### shrinkUp (top-aligned, shrinking)

Sub-circuits shrink from top:

```javascript
Q.shrinkUp(q => {
  q.first().cx(q.last());
});
// Iteration: size=n, size=n-1, ... (starting from top)
```

### shrinkDown (bottom-aligned, shrinking)

```javascript
Q.shrinkDown(q => {
  q.first().cx(q.last());
});
```

### Nested Scopes

Nesting is the key pattern for QFT-style algorithms. Inner scopes receive
`r.iteration` relative to their own scope, and `q.iteration` from the outer
scope is accessible via closure:

```javascript
Q.shrinkUp(q => {
  Q.shrinkDown(r => {
    if (r.iteration < q.iteration) {
      r.last().cp(r.first(), Q.π.div(2 ** (1 + q.iteration - r.iteration)));
    }
  });
  q.last().h().brk();
});
```

The example above is the core QFT pattern: outer scope shrinks from the top,
inner scope shrinks from the bottom. The condition `r.iteration < q.iteration`
prevents self-controlled phase gates.

### Loop Helper

Simple repeat loop when you don't need staircase behavior:

```javascript
Q.loop(4, q => {
  q.bit(0).h().cx(q.bit(1));
});
```

---

## Custom Functions

Extend the DSL with reusable, chainable functions:

```javascript
const c = circuit({ qubits: 3 }, Q => {
  Q.addFunction('myBellState', (q, control, target) => {
    q.bit(control).h().cx(q.bit(target));
  });

  Q.fnc.myBellState(0, 1);    // Call it!
  Q.fnc.myBellState(1, 2);    // Reuse it!
});
```

---

## Conditionals

Conditional operations based on classical measurement results:

```javascript
Q.bit(0).measure();                    // Measure first
Q.bit(1).x()._if(Q.cbit(0));          // X on q[1] if c[0] == 1

// Block-style condition:
Q.bit(1)._if(Q.cbit(0), q => q.x());  // Same, using callback
```

The `CBitProxy` also supports `.isTrue()` (default) and `.isFalse()`:

```javascript
Q.bit(1).x()._if(Q.cbit(0).isFalse());
```

---

## Pipeline Abstraction

A Pipeline wraps input preparation, core algorithm, and output measurement
into a structured job:

```javascript
import { pipeline } from '@quantum-js/dsl';

const job = pipeline(
  { qubits: 3 },          // Circuit config
  "101",                   // Input stage (binary prep)
  Q => Q.all().measure(),  // Output stage
  Q => {
    // Core algorithm
    Q.bit(0).cx(Q.bit(1));
  }
);

const qasm = job.compile();
```

Pipeline can also wrap an existing circuit. The `run()` method simulates
via quantum-circuit:

```javascript
const results = job.run(simulator);
```

---

## Comments & Breaks

```javascript
Q.comment("This appears in the QASM output");
Q.brk();                    // Visual break (empty comment line in QASM)
```

---

## Common Algorithms

### Bell State

```javascript
const c = circuit({ qubits: 2 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.all().measure();
});
return c;
```

### Quantum Fourier Transform (QFT) — Idiomatic

This is the canonical QuantumJS pattern using nested staircases:

```javascript
const c = circuit({ qubits: 4 }, Q => {
  Q.input("1011");
  Q.barrier();
  Q.shrinkUp(q => {
    Q.shrinkDown(r => {
      if (r.iteration < q.iteration) {
        r.last().cp(r.first(), Q.π.div(2 ** (1 + q.iteration - r.iteration)));
      }
    });
    q.last().h().brk();
  });
  Q.barrier();
  Q.all().measure();
});
return c;
```

### QFT — Loop style (simpler, less idiomatic)

```javascript
const c = circuit({ qubits: 4 }, Q => {
  Q.input("101");
  Q.barrier();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < i; j++) {
      Q.bit(i).cp(Q.bit(j), Q.π.div(2 ** (i - j)));
    }
    Q.bit(i).h();
  }
  Q.barrier();
  Q.all().measure();
});
return c;
```

### Grover's Algorithm (2-qubit)

```javascript
const c = circuit({ qubits: 2 }, Q => {
  // Superposition
  Q.all().h();

  // Oracle: mark |11⟩
  Q.bit(0).cz(Q.bit(1));

  // Diffusion
  Q.all().h();
  Q.all().x();
  Q.bit(0).cz(Q.bit(1));
  Q.all().x();
  Q.all().h();

  Q.all().measure();
});
return c;
```

### Quantum Teleportation

```javascript
const c = circuit({ qubits: 3 }, Q => {
  // Create Bell pair between q[1] and q[2]
  Q.bit(1).h();
  Q.bit(1).cx(Q.bit(2));

  // Alice: entangle q[0] with q[1], then measure
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).h();
  Q.bit(0).measure();
  Q.bit(1).measure();

  // Bob: apply corrections
  Q.bit(2).x()._if(Q.cbit(1));
  Q.bit(2).z()._if(Q.cbit(0));

  Q.bit(2).measure();
});
return c;
```

---

## Translation Guides

### Qiskit → QuantumJS

| Qiskit | QuantumJS |
|--------|-----------|
| `QuantumCircuit(2)` | `circuit({ qubits: 2 }, Q => { ... })` |
| `qc.h(0)` | `Q.bit(0).h()` |
| `qc.cx(0, 1)` | `Q.bit(0).cx(Q.bit(1))` |
| `qc.ccx(0, 1, 2)` | `Q.bit(0).ccx(Q.bit(1), Q.bit(2))` |
| `qc.measure([0,1], [0,1])` | `Q.all().measure()` |
| `qc.barrier()` | `Q.barrier()` |
| `qc.rz(pi/2, 0)` | `Q.bit(0).rz(Q.π.div(2))` |
| `qc.cp(pi/2, 0, 1)` | `Q.bit(0).cp(Q.bit(1), Q.π.div(2))` |
| `qc.swap(0, 1)` | `Q.bit(0).swap(Q.bit(1))` |
| `qc.reset(0)` | `Q.bit(0).reset()` |
| `qc.x(0).c_if(0, 1)` | `Q.bit(0).x()._if(Q.cbit(0))` |
| `initialize('101', [0,1,2])` | `Q.input("101")` |
| `for i in range(n):` | `Q.loop(n, q => { ... })` or `for` loops |

**QFT translation (Qiskit → QuantumJS with staircases):**

Qiskit:
```python
def qft(qc, n):
    for i in range(n):
        for j in range(i):
            qc.cp(pi/2**(i-j), j, i)
        qc.h(i)
```

QuantumJS (idiomatic):
```javascript
Q.shrinkUp(q => {
  Q.shrinkDown(r => {
    if (r.iteration < q.iteration) {
      r.last().cp(r.first(), Q.π.div(2 ** (1 + q.iteration - r.iteration)));
    }
  });
  q.last().h().brk();
});
```

### OpenQASM → QuantumJS

| OpenQASM 3.0 | QuantumJS |
|--------------|-----------|
| `h q[0];` | `Q.bit(0).h()` |
| `cx q[0], q[1];` | `Q.bit(0).cx(Q.bit(1))` |
| `rz(pi/2) q[0];` | `Q.bit(0).rz(Q.π.div(2))` |
| `cp(pi/4) q[0], q[1];` | `Q.bit(0).cp(Q.bit(1), Q.π.div(4))` |
| `measure q[0] -> c[0];` | `Q.bit(0).measure()` |
| `barrier q[0], q[1];` | `Q.barrier([0, 1])` |
| `if(c==1) x q[0];` | `Q.bit(0).x()._if(Q.cbit(0))` |
| `reset q[0];` | `Q.bit(0).reset()` |
| `// comment` | `Q.comment("comment")` |

**Gate name mapping:**

| QASM | QuantumJS |
|------|-----------|
| `sdg` | `.s_()` |
| `tdg` | `.t_()` |
| `u(theta, phi, lambda)` | `.u([theta, phi, lambda])` |
| `ccx` | `.ccx(a, b)` or `.toffoli(a, b)` |

---

## Idiomatic Style Guide

1. **Prefer staircases over for-loops** for QFT, IQFT, and any circuit with
   a triangular or growing/shrinking structure. Staircases are context-aware
   and produce cleaner code.

2. **Use `Q.input()`** instead of manual X gates for binary state preparation.

3. **Chain calls** where possible: `Q.bit(0).h().cx(Q.bit(1)).measure()`.

4. **Use `Q.all()`** for operations on every qubit (measure, h, barrier).

5. **Name your qubit proxy `Q`** by convention (the first argument to the
   circuit callback).

6. **Always `return c;`** at the end — the Bench and Pipeline expect a
   `Circuit` object back.

7. **Wrap parametric expressions** in `Q.π.div(n)` or `pi.div(n)` for
   readability.
