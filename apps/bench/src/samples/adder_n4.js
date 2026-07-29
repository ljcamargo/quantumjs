// Quantum ripple-carry adder (4 qubits)
// Source: QASMBench - https://github.com/pnnl/QASMBench
// Attribution: Scaffold (https://github.com/epiqc/ScaffCC)
// Based on Cuccaro et al, quant-ph/0410184

const c = Quantum.circuit({ qubits: 4 }, Q => {
  const a = "1" // Value A
  const b = "1" // Value B
  Q.input(a+b);

  Q.bit(3).h();
  Q.bit(2).cx(Q.bit(3));

  // T gate layer (q[0-2] get T, q[3] gets T†)
  Q.bits([0, 1, 2]).t();
  Q.bit(3).t_();

  // CX cross layer
  Q.barrier();
  Q.bits([0,2,3,1,0,2]).cx(Q.bits([1,3,0,2,1,3]));
  Q.barrier();
  
  // T† inverse layer
  Q.bits([0, 1, 2]).t_();
  Q.bit(3).t();

  // CX cross layer (mirror)
  Q.bits([0,2]).cx(Q.bits([1,3]));

  Q.bit(3).s().cx(Q.bit(0)).h();

  Q.all().measure();
});
return c;
