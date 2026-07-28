// adder_n10 — 10-qubit quantum ripple-carry adder (Cuccaro et al.)
// Source: QASMBench/small/adder_n10/adder_n10.qasm
// Custom gates: majority, unmaj decomposed inline
// Qubit map: q[0]=cin, q[1..4]=a[0..3], q[5..8]=b[0..3], q[9]=cout
// Classical: ans[0..4]



const c = Quantum.circuit({ qubits: 10 }, Q => {
  // Set input states: a = 0001, b = 1111
  Q.bit(1).x();  // a[0] = 1
  Q.bit(5).x();  // b[0..3] = 1111
  Q.bit(6).x();
  Q.bit(7).x();
  Q.bit(8).x();

  // majority cin[0], b[0], a[0]  →  majority q[0], q[5], q[1]
  Q.bit(1).cx(Q.bit(5));
  Q.bit(1).cx(Q.bit(0));
  Q.bit(0).ccx(Q.bit(5), Q.bit(1));

  // majority a[0], b[1], a[1]  →  majority q[1], q[6], q[2]
  Q.bit(2).cx(Q.bit(6));
  Q.bit(2).cx(Q.bit(1));
  Q.bit(1).ccx(Q.bit(6), Q.bit(2));

  // majority a[1], b[2], a[2]  →  majority q[2], q[7], q[3]
  Q.bit(3).cx(Q.bit(7));
  Q.bit(3).cx(Q.bit(2));
  Q.bit(2).ccx(Q.bit(7), Q.bit(3));

  // majority a[2], b[3], a[3]  →  majority q[3], q[8], q[4]
  Q.bit(4).cx(Q.bit(8));
  Q.bit(4).cx(Q.bit(3));
  Q.bit(3).ccx(Q.bit(8), Q.bit(4));

  // cx a[3], cout[0]  →  cx q[4], q[9]
  Q.bit(4).cx(Q.bit(9));

  // unmaj a[2], b[3], a[3]  →  unmaj q[3], q[8], q[4]
  Q.bit(3).ccx(Q.bit(8), Q.bit(4));
  Q.bit(4).cx(Q.bit(3));
  Q.bit(3).cx(Q.bit(8));

  // unmaj a[1], b[2], a[2]  →  unmaj q[2], q[7], q[3]
  Q.bit(2).ccx(Q.bit(7), Q.bit(3));
  Q.bit(3).cx(Q.bit(2));
  Q.bit(2).cx(Q.bit(7));

  // unmaj a[0], b[1], a[1]  →  unmaj q[1], q[6], q[2]
  Q.bit(1).ccx(Q.bit(6), Q.bit(2));
  Q.bit(2).cx(Q.bit(1));
  Q.bit(1).cx(Q.bit(6));

  // unmaj cin[0], b[0], a[0]  →  unmaj q[0], q[5], q[1]
  Q.bit(0).ccx(Q.bit(5), Q.bit(1));
  Q.bit(1).cx(Q.bit(0));
  Q.bit(0).cx(Q.bit(5));

  // Measure results: b[0..3] → ans[0..3], cout → ans[4]
  // b[0..3] = q[5..8], cout = q[9]
  Q.bit(5).measureTo(0);
  Q.bit(6).measureTo(1);
  Q.bit(7).measureTo(2);
  Q.bit(8).measureTo(3);
  Q.bit(9).measureTo(4);
});

return c;
