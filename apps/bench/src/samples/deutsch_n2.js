// Implementation of Deutsch algorithm with two qubits for f(x)=x
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: OpenQASM (https://arxiv.org/pdf/1707.03429.pdf)

const c = Quantum.circuit({ qubits: 2, bits: 2 }, Q => {
  Q.input("01");
  Q.bits([0, 1]).h();
  Q.bit(0).cx(Q.bit(1)).h();
  Q.all().measure();
});
return c;
