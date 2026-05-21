export const BENCH_SAMPLE = `// 3-bit Quantum Scoped Stairs Comparison
const c = Quantum.circuit({ qubits: 3 }, Q => {
  Q.comment("Staircase Visualizer with CNOTs");
  Q.input("101");
  Q.barrier().brk();
  
  Q.comment("growUp (bottom-aligned growing)");
  Q.growUp(q => {
    q.first().cx(q.last());
  });
  Q.barrier();
  
  Q.comment("growDown (top-aligned growing)");
  Q.growDown(q => {
    q.first().cx(q.last());
  });
  Q.barrier();
  
  Q.comment("shrinkUp (top-aligned shrinking)");
  Q.shrinkUp(q => {
    q.first().cx(q.last());
  });
  Q.barrier();
  
  Q.comment("shrinkDown (bottom-aligned shrinking)");
  Q.shrinkDown(q => {
    q.first().cx(q.last());
  });
  
  Q.barrier();
  Q.all().measure();
});

return c;`;
