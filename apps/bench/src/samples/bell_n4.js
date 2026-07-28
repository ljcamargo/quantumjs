// bell_n4 — 4-qubit Bell state circuit (Cirq generated)
// Source: QASMBench/small/bell_n4/bell_n4.qasm
// Uses: h, cx, rx (via u), ry (via u), rz (via u), u3 (via u), CNOT**0.5 decompositions



const c = Quantum.circuit({ qubits: 4 }, Q => {
  // Initial Hadamards
  Q.bit(0).h();
  Q.bit(1).h();
  Q.bit(3).h();
  Q.bit(0).cx(Q.bit(2));
  Q.bit(0).u([Q.π.div(-4), Q.π.div(-2), Q.π.div(2)]); // rx(pi*-0.25)

  // Gate: CNOT**0.5 on q[2],q[3]
  Q.bit(2).u([Q.π.div(-2), 0, 0]);   // ry(pi*-0.5)
  Q.bit(3).u([Q.π.div(2), 0, Math.PI * 0.75]); // u3(pi/2,0,pi*0.75)
  Q.bit(2).u([Q.π.div(2), 0, Math.PI * 0.25]); // u3(pi/2,0,pi*0.25)
  Q.bit(3).u([Q.π.div(2), Q.π.div(-2), Q.π.div(2)]); // rx(pi/2)
  Q.bit(3).cx(Q.bit(2));
  Q.bit(3).u([Math.PI * 0.25, Q.π.div(-2), Q.π.div(2)]); // rx(pi*0.25)
  Q.bit(2).u([Q.π.div(2), 0, 0]);   // ry(pi/2)
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([Q.π.div(-2), Q.π.div(-2), Q.π.div(2)]); // rx(pi*-0.5)
  Q.bit(2).u([0, 0, Q.π.div(2)]);   // rz(pi/2) → u3(0,0,pi/2)
  Q.bit(3).cx(Q.bit(2));
  Q.bit(3).u([Q.π.div(2), Q.π.div(2), Math.PI]);   // u3(pi/2, pi/2, pi)
  Q.bit(2).u([Q.π.div(2), Math.PI, Math.PI]);       // u3(pi/2, pi, pi)
  Q.bit(2).u([Q.π.div(2), 0, 0]);   // ry(pi/2)

  // Gate: CNOT**0.5 on q[0],q[1]
  Q.bit(0).u([Q.π.div(-2), 0, 0]);   // ry(pi*-0.5)
  Q.bit(1).u([Q.π.div(2), 0, Math.PI * 0.75]); // u3(pi/2,0,pi*0.75)
  Q.bit(0).u([Q.π.div(2), 0, Math.PI * 0.25]); // u3(pi/2,0,pi*0.25)
  Q.bit(1).u([Q.π.div(2), Q.π.div(-2), Q.π.div(2)]); // rx(pi/2)
  Q.bit(1).cx(Q.bit(0));
  Q.bit(1).u([Math.PI * 0.25, Q.π.div(-2), Q.π.div(2)]); // rx(pi*0.25)
  Q.bit(0).u([Q.π.div(2), 0, 0]);   // ry(pi/2)
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([Q.π.div(-2), Q.π.div(-2), Q.π.div(2)]); // rx(pi*-0.5)
  Q.bit(0).u([0, 0, Q.π.div(2)]);   // rz(pi/2)
  Q.bit(1).cx(Q.bit(0));
  Q.bit(1).u([Q.π.div(2), Q.π.div(2), Math.PI]);   // u3(pi/2, pi/2, pi)
  Q.bit(0).u([Q.π.div(2), Math.PI, Math.PI]);       // u3(pi/2, pi, pi)
  Q.bit(0).u([Q.π.div(2), 0, 0]);   // ry(pi/2)

  // Measure all qubits to separate classical bits (matching QASM order)
  Q.bit(2).measure();
  Q.bit(3).measure();
  Q.bit(0).measure();
  Q.bit(1).measure();
});

return c;
