// BB84 quantum key distribution circuit (8 qubits)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Cirq (https://github.com/quantumlib/cirq)
// Generated from Cirq v0.8.0 — refactored with Q.bits()

const c = Quantum.circuit({ qubits: 8, bits: 8 }, Q => {
  // ── Initial state prep ─────────────────────
  Q.bit(0).x();
  Q.bit(1).h();
  Q.bits([2, 3, 4, 5]).x();
  Q.bit(7).h();

  // ── Round 1 ────────────────────────────────
  Q.bit(6).measure();
  Q.bits([5, 1, 2, 4, 7]).h();

  // ── Round 2 measurements ───────────────────
  Q.bits([0, 3, 1, 2, 4, 5, 7]).measure();

  // ── State refresh & new basis ─────────────
  Q.bit(0).x();
  Q.bit(1).h();
  Q.bits([2, 3, 4]).x();
  Q.bits([7, 5, 6, 2, 4, 1, 3, 7]).h();

  // ── Round 3a measurements ─────────────────
  Q.bits([0, 5, 6]).measure();

  // ── Final basis flips ─────────────────────
  Q.bits([2, 4]).h();

  // ── Round 3b measurements ─────────────────
  Q.bits([1, 3, 7, 2, 4]).measure();
});
return c;
