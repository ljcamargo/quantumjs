function qft(bits, values) {
  if (bits && bits instanceof Object) {
    values = bits; bits = values.length;
  }
  var Q = new QProcessor();
  Q.comment(bits + "-bit Quantum Fourier Transform");
  if (values) Q.init(values);
  Q.barrier().brk();
  for (var i = 0; i < bits; i++) {
    for (var j = 0; j < i; j++) {
      Q.bit(i).cu1(π.div(Math.pow(2, i-j)), j);
    }
    Q.bit(i).h().brk();
  }
  Q.bit().measure();
  return Q.compile();
};

//USAGE EXAMPLE
//8-BIT QUANTUM FOURIER TRANSFORM;
var qasm = qft([1,0,1,0,1,0,1,0]); 