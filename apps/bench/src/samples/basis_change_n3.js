// Transform the single-particle basis of a linearly connected electronic structure
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: OpenFermion (https://github.com/quantumlib/OpenFermion-Cirq)
// Generated from Cirq v0.8.0

const c = Quantum.circuit({ qubits: 3 }, Q => {
  const piA = Q.π.mult(0.1242949803);
  const piB = Q.π.mult(0.328242091);
  const piC = Q.π.mult(0.5);
  const piD = Q.π.mult(1.5);
  const piE = Q.π.mult(0.0564006755);
  const piF = Q.π.mult(0.2945501109);
  const piG = Q.π.mult(0.0298311566);
  const piH = Q.π.mult(0.7273849664);
  const piI = Q.π.mult(1.0);
  const piJ = Q.π.mult(0.1374475291);
  const piK = Q.π.mult(2.0);
  const piL = Q.π.mult(0.9766098537);
  const piM = Q.π.mult(0.2326621647);
  const piN = Q.π.mult(0.5780153762);
  const piO = Q.π.mult(0.6257049652);
  const piP = Q.π.mult(0.6817377913);
  const piQ = Q.π.mult(0.3593182384);
  const piR = Q.π.mult(1.3937948052);
  const piS = Q.π.mult(1.1556453697);

  // Initial layer
  Q.bit(2).u([piC, 0, piE]);
  Q.bit(1).u([piC, piD, piF]);
  Q.bit(0).u([piC, piD, piD]);

  Q.barrier();

  // Layer: pair (1,2)
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([piA, 0, 0]);
  Q.bit(1).u([piA, piC, piD]).cz(Q.bit(2));

  Q.barrier();

  // Layer: pair (0,1)
  Q.bit(2).u([piG, piD, piC]);
  Q.bit(1).u([piH, piD, piI]);
  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([piB, 0, 0]);
  Q.bit(0).u([piB, piC, piD]).cz(Q.bit(1));

  Q.barrier();

  // Layer: pair (1,2) again
  Q.bit(1).u([piJ, piK, piD]);
  Q.bit(0).u([piL, 0, 0]);
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([piM, 0, 0]);
  Q.bit(1).u([piM, piC, piD]).cz(Q.bit(2));

  Q.barrier();

  // Layer: pair (0,1) again
  Q.bit(2).u([piN, piC, piC]);
  Q.bit(1).u([piO, piC, 0]);
  Q.bit(0).cz(Q.bit(1));
  Q.bit(1).u([piB, 0, 0]);
  Q.bit(0).u([piB, piC, piD]).cz(Q.bit(1));

  Q.barrier();

  // Layer: pair (1,2) third time
  Q.bit(1).u([piP, 0, piC]);
  Q.bit(0).u([piC, piQ, piD]);
  Q.bit(1).cz(Q.bit(2));
  Q.bit(2).u([piA, 0, 0]);
  Q.bit(1).u([piA, piC, piD]).cz(Q.bit(2));

  Q.barrier();

  // Final pair
  Q.bit(2).u([piC, piR, 0]);
  Q.bit(1).u([piC, piS, piC]);

  Q.all().measure();
});
return c;
