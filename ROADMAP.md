# QuantumJS Modernization Roadmap

This document tracks the progress of the QuantumJS library modernization and refactor.

## 🟢 Completed

- [x] **Monorepo Architecture**: Established a modular monorepo using `npm workspaces`.
  - `packages/quantum-core`: The core library.
  - `apps/playground`: Next.js based web environment.
- [x] **Fluent DSL**: Implemented a modern, declarative API for circuit construction.
  - Supports `Q.all()`, `Q.bit(n)`, `Q.first()`, `Q.last()`, `Q.descend()`.
  - Functional-style circuit definitions.
- [x] **AST-Driven Compiler**:
  - Abstract Syntax Tree (AST) for OpenQASM.
  - `Emitter` supporting both **OpenQASM 3.0** (modern) and **OpenQASM 2.0** (compatibility).
- [x] **Live Playground**:
  - Real-time compilation of DSL to QASM 3.0.
  - Integrated `quantum-circuit` simulator for live probability results.
  - Dark mode UI with Tailwind CSS.
  - Syntax highlighting using PrismJS.
  - Responsive layout with widened editor.
- [x] **Error Handling**: Improved error reporting from both compilation and simulation stages.
- [x] **Project Cleanup**: Optimized `.gitignore` and removed legacy temporary files.

## 🟡 In Progress / Pending

- [x] **Circuit Visualizer**: Integrated `@ljcamargo/quirkvis-js` for real-time SVG circuit diagrams.
- [x] **UI Revamp**: 
  - Tightened layout (CodePen/JSFiddle style).
  - Compact header and panel structure.
  - Reorganized panels: QASM and Probabilities side-by-side, Visualizer in a full-width row.
  - Modular component structure for easy layout changes.
- [ ] **DSL Documentation**: Create a comprehensive guide/README for the new DSL syntax and patterns.
- [ ] **Gate Expansion**: Add support for more complex gates and custom gate definitions in the AST and DSL.
- [ ] **Unit Testing**: Implement a test suite for `quantum-core` to ensure AST and Emitter correctness.
- [ ] **NPM Readiness**: 
  - Finalize `package.json` metadata for `quantum-core`.
  - Add build scripts and prepublish steps.
- [ ] **Examples**: Port legacy examples from the root `examples/` directory to the new DSL format.
- [ ] **Advanced QASM 3.0 Features**: Implement support for classical control flow (if/else), subroutines, and more complex types in the AST/Emitter.

## 🔴 Future Goals

- [ ] **Non-web Runner**: Explore integration with Python-based quantum frameworks or local simulators via CLI.
- [ ] **Type Safety Improvements**: Further refine TypeScript types for the DSL to provide better autocompletion for gates and parameters.
- [ ] **Plugin System**: Allow for custom emitters (e.g., for Braket, Qiskit).
