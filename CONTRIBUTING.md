# Contributing to QuantumJS

Thank you for considering a contribution to QuantumJS. Bug reports, documentation improvements, circuit examples, feature ideas, and code contributions are all welcome.

## Before you begin

- Search the [existing issues](https://github.com/ljcamargo/quantumjs/issues) before opening a new one.
- For a substantial feature or architectural change, open an issue first so the approach can be discussed before significant work begins.
- Keep contributions focused. Unrelated fixes and refactoring should be submitted separately when possible.

## Reporting bugs

Open a [GitHub issue](https://github.com/ljcamargo/quantumjs/issues) and include:

- a clear description of the problem;
- the smallest circuit or code sample that reproduces it;
- the expected and actual behavior;
- your QuantumJS version;
- your Node.js and package-manager versions, or browser and operating system for Bench issues;
- any relevant error messages, generated QASM, or screenshots.

Please remove private or sensitive information from examples and logs.

## Suggesting features

Feature requests should explain the problem or use case, not only the proposed implementation. Examples of the intended circuit syntax, Bench behavior, or output are especially useful.

## Development setup

QuantumJS is a monorepo containing the circuit library, Bench, and documentation site. Node.js 20 or later is recommended.

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/quantumjs.git
   cd quantumjs
   ```

2. Install the workspace dependencies:

   ```bash
   npm install
   ```

3. Create a branch from `master`:

   ```bash
   git checkout -b fix/short-description
   ```

### Repository areas

| Path | Purpose |
|---|---|
| `packages/quantumjs` | Circuit language and OpenQASM compiler |
| `apps/bench` | Browser editor, simulator, results, and circuit visualizer |
| `apps/documentation` | Documentation website |
| `examples` | Standalone circuit examples |

### Common commands

Build the library:

```bash
npm run build --workspace=@quantum-js/dsl
```

Run the Bench locally:

```bash
npm run dev --workspace=bench
```

Build the Bench:

```bash
npm run build --workspace=bench
```

Run the documentation site:

```bash
npm run start --workspace=docs
```

Type-check the documentation:

```bash
npm run typecheck --workspace=docs
```

## Making changes

- Follow the style and organization of the surrounding code.
- Prefer small, readable changes over broad rewrites.
- Preserve compatibility unless a breaking change has been discussed.
- Update documentation when public behavior or syntax changes.
- Add or update examples when they help demonstrate the change.
- Do not edit generated build directories such as `dist`, `.next`, or the generated documentation output.

Bench samples are regular JavaScript files. They use the browser-provided `Quantum` global and must return a circuit or pipeline so the Bench can compile and display it.

## Testing and validation

The project does not yet have a complete automated test suite. Before submitting a pull request:

- build every workspace affected by your change;
- manually verify the behavior you changed;
- for compiler changes, check the relevant OpenQASM 3.0 and 2.0 output;
- for Bench changes, test the affected interaction in the browser;
- for visual changes, include screenshots in the pull request.

Describe the checks you performed in the pull request.

## Pull requests

1. Push your branch to your fork.
2. Open a pull request against the `master` branch.
3. Explain what changed and why.
4. Link any related issue.
5. Include testing notes and screenshots when applicable.
6. Respond to review comments and keep the branch updated if requested.

A pull request may be asked to change scope or implementation before it is merged. This is a normal part of review.

## Community expectations

Be respectful, constructive, and patient. Discuss ideas and code on their technical merits, and assume good intent from other contributors.

## License

By contributing to QuantumJS, you agree that your contribution will be licensed under the project's [Apache License 2.0](LICENSE).
