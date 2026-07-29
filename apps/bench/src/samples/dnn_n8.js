// 8-qubit deep quantum neural network (16 dimensions)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Reference (https://arxiv.org/abs/2012.00256)
// Generated from Cirq v0.8.0

const c = Quantum.circuit({ qubits: 8, bits: 8 }, Q => {
  const θ = 0.3501408748;
  const piA = Q.π.mult(0.5);
  const piB = Q.π.mult(0.4);
  const piC = Q.π.mult(1.5);
  const piD = Q.π.mult(-0.5);
  const piE = Q.π.mult(1);
  const piF = Q.π.mult(1.1);
  const piG = Q.π.mult(0.75);
  const piH = Q.π.mult(0.25);
  const piI = Q.π.mult(1.8);
  const piJ = Q.π.mult(0.65);
  const piK = Q.π.mult(0.3);
  const piL = Q.π.mult(0.15);
  const piM = Q.π.mult(0.05);

  Q.bit(0).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(0).rz(piF);
  Q.bit(1).rz(piF);
  Q.bit(0).u([piA,0,piH]);
  Q.bit(1).u([piA,piE,piG]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piJ,piE]);
  Q.bit(1).u([piA,piL,0]);
  // YY**1.1
  Q.bit(0).u([0,piE,piA]);
  Q.bit(1).u([0,0,piA]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piE,0,piA]);
  Q.bit(1).u([piE,0,piC]);
  // XX**1.1
  Q.bit(0).u([piA,piC,piC]);
  Q.bit(1).u([piA,piA,piC]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piA,piA]);
  Q.bit(1).u([piA,piA,piC]);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(2).rz(piF);
  Q.bit(3).rz(piF);
  Q.bit(2).u([piA,0,piH]);
  Q.bit(3).u([piA,piE,piG]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piJ,piE]);
  Q.bit(3).u([piA,piL,0]);
  // YY**1.1
  Q.bit(2).u([0,piE,piA]);
  Q.bit(3).u([0,0,piA]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piE,0,piA]);
  Q.bit(3).u([piE,0,piC]);
  // XX**1.1
  Q.bit(2).u([piA,piC,piC]);
  Q.bit(3).u([piA,piA,piC]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piA,piA]);
  Q.bit(3).u([piA,piA,piC]);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(4).rz(piF);
  Q.bit(5).rz(piF);
  Q.bit(4).u([piA,0,piH]);
  Q.bit(5).u([piA,piE,piG]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piJ,piE]);
  Q.bit(5).u([piA,piL,0]);
  // YY**1.1
  Q.bit(4).u([0,piE,piA]);
  Q.bit(5).u([0,0,piA]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piE,0,piA]);
  Q.bit(5).u([piE,0,piC]);
  // XX**1.1
  Q.bit(4).u([piA,piC,piC]);
  Q.bit(5).u([piA,piA,piC]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piA,piA]);
  Q.bit(5).u([piA,piA,piC]);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(6).rz(piF);
  Q.bit(7).rz(piF);
  Q.bit(6).u([piA,0,piH]);
  Q.bit(7).u([piA,piE,piG]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piJ,piE]);
  Q.bit(7).u([piA,piL,0]);
  // YY**1.1
  Q.bit(6).u([0,piE,piA]);
  Q.bit(7).u([0,0,piA]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piE,0,piA]);
  Q.bit(7).u([piE,0,piC]);
  // XX**1.1
  Q.bit(6).u([piA,piC,piC]);
  Q.bit(7).u([piA,piA,piC]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piA,piA]);
  Q.bit(7).u([piA,piA,piC]);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(1).rz(piF);
  Q.bit(2).rz(piF);
  Q.bit(1).u([piA,0,piH]);
  Q.bit(2).u([piA,piE,piG]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piJ,piE]);
  Q.bit(2).u([piA,piL,0]);
  // YY**1.1
  Q.bit(1).u([0,piE,piA]);
  Q.bit(2).u([0,0,piA]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piE,0,piA]);
  Q.bit(2).u([piE,0,piC]);
  // XX**1.1
  Q.bit(1).u([piA,piC,piC]);
  Q.bit(2).u([piA,piA,piC]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piA,piA]);
  Q.bit(2).u([piA,piA,piC]);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(3).rz(piF);
  Q.bit(4).rz(piF);
  Q.bit(3).u([piA,0,piH]);
  Q.bit(4).u([piA,piE,piG]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piJ,piE]);
  Q.bit(4).u([piA,piL,0]);
  // YY**1.1
  Q.bit(3).u([0,piE,piA]);
  Q.bit(4).u([0,0,piA]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piE,0,piA]);
  Q.bit(4).u([piE,0,piC]);
  // XX**1.1
  Q.bit(3).u([piA,piC,piC]);
  Q.bit(4).u([piA,piA,piC]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piA,piA]);
  Q.bit(4).u([piA,piA,piC]);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(5).rz(piF);
  Q.bit(6).rz(piF);
  Q.bit(5).u([piA,0,piH]);
  Q.bit(6).u([piA,piE,piG]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piJ,piE]);
  Q.bit(6).u([piA,piL,0]);
  // YY**1.1
  Q.bit(5).u([0,piE,piA]);
  Q.bit(6).u([0,0,piA]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piE,0,piA]);
  Q.bit(6).u([piE,0,piC]);
  // XX**1.1
  Q.bit(5).u([piA,piC,piC]);
  Q.bit(6).u([piA,piA,piC]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piA,piA]);
  Q.bit(6).u([piA,piA,piC]);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(7).rz(piF);
  Q.bit(0).rz(piF);
  Q.bit(7).u([piA,0,piH]);
  Q.bit(0).u([piA,piE,piG]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piJ,piE]);
  Q.bit(0).u([piA,piL,0]);
  // YY**1.1
  Q.bit(7).u([0,piE,piA]);
  Q.bit(0).u([0,0,piA]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piE,0,piA]);
  Q.bit(0).u([piE,0,piC]);
  // XX**1.1
  Q.bit(7).u([piA,piC,piC]);
  Q.bit(0).u([piA,piA,piC]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piA,piA]);
  Q.bit(0).u([piA,piA,piC]);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  // CNOT**1.1
  Q.bit(1).ry(piD);
  Q.bit(0).u([piA,0,piH]);
  Q.bit(1).u([piA,piE,piG]);
  Q.bit(0).rx(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).rx(piM);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piK,piE]);
  Q.bit(1).u([piA,piI,0]);
  Q.bit(1).ry(piA);
  // CNOT**1.1
  Q.bit(3).ry(piD);
  Q.bit(2).u([piA,0,piH]);
  Q.bit(3).u([piA,piE,piG]);
  Q.bit(2).rx(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).rx(piM);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piK,piE]);
  Q.bit(3).u([piA,piI,0]);
  Q.bit(3).ry(piA);
  // CNOT**1.1
  Q.bit(5).ry(piD);
  Q.bit(4).u([piA,0,piH]);
  Q.bit(5).u([piA,piE,piG]);
  Q.bit(4).rx(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).rx(piM);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piK,piE]);
  Q.bit(5).u([piA,piI,0]);
  Q.bit(5).ry(piA);
  // CNOT**1.1
  Q.bit(7).ry(piD);
  Q.bit(6).u([piA,0,piH]);
  Q.bit(7).u([piA,piE,piG]);
  Q.bit(6).rx(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).rx(piM);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piK,piE]);
  Q.bit(7).u([piA,piI,0]);
  Q.bit(7).ry(piA);
  // CZ**1.1
  Q.bit(0).u([piA,0,piH]);
  Q.bit(1).u([piA,piE,piG]);
  Q.bit(0).rx(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).rx(piM);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piK,piE]);
  Q.bit(1).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(2).u([piA,0,piH]);
  Q.bit(3).u([piA,piE,piG]);
  Q.bit(2).rx(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).rx(piM);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piK,piE]);
  Q.bit(3).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(4).u([piA,0,piH]);
  Q.bit(5).u([piA,piE,piG]);
  Q.bit(4).rx(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).rx(piM);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piK,piE]);
  Q.bit(5).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(6).u([piA,0,piH]);
  Q.bit(7).u([piA,piE,piG]);
  Q.bit(6).rx(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).rx(piM);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piK,piE]);
  Q.bit(7).u([piA,piI,0]);
  // CNOT**1.1
  Q.bit(2).ry(piD);
  Q.bit(1).u([piA,0,piH]);
  Q.bit(2).u([piA,piE,piG]);
  Q.bit(1).rx(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).rx(piM);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piK,piE]);
  Q.bit(2).u([piA,piI,0]);
  Q.bit(2).ry(piA);
  // CNOT**1.1
  Q.bit(4).ry(piD);
  Q.bit(3).u([piA,0,piH]);
  Q.bit(4).u([piA,piE,piG]);
  Q.bit(3).rx(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).rx(piM);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piK,piE]);
  Q.bit(4).u([piA,piI,0]);
  Q.bit(4).ry(piA);
  // CNOT**1.1
  Q.bit(6).ry(piD);
  Q.bit(5).u([piA,0,piH]);
  Q.bit(6).u([piA,piE,piG]);
  Q.bit(5).rx(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).rx(piM);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piK,piE]);
  Q.bit(6).u([piA,piI,0]);
  Q.bit(6).ry(piA);
  // CNOT**1.1
  Q.bit(0).ry(piD);
  Q.bit(7).u([piA,0,piH]);
  Q.bit(0).u([piA,piE,piG]);
  Q.bit(7).rx(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).rx(piM);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piK,piE]);
  Q.bit(0).u([piA,piI,0]);
  Q.bit(0).ry(piA);
  // CZ**1.1
  Q.bit(1).u([piA,0,piH]);
  Q.bit(2).u([piA,piE,piG]);
  Q.bit(1).rx(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).rx(piM);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piK,piE]);
  Q.bit(2).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(3).u([piA,0,piH]);
  Q.bit(4).u([piA,piE,piG]);
  Q.bit(3).rx(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).rx(piM);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piK,piE]);
  Q.bit(4).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(5).u([piA,0,piH]);
  Q.bit(6).u([piA,piE,piG]);
  Q.bit(5).rx(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).rx(piM);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piK,piE]);
  Q.bit(6).u([piA,piI,0]);
  // CZ**1.1
  Q.bit(7).u([piA,0,piH]);
  Q.bit(0).u([piA,piE,piG]);
  Q.bit(7).rx(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).rx(piM);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piK,piE]);
  Q.bit(0).u([piA,piI,0]);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(0).rz(piF);
  Q.bit(1).rz(piF);
  Q.bit(0).u([piA,0,piH]);
  Q.bit(1).u([piA,piE,piG]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piJ,piE]);
  Q.bit(1).u([piA,piL,0]);
  // YY**1.1
  Q.bit(0).u([0,piE,piA]);
  Q.bit(1).u([0,0,piA]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piE,0,piA]);
  Q.bit(1).u([piE,0,piC]);
  // XX**1.1
  Q.bit(0).u([piA,piC,piC]);
  Q.bit(1).u([piA,piA,piC]);
  Q.bit(0).rx(piA).cx(Q.bit(1)).rx(piB);
  Q.bit(1).ry(piA).cx(Q.bit(0)).rx(piD).rz(piA);
  Q.bit(0).cx(Q.bit(1));
  Q.bit(0).u([piA,piA,piA]);
  Q.bit(1).u([piA,piA,piC]);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(2).rz(piF);
  Q.bit(3).rz(piF);
  Q.bit(2).u([piA,0,piH]);
  Q.bit(3).u([piA,piE,piG]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piJ,piE]);
  Q.bit(3).u([piA,piL,0]);
  // YY**1.1
  Q.bit(2).u([0,piE,piA]);
  Q.bit(3).u([0,0,piA]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piE,0,piA]);
  Q.bit(3).u([piE,0,piC]);
  // XX**1.1
  Q.bit(2).u([piA,piC,piC]);
  Q.bit(3).u([piA,piA,piC]);
  Q.bit(2).rx(piA).cx(Q.bit(3)).rx(piB);
  Q.bit(3).ry(piA).cx(Q.bit(2)).rx(piD).rz(piA);
  Q.bit(2).cx(Q.bit(3));
  Q.bit(2).u([piA,piA,piA]);
  Q.bit(3).u([piA,piA,piC]);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(4).rz(piF);
  Q.bit(5).rz(piF);
  Q.bit(4).u([piA,0,piH]);
  Q.bit(5).u([piA,piE,piG]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piJ,piE]);
  Q.bit(5).u([piA,piL,0]);
  // YY**1.1
  Q.bit(4).u([0,piE,piA]);
  Q.bit(5).u([0,0,piA]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piE,0,piA]);
  Q.bit(5).u([piE,0,piC]);
  // XX**1.1
  Q.bit(4).u([piA,piC,piC]);
  Q.bit(5).u([piA,piA,piC]);
  Q.bit(4).rx(piA).cx(Q.bit(5)).rx(piB);
  Q.bit(5).ry(piA).cx(Q.bit(4)).rx(piD).rz(piA);
  Q.bit(4).cx(Q.bit(5));
  Q.bit(4).u([piA,piA,piA]);
  Q.bit(5).u([piA,piA,piC]);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(6).rz(piF);
  Q.bit(7).rz(piF);
  Q.bit(6).u([piA,0,piH]);
  Q.bit(7).u([piA,piE,piG]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piJ,piE]);
  Q.bit(7).u([piA,piL,0]);
  // YY**1.1
  Q.bit(6).u([0,piE,piA]);
  Q.bit(7).u([0,0,piA]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piE,0,piA]);
  Q.bit(7).u([piE,0,piC]);
  // XX**1.1
  Q.bit(6).u([piA,piC,piC]);
  Q.bit(7).u([piA,piA,piC]);
  Q.bit(6).rx(piA).cx(Q.bit(7)).rx(piB);
  Q.bit(7).ry(piA).cx(Q.bit(6)).rx(piD).rz(piA);
  Q.bit(6).cx(Q.bit(7));
  Q.bit(6).u([piA,piA,piA]);
  Q.bit(7).u([piA,piA,piC]);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(1).rz(piF);
  Q.bit(2).rz(piF);
  Q.bit(1).u([piA,0,piH]);
  Q.bit(2).u([piA,piE,piG]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piJ,piE]);
  Q.bit(2).u([piA,piL,0]);
  // YY**1.1
  Q.bit(1).u([0,piE,piA]);
  Q.bit(2).u([0,0,piA]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piE,0,piA]);
  Q.bit(2).u([piE,0,piC]);
  // XX**1.1
  Q.bit(1).u([piA,piC,piC]);
  Q.bit(2).u([piA,piA,piC]);
  Q.bit(1).rx(piA).cx(Q.bit(2)).rx(piB);
  Q.bit(2).ry(piA).cx(Q.bit(1)).rx(piD).rz(piA);
  Q.bit(1).cx(Q.bit(2));
  Q.bit(1).u([piA,piA,piA]);
  Q.bit(2).u([piA,piA,piC]);
  Q.bit(1).rx(θ).ry(θ).rz(θ);
  Q.bit(2).rx(θ).ry(θ).rz(θ);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(3).rz(piF);
  Q.bit(4).rz(piF);
  Q.bit(3).u([piA,0,piH]);
  Q.bit(4).u([piA,piE,piG]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piJ,piE]);
  Q.bit(4).u([piA,piL,0]);
  // YY**1.1
  Q.bit(3).u([0,piE,piA]);
  Q.bit(4).u([0,0,piA]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piE,0,piA]);
  Q.bit(4).u([piE,0,piC]);
  // XX**1.1
  Q.bit(3).u([piA,piC,piC]);
  Q.bit(4).u([piA,piA,piC]);
  Q.bit(3).rx(piA).cx(Q.bit(4)).rx(piB);
  Q.bit(4).ry(piA).cx(Q.bit(3)).rx(piD).rz(piA);
  Q.bit(3).cx(Q.bit(4));
  Q.bit(3).u([piA,piA,piA]);
  Q.bit(4).u([piA,piA,piC]);
  Q.bit(3).rx(θ).ry(θ).rz(θ);
  Q.bit(4).rx(θ).ry(θ).rz(θ);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(5).rz(piF);
  Q.bit(6).rz(piF);
  Q.bit(5).u([piA,0,piH]);
  Q.bit(6).u([piA,piE,piG]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piJ,piE]);
  Q.bit(6).u([piA,piL,0]);
  // YY**1.1
  Q.bit(5).u([0,piE,piA]);
  Q.bit(6).u([0,0,piA]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piE,0,piA]);
  Q.bit(6).u([piE,0,piC]);
  // XX**1.1
  Q.bit(5).u([piA,piC,piC]);
  Q.bit(6).u([piA,piA,piC]);
  Q.bit(5).rx(piA).cx(Q.bit(6)).rx(piB);
  Q.bit(6).ry(piA).cx(Q.bit(5)).rx(piD).rz(piA);
  Q.bit(5).cx(Q.bit(6));
  Q.bit(5).u([piA,piA,piA]);
  Q.bit(6).u([piA,piA,piC]);
  Q.bit(5).rx(θ).ry(θ).rz(θ);
  Q.bit(6).rx(θ).ry(θ).rz(θ);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  // ZZ**1.1
  Q.bit(7).rz(piF);
  Q.bit(0).rz(piF);
  Q.bit(7).u([piA,0,piH]);
  Q.bit(0).u([piA,piE,piG]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piJ,piE]);
  Q.bit(0).u([piA,piL,0]);
  // YY**1.1
  Q.bit(7).u([0,piE,piA]);
  Q.bit(0).u([0,0,piA]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piE,0,piA]);
  Q.bit(0).u([piE,0,piC]);
  // XX**1.1
  Q.bit(7).u([piA,piC,piC]);
  Q.bit(0).u([piA,piA,piC]);
  Q.bit(7).rx(piA).cx(Q.bit(0)).rx(piB);
  Q.bit(0).ry(piA).cx(Q.bit(7)).rx(piD).rz(piA);
  Q.bit(7).cx(Q.bit(0));
  Q.bit(7).u([piA,piA,piA]);
  Q.bit(0).u([piA,piA,piC]);
  Q.bit(7).rx(θ).ry(θ).rz(θ);
  Q.bit(0).rx(θ).ry(θ).rz(θ);
  Q.all().measure();
});
return c;
