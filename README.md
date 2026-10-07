# QuantumJS

![QuantumJS logo](assets/logo_small.png)

[![npm version](https://badge.fury.io/js/%40quantum-js%2Fdsl.svg)](https://www.npmjs.com/package/@quantum-js/dsl)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

QuantumJS is an open-source **quantum computing environment built around JavaScript and TypeScript** that brings quantum development directly to the browser while allowing deep integration as an imported library or command-line tool. 

It provides an intuitive language for authoring quantum circuits, a compiler that generates OpenQASM to ensure compatibility with industry-standard quantum hardware and simulators, and an online Bench where circuits can be written, simulated, rendered, and examined. Built to work natively within JavaScript and TypeScript, the circuit language seamlessly expresses everything from individual gate operations to reusable architectural patterns and complete quantum algorithms.

> Author quantum circuits in JavaScript or TypeScript, compile them to OpenQASM, and use the browser to simulate, visualize, and inspect their execution and results.

### Core Use Cases
* **Education & Learning:** Teaching and learning quantum computing fundamentals through an accessible stack.
* **Algorithm Exploration:** Prototyping, testing, and experimenting with new quantum algorithms.
* **Academic Research:** Accelerating research and experimentation without heavy environment setup.
* **Software Engineering:** Building modern quantum software and developer tools using web technologies.

---

**[Try the Bench](https://quantumjs.netlify.app)** · **[Read the documentation](https://quantumjsdocs.netlify.app)** · **[Install from npm](https://www.npmjs.com/package/@quantum-js/dsl)**

---

## The QuantumJS project

### Circuit authoring

The QuantumJS circuit language offers several ways to describe a circuit:

- write gates explicitly, one operation at a time;
- chain operations through a fluent API;
- use regular JavaScript loops, conditions, and functions;
- express repeated circuit shapes with scoped staircase layouts;
- organize input preparation, an algorithm, and measurement as a pipeline.

These styles can be mixed freely in the same program.

### OpenQASM compiler

QuantumJS generates **OpenQASM 3.0** and can also emit **OpenQASM 2.0** for compatibility with tools and simulators that use the earlier version.

### QuantumJS Bench

The [Bench](https://quantumjs.netlify.app) brings QuantumJS into an interactive browser application:

- a live JavaScript circuit editor with autorun;
- generated OpenQASM alongside the source;
- browser-based statevector simulation and probability results;
- an interactive SVG circuit drawer;
- gate-to-QASM highlighting and moment-by-moment probability inspection;
- built-in examples plus source, QASM, CSV, and SVG export;
- WebMCP tools that let compatible AI agents compile, simulate, draw, and explore the documentation in the browser.

The Bench can be used online without installing QuantumJS locally.

---

## Quick start

Install the authoring library:

```bash
npm install @quantum-js/dsl
# or
bun add @quantum-js/dsl
```

Create a Bell-state circuit and compile it:

```javascript
import { circuit } from '@quantum-js/dsl';

const bell = circuit({ qubits: 2, bits: 2 }, Q => {
  Q.bit(0).h().cx(Q.bit(1));
  Q.all().measure();
});

console.log(bell.compile());                  // OpenQASM 3.0
console.log(bell.compile({ version: '2.0' })); // OpenQASM 2.0
```

OpenQASM 3.0 output:

```qasm
OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;
h q[0];
cx q[0], q[1];
c = measure q;
```

In the Bench, use the browser-provided `Quantum` global and return the circuit:

```javascript
const bell = Quantum.circuit({ qubits: 2, bits: 2 }, Q => {
  Q.bit(0).h().cx(Q.bit(1));
  Q.all().measure();
});

return bell;
```

---

## One API, several authoring styles

QuantumJS does not force every circuit into one syntax pattern.

### Explicit gate sequence

Useful when translating QASM, papers, or code from another framework:

```javascript
const circuit = Quantum.circuit({ qubits: 3 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.bit(1).cx(Q.bit(2));
});
```

### Fluent composition

Useful for compact, readable local sequences:

```javascript
Q.bit(0).h().cx(Q.bit(1)).measure();
```

### JavaScript abstractions

Use the language you already know:

```javascript
function catState(Q, size) {
  Q.first().h();
  for (let target = 1; target < size; target++) {
    Q.first().cx(Q.bit(target));
  }
}

const circuit = Quantum.circuit({ qubits: 4 }, Q => {
  catState(Q, 4);
});
```

### Circuit-shaped abstractions

Scoped staircase layouts carry qubit span, offset, and iteration context. They make triangular patterns such as the Quantum Fourier Transform concise without hiding the generated operations:

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

### Structured pipelines

Separate state preparation, output mapping, and the core algorithm:

```javascript
import { pipeline } from '@quantum-js/dsl';

const job = pipeline(
  { qubits: 3 },
  '101',                    // input preparation
  Q => Q.all().measure(),   // output mapping
  Q => {                    // algorithm
    Q.bit(0).h().cx(Q.bit(1));
  }
);

const qasm = job.compile();
```

See the [complete guides and API reference](https://quantumjsdocs.netlify.app) for gates, inputs, measurements, conditionals, custom routines, layouts, and pipelines.

---

## Repository structure

QuantumJS is maintained as a monorepo:

| Path | Purpose |
|---|---|
| [`packages/quantumjs`](packages/quantumjs) | Circuit API, AST, and OpenQASM emitter published as `@quantum-js/dsl` |
| [`apps/bench`](apps/bench) | Live editor, simulator, circuit visualizer, samples, exports, and WebMCP tools |
| [`apps/documentation`](apps/documentation) | Guides and API documentation |
| [`examples`](examples) | Standalone circuit examples |

### Local development

```bash
git clone https://github.com/ljcamargo/quantumjs.git
cd quantumjs
npm install

# Build the library
npm run build --workspace=@quantum-js/dsl

# Run the Bench
npm run dev --workspace=bench

# Run the documentation site
npm run start --workspace=docs
```

---

## Project status

QuantumJS is an evolving open-source project. OpenQASM output, simulator support, and browser APIs can differ across downstream tools, so verify generated circuits against the requirements of the target backend.

Contributions, bug reports, circuit examples, and ideas are welcome through [GitHub Issues](https://github.com/ljcamargo/quantumjs/issues).

## License

[Apache License 2.0](LICENSE)
