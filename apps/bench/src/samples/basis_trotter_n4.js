// basis_trotter_n4 — 4-qubit basis Trotter circuit (Cirq generated)
// Source: QASMBench/small/basis_trotter_n4/basis_trotter_n4.qasm
// Uses: z, rz, cx, h, u3, rx, ry, swap, with PhasedISWAP and CZ decompositions


// Helper: rx(theta) = u3(theta, -pi/2, pi/2)

function rx(Q, q, t) { Q.bit(q).u([t, -Math.PI/2, Math.PI/2]); }
// Helper: ry(theta) = u3(theta, 0, 0)
function ry(Q, q, t) { Q.bit(q).u([t, 0, 0]); }
// Helper: rz(phi) = u3(0, 0, phi)
function rz(Q, q, p) { Q.bit(q).u([0, 0, p]); }
// Helper: u3
function u3(Q, q, t, p, l) { Q.bit(q).u([t, p, l]); }

// PhasedISWAP decomposition pattern (repeating)
function phasedISWAP(Q, a, b, k) {
  const p = Math.PI;
  rz(Q, a, p * 0.25);
  rz(Q, b, p * -0.25);
  Q.bit(a).cx(Q.bit(b));
  Q.bit(a).h();
  Q.bit(b).cx(Q.bit(a));
  rz(Q, a, p * k);
  Q.bit(b).cx(Q.bit(a));
  rz(Q, a, p * -k);
  Q.bit(a).h();
  Q.bit(a).cx(Q.bit(b));
  rz(Q, a, p * -0.25);
  rz(Q, b, p * 0.25);
}

// CZ**x decomposition pattern
function czDecomp(Q, a, b, k, u0a, u0b, u1a, u1b) {
  const p = Math.PI;
  u3(Q, a, p*0.5, 0, p*u0a);
  u3(Q, b, p*0.5, p, p*u0b);
  rx(Q, a, p*0.5);
  Q.bit(a).cx(Q.bit(b));
  rx(Q, a, p*k);
  ry(Q, b, p*0.5);
  Q.bit(b).cx(Q.bit(a));
  rx(Q, b, -p*0.5);
  rz(Q, b, p*0.5);
  Q.bit(a).cx(Q.bit(b));
  u3(Q, a, p*0.5, p*u1a, p);
  u3(Q, b, p*0.5, p*u1b, 0);
}

