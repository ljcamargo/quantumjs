// dnn_n8 — 8-qubit deep neural network circuit (Cirq generated)
// Source: QASMBench/small/dnn_n8/dnn_n8.qasm
// Uses: u3 (for rx/ry/rz), cx, with ZZ/YY/XX/CNOT/CZ decompositions


// Helper: rx(theta) = u3(theta, -pi/2, pi/2)

function rx(Q, qubit, theta) {
  Q.bit(qubit).u([theta, -Math.PI / 2, Math.PI / 2]);
}
// Helper: ry(theta) = u3(theta, 0, 0)
function ry(Q, qubit, theta) {
  Q.bit(qubit).u([theta, 0, 0]);
}
// Helper: rz(phi) = u3(0, 0, phi)
function rz(Q, qubit, phi) {
  Q.bit(qubit).u([0, 0, phi]);
}
// Helper: u3 = u([theta, phi, lambda])
function u3(Q, qubit, theta, phi, lambda) {
  Q.bit(qubit).u([theta, phi, lambda]);
}
// Single qubit gate block
function rotBlock(Q, qA, qB) {
  const a = Math.PI * 0.3501408748;
  rx(Q, qA, a); ry(Q, qA, a); rz(Q, qA, a);
  rx(Q, qB, a); ry(Q, qB, a); rz(Q, qB, a);
}
// ZZ**1.1 decomposition
function zzGate(Q, qA, qB) {
  const p = Math.PI;
  rz(Q, qA, p * 1.1); rz(Q, qB, p * 1.1);
  u3(Q, qA, p * 0.5, 0, p * 0.25);
  u3(Q, qB, p * 0.5, p, p * 0.75);
  rx(Q, qA, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  rx(Q, qA, p * 0.4);
  ry(Q, qB, p * 0.5);
  Q.bit(qB).cx(Q.bit(qA));
  rx(Q, qB, -p * 0.5);
  rz(Q, qB, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  u3(Q, qA, p * 0.5, p * 0.65, p);
  u3(Q, qB, p * 0.5, p * 0.15, 0);
}
// YY**1.1 decomposition
function yyGate(Q, qA, qB) {
  const p = Math.PI;
  u3(Q, qA, 0, p, p * 0.5);
  u3(Q, qB, 0, 0, p * 0.5);
  rx(Q, qA, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  rx(Q, qA, p * 0.4);
  ry(Q, qB, p * 0.5);
  Q.bit(qB).cx(Q.bit(qA));
  rx(Q, qB, -p * 0.5);
  rz(Q, qB, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  u3(Q, qA, p, 0, p * 0.5);
  u3(Q, qB, p, 0, p * 1.5);
}
// XX**1.1 decomposition
function xxGate(Q, qA, qB) {
  const p = Math.PI;
  u3(Q, qA, p * 0.5, p * 1.5, p * 1.5);
  u3(Q, qB, p * 0.5, p * 0.5, p * 1.5);
  rx(Q, qA, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  rx(Q, qA, p * 0.4);
  ry(Q, qB, p * 0.5);
  Q.bit(qB).cx(Q.bit(qA));
  rx(Q, qB, -p * 0.5);
  rz(Q, qB, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  u3(Q, qA, p * 0.5, p * 0.5, p * 0.5);
  u3(Q, qB, p * 0.5, p * 0.5, p * 1.5);
}
// CNOT**1.1 decomposition (control at qA, target at qB)
function cnotGate(Q, qA, qB) {
  const p = Math.PI;
  ry(Q, qB, -p * 0.5);
  u3(Q, qA, p * 0.5, 0, p * 0.25);
  u3(Q, qB, p * 0.5, p, p * 0.75);
  rx(Q, qA, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  rx(Q, qA, p * 0.05);
  ry(Q, qB, p * 0.5);
  Q.bit(qB).cx(Q.bit(qA));
  rx(Q, qB, -p * 0.5);
  rz(Q, qB, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  u3(Q, qA, p * 0.5, p * 0.3, p);
  u3(Q, qB, p * 0.5, p * 1.8, 0);
  ry(Q, qB, p * 0.5);
}
// CZ**1.1 decomposition
function czGate(Q, qA, qB) {
  const p = Math.PI;
  u3(Q, qA, p * 0.5, 0, p * 0.25);
  u3(Q, qB, p * 0.5, p, p * 0.75);
  rx(Q, qA, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  rx(Q, qA, p * 0.05);
  ry(Q, qB, p * 0.5);
  Q.bit(qB).cx(Q.bit(qA));
  rx(Q, qB, -p * 0.5);
  rz(Q, qB, p * 0.5);
  Q.bit(qA).cx(Q.bit(qB));
  u3(Q, qA, p * 0.5, p * 0.3, p);
  u3(Q, qB, p * 0.5, p * 1.8, 0);
}

const c = Quantum.circuit({ qubits: 8 }, Q => {
  const a = Math.PI * 0.3501408748;
  const p = Math.PI;

  // ===== Layer 1: Pairs (0,1) =====
  rotBlock(Q, 0, 1);
  zzGate(Q, 0, 1);
  yyGate(Q, 0, 1);
  xxGate(Q, 0, 1);
  rotBlock(Q, 0, 1);
  rotBlock(Q, 2, 3);
  zzGate(Q, 2, 3);
  yyGate(Q, 2, 3);
  xxGate(Q, 2, 3);
  rotBlock(Q, 2, 3);
  rotBlock(Q, 4, 5);
  zzGate(Q, 4, 5);
  yyGate(Q, 4, 5);
  xxGate(Q, 4, 5);
  rotBlock(Q, 4, 5);
  rotBlock(Q, 6, 7);
  zzGate(Q, 6, 7);
  yyGate(Q, 6, 7);
  xxGate(Q, 6, 7);
  rotBlock(Q, 6, 7);

  // Interleaved pairs (1,2), (3,4), (5,6), (7,0)
  rotBlock(Q, 1, 2);
  zzGate(Q, 1, 2);
  yyGate(Q, 1, 2);
  xxGate(Q, 1, 2);
  rotBlock(Q, 1, 2);
  rotBlock(Q, 3, 4);
  zzGate(Q, 3, 4);
  yyGate(Q, 3, 4);
  xxGate(Q, 3, 4);
  rotBlock(Q, 3, 4);
  rotBlock(Q, 5, 6);
  zzGate(Q, 5, 6);
  yyGate(Q, 5, 6);
  xxGate(Q, 5, 6);
  rotBlock(Q, 5, 6);
  rotBlock(Q, 7, 0);
  zzGate(Q, 7, 0);
  yyGate(Q, 7, 0);
  xxGate(Q, 7, 0);
  rotBlock(Q, 7, 0);

  // Layer 2 rotation blocks
  rotBlock(Q, 0, 1);
  zzGate(Q, 0, 1);
  yyGate(Q, 0, 1);
  xxGate(Q, 0, 1);
  rotBlock(Q, 0, 1);
  rotBlock(Q, 2, 3);
  zzGate(Q, 2, 3);
  yyGate(Q, 2, 3);
  xxGate(Q, 2, 3);
  rotBlock(Q, 2, 3);
  rotBlock(Q, 4, 5);
  zzGate(Q, 4, 5);
  yyGate(Q, 4, 5);
  xxGate(Q, 4, 5);
  rotBlock(Q, 4, 5);
  rotBlock(Q, 6, 7);
  zzGate(Q, 6, 7);
  yyGate(Q, 6, 7);
  xxGate(Q, 6, 7);
  rotBlock(Q, 6, 7);

  // Interleaved pairs (1,2), (3,4), (5,6), (7,0)
  rotBlock(Q, 1, 2);
  zzGate(Q, 1, 2);
  yyGate(Q, 1, 2);
  xxGate(Q, 1, 2);
  rotBlock(Q, 1, 2);
  rotBlock(Q, 3, 4);
  zzGate(Q, 3, 4);
  yyGate(Q, 3, 4);
  xxGate(Q, 3, 4);
  rotBlock(Q, 3, 4);
  rotBlock(Q, 5, 6);
  zzGate(Q, 5, 6);
  yyGate(Q, 5, 6);
  xxGate(Q, 5, 6);
  rotBlock(Q, 5, 6);
  rotBlock(Q, 7, 0);
  zzGate(Q, 7, 0);
  yyGate(Q, 7, 0);
  xxGate(Q, 7, 0);
  rotBlock(Q, 7, 0);

  // ===== CNOT**1.1 gates =====
  cnotGate(Q, 0, 1);
  cnotGate(Q, 2, 3);
  cnotGate(Q, 4, 5);
  cnotGate(Q, 6, 7);

  // ===== CZ**1.1 gates =====
  czGate(Q, 0, 1);
  czGate(Q, 2, 3);
  czGate(Q, 4, 5);
  czGate(Q, 6, 7);

  // ===== More CNOT**1.1 on interleaved pairs =====
  cnotGate(Q, 1, 2);
  cnotGate(Q, 3, 4);
  cnotGate(Q, 5, 6);
  cnotGate(Q, 7, 0);

  // ===== More CZ**1.1 on interleaved =====
  czGate(Q, 1, 2);
  czGate(Q, 3, 4);
  czGate(Q, 5, 6);
  czGate(Q, 7, 0);

  // ===== Layer 3: ZZ/YY/XX pairs =====
  rotBlock(Q, 0, 1);
  zzGate(Q, 0, 1);
  yyGate(Q, 0, 1);
  xxGate(Q, 0, 1);
  rotBlock(Q, 0, 1);
  rotBlock(Q, 2, 3);
  zzGate(Q, 2, 3);
  yyGate(Q, 2, 3);
  xxGate(Q, 2, 3);
  rotBlock(Q, 2, 3);
  rotBlock(Q, 4, 5);
  zzGate(Q, 4, 5);
  yyGate(Q, 4, 5);
  xxGate(Q, 4, 5);
  rotBlock(Q, 4, 5);
  rotBlock(Q, 6, 7);
  zzGate(Q, 6, 7);
  yyGate(Q, 6, 7);
  xxGate(Q, 6, 7);
  rotBlock(Q, 6, 7);

  // Interleaved
  rotBlock(Q, 1, 2);
  zzGate(Q, 1, 2);
  yyGate(Q, 1, 2);
  xxGate(Q, 1, 2);
  rotBlock(Q, 1, 2);
  rotBlock(Q, 3, 4);
  zzGate(Q, 3, 4);
  yyGate(Q, 3, 4);
  xxGate(Q, 3, 4);
  rotBlock(Q, 3, 4);
  rotBlock(Q, 5, 6);
  zzGate(Q, 5, 6);
  yyGate(Q, 5, 6);
  xxGate(Q, 5, 6);
  rotBlock(Q, 5, 6);
  rotBlock(Q, 7, 0);
  zzGate(Q, 7, 0);
  yyGate(Q, 7, 0);
  xxGate(Q, 7, 0);
  rotBlock(Q, 7, 0);

  // Final rotation block
  rotBlock(Q, 0, 1);

  // Measure all
  Q.all().measure();
});

return c;
