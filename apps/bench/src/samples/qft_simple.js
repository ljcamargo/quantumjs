const c = Quantum.circuit({ qubits: 4 }, Q => {
  Q.comment("4-bit Quantum Fourier Transform");
  Q.input("101");
  Q.barrier().brk();
  Q.comment("iteration with sugars");

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < i; j++) {
      Q.bit(i).cp(Q.bit(j), Q.π.div(2 ** i-j));
    }
    Q.bit(i).h().brk();
  }
  Q.barrier();
  Q.all().measure();
});

return c;
