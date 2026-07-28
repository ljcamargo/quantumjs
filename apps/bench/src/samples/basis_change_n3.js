// basis_change_n3 — 3-qubit basis change circuit (Cirq generated)
// Source: QASMBench/small/basis_change_n3/basis_change_n3.qasm
// Uses: u3, cz, measure



const c = Quantum.circuit({ qubits: 3 }, Q => {
  // Initial rotations
  Q.bit(2).u([Math.PI * 0.5, 0, Math.PI * 0.0564006755]);
  Q.bit(1).u([Math.PI * 0.5, Math.PI * 1.5, Math.PI * 0.2945501109]);
  Q.bit(0).u([Math.PI * 0.5, Math.PI * 1.5, Math.PI * 1.5]);

  // Layer 1
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.1242949803, 0, 0]);
  Q.bit(1).u([Math.PI * 0.1242949803, Math.PI * 0.5, Math.PI * 1.5]);
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.0298311566, Math.PI * 1.5, Math.PI * 0.5]);
  Q.bit(1).u([Math.PI * 0.7273849664, Math.PI * 1.5, Math.PI * 1.0]);

  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([Math.PI * 0.328242091, 0, 0]);
  Q.bit(0).u([Math.PI * 0.328242091, Math.PI * 0.5, Math.PI * 1.5]);
  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([Math.PI * 0.1374475291, Math.PI * 2.0, Math.PI * 1.5]);
  Q.bit(0).u([Math.PI * 0.9766098537, 0, 0]);

  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.2326621647, 0, 0]);
  Q.bit(1).u([Math.PI * 0.2326621647, Math.PI * 0.5, Math.PI * 1.5]);
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.5780153762, Math.PI * 0.5, Math.PI * 0.5]);
  Q.bit(1).u([Math.PI * 0.6257049652, Math.PI * 0.5, 0]);

  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([Math.PI * 0.328242091, 0, 0]);
  Q.bit(0).u([Math.PI * 0.328242091, Math.PI * 0.5, Math.PI * 1.5]);
  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([Math.PI * 0.6817377913, 0, Math.PI * 0.5]);
  Q.bit(0).u([Math.PI * 0.5, Math.PI * 0.3593182384, Math.PI * 1.5]);

  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.1242949803, 0, 0]);
  Q.bit(1).u([Math.PI * 0.1242949803, Math.PI * 0.5, Math.PI * 1.5]);
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([Math.PI * 0.5, Math.PI * 1.3937948052, 0]);
  Q.bit(1).u([Math.PI * 0.5, Math.PI * 1.1556453697, Math.PI * 0.5]);

  // Measure all
  Q.all().measure();
});

return c;
