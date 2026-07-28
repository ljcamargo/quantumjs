// adder_n4 — 4-qubit quantum ripple-carry adder
// Source: QASMBench/small/adder_n4/adder_n4.qasm
// Uses: x, h, cx, t, tdg, s, measure



const c = Quantum.circuit({ qubits: 4 }, Q => {
  // Initialize: set input values
  Q.bit(0).x();
  Q.bit(1).x();

  // Adder circuit
  Q.bit(3).h();
  Q.bit(2).cx(Q.bit(3));

  Q.bit(0).t();
  Q.bit(1).t();
  Q.bit(2).t();
  Q.bit(3).t_();

  Q.bit(0).cx(Q.bit(1));
  Q.bit(2).cx(Q.bit(3));
  Q.bit(3).cx(Q.bit(0));
  Q.bit(1).cx(Q.bit(2));
  Q.bit(0).cx(Q.bit(1));
  Q.bit(2).cx(Q.bit(3));

  Q.bit(0).t_();
  Q.bit(1).t_();
  Q.bit(2).t_();
  Q.bit(3).t();

  Q.bit(0).cx(Q.bit(1));
  Q.bit(2).cx(Q.bit(3));

  Q.bit(3).s();

  Q.bit(3).cx(Q.bit(0));

  Q.bit(3).h();

  // Measure all
  Q.all().measure();
});

return c;
