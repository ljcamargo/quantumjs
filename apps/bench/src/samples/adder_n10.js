// Quantum ripple-carry adder from Cuccaro et al, quant-ph/0410184
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: OpenQASM (https://github.com/Qiskit/openqasm)
//
// 10 qubit mapping: cin[0]→0, a[0-3]→1-4, b[0-3]→5-8, cout[0]→9
// Input: a = 0001, b = 1111

const c = Quantum.circuit({ qubits: 10, bits: 5 }, Q => {
  // Define custom gates
  Q.addFunction('majority', (Q, a, b, c) => {
    Q.bit(c).cx(Q.bit(b));
    Q.bit(c).cx(Q.bit(a));
    Q.bit(a).ccx(Q.bit(b), Q.bit(c));
  });

  Q.addFunction('unmaj', (Q, a, b, c) => {
    Q.bit(a).ccx(Q.bit(b), Q.bit(c));
    Q.bit(c).cx(Q.bit(a));
    Q.bit(a).cx(Q.bit(b));
  });

  // Map registers: cin=0, a[0-3]=1-4, b[0-3]=5-8, cout=9
  const cin = 0, a0 = 1, a1 = 2, a2 = 3, a3 = 4;
  const b0 = 5, b1 = 6, b2 = 7, b3 = 8, cout = 9;

  // Input: a = 0001 (bit 0 = 1), b = 1111 (all 1s)
  Q.input("0100001110");

  // Ripple-carry addition
  Q.fnc.majority(cin, b0, a0);
  Q.fnc.majority(a0, b1, a1);
  Q.fnc.majority(a1, b2, a2);
  Q.fnc.majority(a2, b3, a3);
  Q.bit(a3).cx(Q.bit(cout));
  Q.fnc.unmaj(a2, b3, a3);
  Q.fnc.unmaj(a1, b2, a2);
  Q.fnc.unmaj(a0, b1, a1);
  Q.fnc.unmaj(cin, b0, a0);

  // Measure b[0-3] → ans[0-3], cout[0] → ans[4]
  Q.bit(b0).measureTo(0);
  Q.bit(b1).measureTo(1);
  Q.bit(b2).measureTo(2);
  Q.bit(b3).measureTo(3);
  Q.bit(cout).measureTo(4);
});
return c;
