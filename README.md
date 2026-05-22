# <img src="assets/logo_small.png" align="center" width="40" height="40" /> QuantumJS
[![npm version](https://badge.fury.io/js/%40quantum-js%2Fdsl.svg)](https://badge.fury.io/js/%40quantum-js%2Fdsl)

A modern, highly expressive Quantum Circuit Domain Specific Language (DSL) and AST-driven compiler for JavaScript and TypeScript.

**QuantumJS** generates compliant, high-performance **OpenQASM 3.0** (with OpenQASM 2.0 compatibility) capable of being executed on quantum processors or local statevector simulators. It features fluent chaining patterns, context-aware loop scopes, and structural pipelines to simplify the creation of complex quantum algorithms.

### 🌐 Live Demo & Bench
An interactive, real-time IDE to write, visualize, and simulate circuits with QuantumJS is available for testing at: **[quantumjs.netlify.app](https://quantumjs.netlify.app)**

---

## Installation

Add QuantumJS to your JavaScript/TypeScript project:

```bash
npm install @quantum-js/dsl
# or
bun add @quantum-js/dsl
```

---

## Quick Start

### 1. Basic Circuit
Create a simple Bell State circuit and compile it to OpenQASM:

```javascript
import { circuit } from '@quantum-js/dsl';

const c = circuit({ qubits: 2 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.all().measure();
});

const qasm3 = c.compile(); // Default: OpenQASM 3.0
const qasm2 = c.compile({ version: '2.0' }); // Compatibility Mode
```

---

## Key Abstractions

### A. Qubits & Registers
Select qubits fluently by index, slices, or helpers:
```javascript
Q.bit(0);       // Select qubit 0
Q.first();      // Select the first qubit (index 0)
Q.last();       // Select the last qubit (index span - 1)
Q.all();        // Selects all qubits in the active scope
Q.bits([0, 2]); // Selects multiple qubits
```

### B. Flexible Inputs (`.input()`)
The `input()` method prepares the initial quantum state using binary strings, Pauli strings, or gate arrays, automatically skipping ground states (`0` or `I`) to keep QASM output clean.
```javascript
Q.input("101");                // Big-endian binary input (X on q[0] and q[2])
Q.input("101", { endian: 'little' }); // Little-endian binary input (X on q[0] and q[2] reversed)
Q.input("XXIZI");              // Pauli string input (skips Identity 'I')
Q.input(['X', 'H', 'S']);      // Explicit gate list array
```

### C. Quantum Gates
Apply standard gates using chaining syntax:
```javascript
// Single Qubit Gates
Q.bit(0).h().x().y().z().s().s_().t().t_().id().reset();

// Rotation Gates
Q.bit(0).u([0.3, 0.2, 0.1]);

// Controlled Gates
Q.bit(0).cx(Q.bit(1)); // CNOT
Q.bit(0).cy(Q.bit(1));
Q.bit(0).cz(Q.bit(1));
Q.bit(0).cp(Q.bit(1), Q.π.div(2)); // Controlled Phase
Q.bit(0).ch(Q.bit(1));             // Controlled Hadamard

// Multi-Controlled Gates
Q.bit(0).ccx(Q.bit(1), Q.bit(2)); // Toffoli / CCX
```

### D. Scoped Staircase Layouts
These loops dynamically manage sizes, offsets, and contextual properties (`first()`, `last()`, and `iteration` absolute qubit index) to create "climbing" staircase circuits in space and time.

*   **`growUp` / `growDown`**: Increase sub-circuit sizes (growing) aligned to the top or bottom of the qubit registers.
*   **`shrinkUp` / `shrinkDown`**: Decrease sub-circuit sizes (shrinking) aligned to the top or bottom.

```javascript
// Beautiful QFT implementation using scoped layout loops
Q.shrinkUp(q => {
  q.shrinkDown(r => {
    if (r.iteration < q.iteration) {
      r.last().cp(r.first(), Q.π.div(2 ** (1 + q.iteration - r.iteration)));
    }
  });
  q.last().h().brk();
});
```

---

## Pipeline Abstraction
A **Pipeline** acts as a structured "Job" wrapping input preparation, core algorithm steps, output mapping, and post-processing into a single promise-like object:

```javascript
import { pipeline } from '@quantum-js/dsl';

const job = pipeline(
  { qubits: 3 },
  "101",                    // Input stage: binary state prep
  Q => Q.all().measure(),   // Output stage: standard measurements
  Q => {
    // Core Algorithm Stage
    Q.comment("Executing main steps");
    Q.bit(0).cx(Q.bit(1));
  }
);

const qasm = job.compile();
```

---

## Measuring & Basis Changes
Easily measure qubits to classical registers. If no target is specified for a single qubit, it defaults to the first classical register index `c[0]`.

```javascript
Q.bit(0).measure();     // Measures q[0] to c[0]
Q.bit(1).measureTo(0);  // Measures q[1] to c[0] explicitly
Q.all().measure();      // Measures the whole register (one-to-one mapping)
```

Change measurement basis dynamically ( Bloch tomography helpers ):
```javascript
Q.bit(0).measureX(); // Tomography in X basis (H + measure)
Q.bit(0).measureY(); // Tomography in Y basis (SDG + H + measure)
Q.bit(0).measureW(); // Tomography in W basis (S + H + T + H + measure)
```

---

## Custom Reusable Routines
Extend the DSL with your own custom, chainable functions:

```javascript
const myCircuit = circuit({ qubits: 3 }, Q => {
  // Define custom function
  Q.addFunction('myBellState', (q, control, target) => {
    q.bit(control).h().cx(q.bit(target));
  });

  // Call it fluently from the function proxy
  Q.fnc.myBellState(0, 1);
});
```

---

## License
Apache 2.0
