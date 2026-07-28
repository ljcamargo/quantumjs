// deutsch_n2 — Deutsch algorithm (2 qubits)
// Source: QASMBench/small/deutsch_n2/deutsch_n2.qasm
// Oracle: f(x) = x (constant + balanced), demonstrates Deutsch algorithm
// X q[1], H both, CX q[0]→q[1], H q[0], measure



const c = Quantum.circuit({ qubits: 2 }, Q => {
  Q.bit(1).x();
  Q.bit(0).h();
  Q.bit(1).h();
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).h();
  Q.all().measure();
});

return c;