const c = Quantum.circuit({ qubits: 4 }, Q => {
  const p = Math.PI;

  // Initial Z gates
  Q.bit(0).z();
  Q.bit(1).z();
  Q.bit(2).z();
  Q.bit(3).z();

  // Gate: PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // Gate: PhasedISWAP**0.08130614625631793 on q[0], q[1]
  phasedISWAP(Q, 0, 1, 0.0406530731);

  // Gate: PhasedISWAP**-0.08130614625631793 on q[2], q[3]
  phasedISWAP(Q, 2, 3, -0.0406530731);

  rz(Q, 0, p * 0.1123177385);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  rz(Q, 1, p * 0.1123177385);
  rz(Q, 3, p * 0.0564909955);
  rz(Q, 2, p * 0.0564909955);

  // Repeating PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**-0.05102950815299322 on q[0], q[1]
  phasedISWAP(Q, 0, 1, -0.0255147541);

  // PhasedISWAP**0.05102950815299322 on q[2], q[3]
  phasedISWAP(Q, 2, 3, 0.0255147541);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // CZ**-0.048279591094340914 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4758602045, 0.5, 1.0, 0.4758602045, 1.9758602045);
  Q.bit(0).swap(Q.bit(1));

  // CZ**-0.022156912718971442 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4889215436, 1.75, 1.25, 1.2389215436, 1.7389215436);
  Q.bit(2).swap(Q.bit(3));

  // CZ**-0.03270667647415345 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);
  Q.bit(1).swap(Q.bit(2));

  // CZ**-0.03270667647415345 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  // CZ**-0.03270667647415345 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  Q.bit(0).swap(Q.bit(1));
  Q.bit(2).swap(Q.bit(3));

  // CZ**-0.03270667647415345 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  rz(Q, 3, p * -0.0241397955);
  rz(Q, 0, p * -0.0110784564);
  Q.bit(1).swap(Q.bit(2));
  rz(Q, 2, p * -0.0241397955);
  rz(Q, 1, p * -0.0110784564);
  Q.bit(2).z();
  Q.bit(1).z();

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**-0.9500630905158097 on q[3], q[2]
  phasedISWAP(Q, 3, 2, -0.4750315453);

  // PhasedISWAP**0.9500630905158097 on q[1], q[0]
  phasedISWAP(Q, 1, 0, 0.4750315453);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // CZ**-0.013654184706660842 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4931729076, 1.5, 1.0, 1.4931729076, 1.9931729076);
  Q.bit(3).swap(Q.bit(2));

  // CZ**-0.006328040119021747 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4968359799, 1.4961253835, 1.9961253835, 1.5007105964, 1.0007105964);
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.009295387491454189 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);
  Q.bit(2).swap(Q.bit(1));

  // CZ**0.009295387491454189 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  // CZ**0.009295387491454189 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.009295387491454189 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  rz(Q, 0, p * -0.0068270924);
  rz(Q, 3, p * -0.0031640201);
  Q.bit(2).swap(Q.bit(1));
  Q.bit(0).z();
  Q.bit(3).z();
  rz(Q, 1, p * -0.0068270924);
  rz(Q, 2, p * -0.0031640201);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**-0.5017530508495694 on q[0], q[1]
  phasedISWAP(Q, 0, 1, -0.2508765254);

  // PhasedISWAP**0.5017530508495694 on q[2], q[3]
  phasedISWAP(Q, 2, 3, 0.2508765254);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // CZ**-0.00046375097365492423 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4997681245, 1.5001274262, 1.0001274262, 1.4996406983, 1.9996406983);
  Q.bit(0).swap(Q.bit(1));

  // CZ**-0.0004129506013584246 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4997935247, 1.4998373235, 1.9998373235, 1.4999562012, 0.9999562012);
  Q.bit(2).swap(Q.bit(3));

  // CZ**0.00043761426330885954 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);
  Q.bit(1).swap(Q.bit(2));

  // CZ**0.00043761426330885954 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  // CZ**0.00043761426330885954 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  Q.bit(0).swap(Q.bit(1));
  Q.bit(2).swap(Q.bit(3));

  // CZ**0.00043761426330885954 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  rz(Q, 3, p * -0.0002318755);
  rz(Q, 0, p * -0.0002064753);
  Q.bit(1).swap(Q.bit(2));
  Q.bit(3).z();
  Q.bit(0).z();
  rz(Q, 2, p * -0.0002318755);
  rz(Q, 1, p * -0.0002064753);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**-0.4158482042253096 on q[3], q[2]
  phasedISWAP(Q, 3, 2, -0.2079241021);

  // PhasedISWAP**0.4158482042253096 on q[1], q[0]
  phasedISWAP(Q, 1, 0, 0.2079241021);

  Q.bit(3).z();

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  Q.bit(2).z();
  Q.bit(0).z();
  Q.bit(1).z();

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**0.08130614625631793 on q[3], q[2]
  phasedISWAP(Q, 3, 2, 0.0406530731);

  // PhasedISWAP**-0.08130614625631793 on q[1], q[0]
  phasedISWAP(Q, 1, 0, -0.0406530731);

  rz(Q, 3, p * 0.1123177385);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  rz(Q, 2, p * 0.1123177385);
  rz(Q, 0, p * 0.0564909955);
  rz(Q, 1, p * 0.0564909955);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**-0.05102950815299322 on q[3], q[2]
  phasedISWAP(Q, 3, 2, -0.0255147541);

  // PhasedISWAP**0.05102950815299322 on q[1], q[0]
  phasedISWAP(Q, 1, 0, 0.0255147541);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // CZ**-0.048279591094340914 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4758602045, 0.5, 1.0, 0.4758602045, 1.9758602045);
  Q.bit(3).swap(Q.bit(2));

  // CZ**-0.022156912718971442 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4889215436, 1.75, 1.25, 1.2389215436, 1.7389215436);
  Q.bit(1).swap(Q.bit(0));

  // CZ**-0.03270667647415345 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);
  Q.bit(2).swap(Q.bit(1));

  // CZ**-0.03270667647415345 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  // CZ**-0.03270667647415345 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));

  // CZ**-0.03270667647415345 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  rz(Q, 0, p * -0.0241397955);
  rz(Q, 3, p * -0.0110784564);
  Q.bit(2).swap(Q.bit(1));
  rz(Q, 1, p * -0.0241397955);
  rz(Q, 2, p * -0.0110784564);
  Q.bit(1).z();
  Q.bit(2).z();

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**-0.9500630905158097 on q[0], q[1]
  phasedISWAP(Q, 0, 1, -0.4750315453);

  // PhasedISWAP**0.9500630905158097 on q[2], q[3]
  phasedISWAP(Q, 2, 3, 0.4750315453);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // CZ**-0.013654184706660842 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4931729076, 1.5, 1.0, 1.4931729076, 1.9931729076);
  Q.bit(0).swap(Q.bit(1));

  // CZ**-0.006328040119021747 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4968359799, 1.4961253835, 1.9961253835, 1.5007105964, 1.0007105964);
  Q.bit(2).swap(Q.bit(3));

  // CZ**0.009295387491454189 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);
  Q.bit(1).swap(Q.bit(2));

  // CZ**0.009295387491454189 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  // CZ**0.009295387491454189 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  Q.bit(0).swap(Q.bit(1));
  Q.bit(2).swap(Q.bit(3));

  // CZ**0.009295387491454189 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  rz(Q, 3, p * -0.0068270924);
  rz(Q, 0, p * -0.0031640201);
  Q.bit(1).swap(Q.bit(2));
  Q.bit(3).z();
  Q.bit(0).z();
  rz(Q, 2, p * -0.0068270924);
  rz(Q, 1, p * -0.0031640201);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**-0.5017530508495694 on q[3], q[2]
  phasedISWAP(Q, 3, 2, -0.2508765254);

  // PhasedISWAP**0.5017530508495694 on q[1], q[0]
  phasedISWAP(Q, 1, 0, 0.2508765254);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // CZ**-0.00046375097365492423 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4997681245, 1.5001274262, 1.0001274262, 1.4996406983, 1.9996406983);
  Q.bit(3).swap(Q.bit(2));

  // CZ**-0.0004129506013584246 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4997935247, 1.4998373235, 1.9998373235, 1.4999562012, 0.9999562012);
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.00043761426330885954 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);
  Q.bit(2).swap(Q.bit(1));

  // CZ**0.00043761426330885954 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  // CZ**0.00043761426330885954 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.00043761426330885954 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4997811929, 1.9993457511, 1.4993457511, 1.0008730561, 1.5008730561);

  rz(Q, 0, p * -0.0002318755);
  rz(Q, 3, p * -0.0002064753);
  Q.bit(2).swap(Q.bit(1));
  Q.bit(0).z();
  Q.bit(3).z();
  rz(Q, 1, p * -0.0002318755);
  rz(Q, 2, p * -0.0002064753);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**-0.4158482042253096 on q[0], q[1]
  phasedISWAP(Q, 0, 1, -0.2079241021);

  // PhasedISWAP**0.4158482042253096 on q[2], q[3]
  phasedISWAP(Q, 2, 3, 0.2079241021);

  Q.bit(0).z();

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  Q.bit(1).z();
  Q.bit(3).z();
  Q.bit(2).z();

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**0.08130614625631793 on q[0], q[1]
  phasedISWAP(Q, 0, 1, 0.0406530731);

  // PhasedISWAP**-0.08130614625631793 on q[2], q[3]
  phasedISWAP(Q, 2, 3, -0.0406530731);

  rz(Q, 0, p * 0.1123177385);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  rz(Q, 1, p * 0.1123177385);
  rz(Q, 3, p * 0.0564909955);
  rz(Q, 2, p * 0.0564909955);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // PhasedISWAP**-0.05102950815299322 on q[0], q[1]
  phasedISWAP(Q, 0, 1, -0.0255147541);

  // PhasedISWAP**0.05102950815299322 on q[2], q[3]
  phasedISWAP(Q, 2, 3, 0.0255147541);

  // PhasedISWAP**-1.0 on q[1], q[2]
  phasedISWAP(Q, 1, 2, -0.5);

  // CZ**-0.048279591094340914 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4758602045, 0.5, 1.0, 0.4758602045, 1.9758602045);
  Q.bit(0).swap(Q.bit(1));

  // CZ**-0.022156912718971442 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4889215436, 1.75, 1.25, 1.2389215436, 1.7389215436);
  Q.bit(2).swap(Q.bit(3));

  // CZ**-0.03270667647415345 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);
  Q.bit(1).swap(Q.bit(2));

  // CZ**-0.03270667647415345 on q[0], q[1]
  czDecomp(Q, 0, 1, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  // CZ**-0.03270667647415345 on q[2], q[3]
  czDecomp(Q, 2, 3, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  Q.bit(0).swap(Q.bit(1));
  Q.bit(2).swap(Q.bit(3));

  // CZ**-0.03270667647415345 on q[1], q[2]
  czDecomp(Q, 1, 2, 0.4836466618, 0, 1.5, 0.9836466618, 1.4836466618);

  rz(Q, 3, p * -0.0241397955);
  rz(Q, 0, p * -0.0110784564);
  Q.bit(1).swap(Q.bit(2));
  rz(Q, 2, p * -0.0241397955);
  rz(Q, 1, p * -0.0110784564);
  Q.bit(2).z();
  Q.bit(1).z();

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // PhasedISWAP**-0.9500630905158097 on q[3], q[2]
  phasedISWAP(Q, 3, 2, -0.4750315453);

  // PhasedISWAP**0.9500630905158097 on q[1], q[0]
  phasedISWAP(Q, 1, 0, 0.4750315453);

  // PhasedISWAP**-1.0 on q[2], q[1]
  phasedISWAP(Q, 2, 1, -0.5);

  // CZ**-0.013654184706660842 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4931729076, 1.5, 1.0, 1.4931729076, 1.9931729076);
  Q.bit(3).swap(Q.bit(2));

  // CZ**-0.006328040119021747 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4968359799, 1.4961253835, 1.9961253835, 1.5007105964, 1.0007105964);
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.009295387491454189 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);
  Q.bit(2).swap(Q.bit(1));

  // CZ**0.009295387491454189 on q[3], q[2]
  czDecomp(Q, 3, 2, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  // CZ**0.009295387491454189 on q[1], q[0]
  czDecomp(Q, 1, 0, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));

  // CZ**0.009295387491454189 on q[2], q[1]
  czDecomp(Q, 2, 1, 0.4953523063, 1.0820521548, 1.5820521548, 1.9225955389, 1.4225955389);

  rz(Q, 0, p * -0.0068270924);
  rz(Q, 3, p * -0.0031640201);
  Q.bit(2).swap(Q.bit(1));
  Q.bit(0).z();
  Q.bit(3).z();
  rz(Q, 1, p * -0.0068270924);
  rz(Q, 2, p * -0.0031640201);

  // Final SWAPs before measurement
  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));
  Q.bit(2).swap(Q.bit(1));
  Q.bit(3).swap(Q.bit(2));
  Q.bit(1).swap(Q.bit(0));
  Q.bit(2).swap(Q.bit(1));

  // Measure all
  Q.all().measure();
});

return c;
