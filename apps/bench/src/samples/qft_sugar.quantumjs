const c = Quantum.circuit({ qubits: 4 }, Q => {
  Q.comment("3-bit Quantum Fourier Transform w/Stairs");
  Q.input("1011");
  Q.barrier().brk();
  Q.growDown(q => {
      q.shrinkDown(r => {
          r.last().cp(
              r.first(),
              r.π.div(2 ** (1 + q.size - r.iteration))
          )
      });
      q.last().h();
  });
  Q.barrier();
  Q.all().measure();
});

return c;
