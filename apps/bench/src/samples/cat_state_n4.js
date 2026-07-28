// cat_state_n4 — 4-qubit GHZ / cat state
// Source: QASMBench/small/cat_state_n4/cat_state_n4.qasm
// Translates to: H q[0], CX cascade, measure all



const c = Quantum.circuit({ qubits: 4 }, Q => {
  Q.bit(0).h();
  Q.bit(0).cx(Q.bit(1));
  Q.bit(1).cx(Q.bit(2));
  Q.bit(2).cx(Q.bit(3));
  Q.all().measure();
});

return c;
