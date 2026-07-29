# QuantumJS Changelog

## 0.9.1 — 2026-07-28

### Added

- **`rx`/`ry`/`rz` gates** — built-in rotation gate methods on `QBitProxy`,
  emitting native OpenQASM 3.0 `rx`, `ry`, `rz`.
- **`mult()` math helper** — `mult(pi, n)` at module level and `Q.π.mult(n)`
  / `Q.π.times(n)` inside circuit callbacks, providing the multiplication
  counterpart to `div()`. Emits `(pi * n)`.

### Fixed

- **`U` gate compliance** — The universal gate now emits uppercase `U(theta, phi, lambda)`
  matching the OpenQASM 3.0 specification. Lowercase `u` was a QASM 2.0 convention
  leaking into 3.0 output.

### Dependencies

- `@ljcamargo/quirkvis-core` → `0.2.2`
- `@ljcamargo/quirkvis-react` → `0.2.2`
