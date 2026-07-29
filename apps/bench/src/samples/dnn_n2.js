// 2-qubit deep quantum neural network (3 layers, 16 dimensions)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Reference (https://arxiv.org/abs/2012.00256)
// Generated from Cirq v0.8.0 — refactored with helpers

const c = Quantum.circuit({ qubits: 2, bits: 2 }, Q => {
  const θ = 0.3501408748;
  const piA = Q.π.mult(0.5);
  const piB = Q.π.mult(0.4);
  const piC = Q.π.mult(1.5);
  const piD = Q.π.mult(-0.5);
  const piE = Q.π.mult(1);
  const piF = Q.π.mult(1.1);
  const piG = Q.π.mult(0.75);
  const piH = Q.π.mult(0.25);
  const piI = Q.π.mult(1.8);
  const piJ = Q.π.mult(0.65);
  const piK = Q.π.mult(0.3);
  const piL = Q.π.mult(0.15);
  const piM = Q.π.mult(0.05);

  // Core shared by ZZ/YY/XX interactions
  function core(a, b) {
    Q.bit(a).rx(piA).cx(Q.bit(b)).rx(piB);
    Q.bit(b).ry(piA).cx(Q.bit(a));
    Q.bit(b).rx(piD).rz(piA);
    Q.bit(a).cx(Q.bit(b));
  }

  function zz11(a, b) {
    Q.bits([a, b]).rz(piF);
    Q.bit(a).u([piA, 0, piH]);
    Q.bit(b).u([piA, piE, piG]);
    core(a, b);
    Q.bit(a).u([piA, piJ, piE]);
    Q.bit(b).u([piA, piL, 0]);
  }

  function yy11(a, b) {
    Q.bit(a).u([0, piE, piA]);
    Q.bit(b).u([0, 0, piA]);
    core(a, b);
    Q.bit(a).u([piE, 0, piA]);
    Q.bit(b).u([piE, 0, piC]);
  }

  function xx11(a, b) {
    Q.bit(a).u([piA, piC, piC]);
    Q.bit(b).u([piA, piA, piC]);
    core(a, b);
    Q.bit(a).u([piA, piA, piA]);
    Q.bit(b).u([piA, piA, piC]);
  }

  function cnot11(a, b) {
    Q.bit(b).ry(piD);
    Q.bit(a).u([piA, 0, piH]);
    Q.bit(b).u([piA, piE, piG]);
    Q.bit(a).rx(piA).cx(Q.bit(b)).rx(piM);
    Q.bit(b).ry(piA).cx(Q.bit(a));
    Q.bit(b).rx(piD).rz(piA);
    Q.bit(a).cx(Q.bit(b));
    Q.bit(a).u([piA, piK, piE]);
    Q.bit(b).u([piA, piI, 0]).ry(piA);
  }

  function cz11(a, b) {
    Q.bit(a).u([piA, 0, piH]);
    Q.bit(b).u([piA, piE, piG]);
    Q.bit(a).rx(piA).cx(Q.bit(b)).rx(piM);
    Q.bit(b).ry(piA).cx(Q.bit(a));
    Q.bit(b).rx(piD).rz(piA);
    Q.bit(a).cx(Q.bit(b));
    Q.bit(a).u([piA, piK, piE]);
    Q.bit(b).u([piA, piI, 0]);
  }

  function rots(q) { Q.bit(q).rx(θ).ry(θ).rz(θ); }
  function rots01() { rots(0); rots(1); }
  function rots10() { rots(1); rots(0); }

  // ─── Layer 1 ────────────────────────────────
  rots01();  zz11(0, 1);  yy11(0, 1);  xx11(0, 1);

  // ─── Extra rotations ────────────────────────
  rots01();  rots(1);  rots(0);

  // ─── Layer 2 (swapped) ──────────────────────
  zz11(1, 0);  yy11(1, 0);  xx11(1, 0);
  rots10();

  // ─── Layer 3: CNOT + CZ ─────────────────────
  cnot11(0, 1);  cz11(0, 1);
  rots01();

  // ─── Layer 4 ────────────────────────────────
  zz11(0, 1);  yy11(0, 1);  xx11(0, 1);
  rots01();  rots(1);  rots(0);

  // ─── Layer 5 (swapped) ──────────────────────
  zz11(1, 0);  yy11(1, 0);  xx11(1, 0);
  rots10();

  Q.all().measure();
});
return c;
