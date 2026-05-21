export const BENCH_SAMPLE = `// 3-bit Quantum Fourier Transform Comparison
const c = Quantum.circuit({ qubits: 3 }, Q => {
  Q.comment("3-bit Quantum Fourier Transform");
  Q.input("101");
  Q.barrier().brk();
  
  Q.comment("iteration with sugars");
  // Outer loop: top-aligned, decreasing (shrinkUp)
  Q.shrinkUp(q => {
      // Inner loop: bottom-aligned, decreasing (shrinkDown)
      q.shrinkDown(r => {
          if (r.iteration < q.iteration) {
              r.last().cp(
                  r.first(),
                  r.π.div(2 ** (1 + q.iteration - r.iteration))
              );
          }
      });
      q.last().h().brk();
  });
  
  Q.barrier();
  
  Q.comment("iteration with simple loops");
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < i; j++) {
      Q.bit(i).cp(Q.bit(j), Q.π.div(2 ** (i - j)));
    }
    Q.bit(i).h().brk();
  }
  
  Q.barrier();
  Q.all().measure();
});

return c;`;
