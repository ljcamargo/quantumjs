// bb84_n8 — BB84 quantum key distribution protocol (8 qubits)
// Source: QASMBench/small/bb84_n8/bb84_n8.qasm
// Uses: x, h, measure (with interleaved H gates between measurements)



const c = Quantum.circuit({ qubits: 8 }, Q => {
  // Round 1 basis preparations
  Q.bit(0).x();
  Q.bit(1).h();
  Q.bit(2).x();
  Q.bit(3).x();
  Q.bit(4).x();
  Q.bit(5).x();
  Q.bit(7).h();

  // Measure q[6] first
  Q.bit(6).measureTo(6);

  // Basis changes before round 1 measurements
  Q.bit(5).h();
  Q.bit(1).h();
  Q.bit(2).h();
  Q.bit(4).h();
  Q.bit(7).h();

  // Round 1 measurements
  Q.bit(0).measureTo(0);
  Q.bit(3).measureTo(3);
  Q.bit(1).measureTo(1);
  Q.bit(2).measureTo(2);
  Q.bit(4).measureTo(4);
  Q.bit(5).measureTo(5);
  Q.bit(7).measureTo(7);

  // Round 2 basis preparations
  Q.bit(0).x();
  Q.bit(1).h();
  Q.bit(2).x();
  Q.bit(3).x();
  Q.bit(4).x();
  Q.bit(7).h();
  Q.bit(5).h();
  Q.bit(6).h();
  Q.bit(2).h();
  Q.bit(4).h();
  Q.bit(1).h();
  Q.bit(3).h();
  Q.bit(7).h();

  // Round 2 measurements (reusing same classical bits)
  Q.bit(0).measureTo(0);
  Q.bit(5).measureTo(5);
  Q.bit(6).measureTo(6);

  Q.bit(2).h();
  Q.bit(4).h();

  Q.bit(1).measureTo(1);
  Q.bit(3).measureTo(3);
  Q.bit(7).measureTo(7);
  Q.bit(2).measureTo(2);
  Q.bit(4).measureTo(4);
});

return c;
