# QuantumJS API Status & Completion List

This file tracks the porting of the original `quantum.js` API to the new TypeScript-based library.

## `Circuit` (formerly `QuantumJS`)

| Function | Status | Notes |
| :--- | :--- | :--- |
| `constructor` | [x] | Handles `qubits`, `bits`, `version`. |
| `addFunction` | [x] | Implemented on `Circuit`. |
| `init` | [x] | Implemented on `Circuit`. |
| `bit(index)` | [x] | Returns `QBitProxy`. |
| `cbit(index)` | [x] | Returns `CBitProxy`. |
| `compile` | [x] | Supports QASM 2.0 and 3.0. |
| `comment` | [x] | Added `CommentStatement` to AST. |
| `brk` | [x] | Injects empty comments/newlines. |
| `barrier` | [x] | Supports specific indices or all qubits. |
| `mask` | [x] | Implemented. |
| `all` | [x] | New DSL feature (replaces `bit()` with no index). |
| `first / last` | [x] | New DSL feature. |
| `descend` | [x] | New DSL feature. |

## `QBitProxy` (formerly `QBit`)

| Function | Status | Notes |
| :--- | :--- | :--- |
| `h, x, y, z, s, t, id, reset` | [x] | |
| `s_ (sdg), t_ (tdg)` | [x] | |
| `u(params)` | [x] | |
| `cx (cnot), cy, cz` | [x] | |
| `ch` | [x] | |
| `ccx (toffoli)` | [x] | |
| `cp / cu1` | [x] | |
| `swap` | [x] | |
| `barrier` | [x] | |
| `repeat` | [x] | |
| `measure` | [x] | |
| `measureTo` | [x] | Alias for `measure`. |
| `measure[X,Y,W,V,Z]` | [x] | |
| `to[X,Y,W,V,Z]` | [x] | Basis change gates. |
| `_if(cbit, callback)` | [x] | Supports block conditionals. |
| `_if(cbit)` | [x] | Supports single-operation conditional (suffix). |
| `comment / brk` | [x] | Chaining support. |

## `CBitProxy` (formerly `CBit`)

| Function | Status | Notes |
| :--- | :--- | :--- |
| `isTrue` | [x] | |
| `isFalse` | [x] | |

## Missing / To Be Considered
- **Topology/Coupling Map**: The original had backends like `ibmqx2`. This isn't implemented in the new core yet.
- **Auto-Reverse CX (`acx`, `rcx`)**: Depends on topology implementation.
- **Multiple Named Registers**: Currently core assumes one `q` and one `c` register.
