// Coherent superposition of two coherent states with opposite phase (Cat state)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Scaffold (https://github.com/epiqc/ScaffCC)

const c = Quantum.circuit({ qubits: 4 }, Q => {
  Q.bit(0).h().cx(Q.bit(1));
  Q.bits([1, 2]).cx(Q.bits([2, 3]));
  Q.all().measure();
});
return c;
