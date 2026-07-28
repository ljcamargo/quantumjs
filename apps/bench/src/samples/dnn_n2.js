// dnn_n2 — 2-qubit deep neural network circuit (Cirq generated)
// Source: QASMBench/small/dnn_n2/dnn_n2.qasm
// Uses: rx, ry, rz, u3, cx with ZZ/YY/XX decomposition patterns


// Helper: rx(theta) = u3(theta, -pi/2, pi/2)

function rx(Q, qubit, theta) {
  Q.bit(qubit).u([theta, -Math.PI / 2, Math.PI / 2]);
}

// Helper: ry(theta) = u3(theta, 0, 0)
function ry(Q, qubit, theta) {
  Q.bit(qubit).u([theta, 0, 0]);
}

// Helper: rz(phi) = u1(phi) = u3(0, 0, phi)
function rz(Q, qubit, phi) {
  Q.bit(qubit).u([0, 0, phi]);
}

// Helper: u3 = u([theta, phi, lambda])
function u3(Q, qubit, theta, phi, lambda) {
  Q.bit(qubit).u([theta, phi, lambda]);
}

const c = Quantum.circuit({ qubits: 2 }, Q => {
  // Layer 1: single qubit gates on q[0] and q[1]
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);

  // Gate: ZZ**1.1 on q[0], q[1]
  rz(Q, 0, Math.PI * 1.1);
  rz(Q, 1, Math.PI * 1.1);
  u3(Q, 0, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 1, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.65, Math.PI);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.15, 0);

  // Gate: YY**1.1 on q[0], q[1]
  u3(Q, 0, 0, Math.PI, Math.PI * 0.5);
  u3(Q, 1, 0, 0, Math.PI * 0.5);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI, 0, Math.PI * 0.5);
  u3(Q, 1, Math.PI, 0, Math.PI * 1.5);

  // Gate: XX**1.1 on q[0], q[1]
  u3(Q, 0, Math.PI * 0.5, Math.PI * 1.5, Math.PI * 1.5);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);

  // Layer 2: single qubit gates (repeated and transposed)
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);

  // Gate: ZZ**1.1 on q[1], q[0] (reversed)
  rz(Q, 1, Math.PI * 1.1);
  rz(Q, 0, Math.PI * 1.1);
  u3(Q, 1, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 0, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.65, Math.PI);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.15, 0);

  // Gate: YY**1.1 on q[1], q[0] (reversed)
  u3(Q, 1, 0, Math.PI, Math.PI * 0.5);
  u3(Q, 0, 0, 0, Math.PI * 0.5);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI, 0, Math.PI * 0.5);
  u3(Q, 0, Math.PI, 0, Math.PI * 1.5);

  // Gate: XX**1.1 on q[1], q[0] (reversed)
  u3(Q, 1, Math.PI * 0.5, Math.PI * 1.5, Math.PI * 1.5);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);

  // Layer 3 rotation
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);

  // Gate: CNOT**1.1 on q[0], q[1]
  ry(Q, 1, -Math.PI * 0.5);
  u3(Q, 0, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 1, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.05);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.3, Math.PI);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 1.8, 0);
  ry(Q, 1, Math.PI * 0.5);

  // Gate: CZ**1.1 on q[0], q[1]
  u3(Q, 0, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 1, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.05);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.3, Math.PI);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 1.8, 0);

  // Layer 4 rotation
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);

  // Gate: ZZ**1.1 on q[0], q[1]
  rz(Q, 0, Math.PI * 1.1);
  rz(Q, 1, Math.PI * 1.1);
  u3(Q, 0, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 1, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.65, Math.PI);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.15, 0);

  // Gate: YY**1.1 on q[0], q[1]
  u3(Q, 0, 0, Math.PI, Math.PI * 0.5);
  u3(Q, 1, 0, 0, Math.PI * 0.5);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI, 0, Math.PI * 0.5);
  u3(Q, 1, Math.PI, 0, Math.PI * 1.5);

  // Gate: XX**1.1 on q[0], q[1]
  u3(Q, 0, Math.PI * 0.5, Math.PI * 1.5, Math.PI * 1.5);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);
  rx(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, Math.PI * 0.4);
  ry(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, -Math.PI * 0.5);
  rz(Q, 1, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);

  // Layer 5 rotation
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);

  // Gate: ZZ**1.1 on q[1], q[0] (reversed)
  rz(Q, 1, Math.PI * 1.1);
  rz(Q, 0, Math.PI * 1.1);
  u3(Q, 1, Math.PI * 0.5, 0, Math.PI * 0.25);
  u3(Q, 0, Math.PI * 0.5, Math.PI, Math.PI * 0.75);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.65, Math.PI);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.15, 0);

  // Gate: YY**1.1 on q[1], q[0] (reversed)
  u3(Q, 1, 0, Math.PI, Math.PI * 0.5);
  u3(Q, 0, 0, 0, Math.PI * 0.5);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI, 0, Math.PI * 0.5);
  u3(Q, 0, Math.PI, 0, Math.PI * 1.5);

  // Gate: XX**1.1 on q[1], q[0] (reversed)
  u3(Q, 1, Math.PI * 0.5, Math.PI * 1.5, Math.PI * 1.5);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);
  rx(Q, 1, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  rx(Q, 1, Math.PI * 0.4);
  ry(Q, 0, Math.PI * 0.5);
  Q.bit(0).cx(Q.bit(1));
  rx(Q, 0, -Math.PI * 0.5);
  rz(Q, 0, Math.PI * 0.5);
  Q.bit(1).cx(Q.bit(0));
  u3(Q, 1, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  u3(Q, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 1.5);

  // Layer 6 rotation
  rx(Q, 1, Math.PI * 0.3501408748);
  ry(Q, 1, Math.PI * 0.3501408748);
  rz(Q, 1, Math.PI * 0.3501408748);
  rx(Q, 0, Math.PI * 0.3501408748);
  ry(Q, 0, Math.PI * 0.3501408748);
  rz(Q, 0, Math.PI * 0.3501408748);

  // Measure both
  Q.all().measure();
});

return c;
