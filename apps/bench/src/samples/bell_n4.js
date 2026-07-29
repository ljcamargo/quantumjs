// Bell inequality test circuit (4 qubits)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Cirq (https://github.com/quantumlib/cirq)
// Generated from Cirq v0.8.0 - Bell inequality test on a 2×2 grid

const c = Quantum.circuit({ qubits: 4, bits: 4 }, Q => {
  const piA = Q.π.mult(0.5);
  const piB = Q.π.mult(-0.5);
  const piC = Q.π.mult(0.75);
  const piD = Q.π.mult(0.25);
  const piE = Q.π.mult(1);
  const piF = Q.π.mult(-0.25);

  // CNOT**0.5 decomposition
  Q.addFunction('cnotHalf', (Q, a, b) => {
    Q.bit(b).ry(piB);
    Q.bit(a).u([piA, 0, piC]);
    Q.bit(b).u([piA, 0, piD]);
    Q.bit(a).rx(piA).cx(Q.bit(b)).rx(piD);
    Q.bit(b).ry(piA).cx(Q.bit(a)).rx(piB).rz(piA);
    Q.bit(a).cx(Q.bit(b)).u([piA, piA, piE]);
    Q.bit(b).u([piA, piE, piE]).ry(piA);
  });

  // Initial H and CX
  Q.bits([0, 1, 3]).h();
  Q.bit(0).cx(Q.bit(2)).rx(piF);

  // Two CNOT**0.5 blocks (with swapped qubit pairs)
  Q.fnc.cnotHalf(3, 2);
  Q.fnc.cnotHalf(1, 0);

  Q.all().measure();
});
return c;
