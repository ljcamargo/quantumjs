export const BENCH_SAMPLE = `// 3-bit Quantum Fourier Transform using modern Pipeline DSL
const p = Quantum.pipeline(3, {
  input: "101", // Binary string input (endianness: big-endian)
  output: "readEach" // Auto-maps measurements q[i] -> c[i]
}, Q => {
  Q.comment("QFT using scoped descend layouts");
  Q.descend(subQ => {
    subQ.last().h();
    subQ.descend(innerQ => {
      innerQ.last().cp(
        innerQ.first(), 
        Q.π.div(Math.pow(2, 1 + innerQ.parentSpan - innerQ.iteration))
      );
    });
  });
});

return p;`;
