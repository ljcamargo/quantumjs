/* 
*  This codes implements an n-bit control (X) gate like an "extended toffoli" with 3 or more control bits 
*  i.e. having toffoli: ccx q[0],q[2],q[3]
*  ncx compiles to a circuit that allows somethings like ccx q[0],q[2],q[3],q[4],.....,q[n]
*
*  Based on a Lambda n–1(X) implementation devised in:
*  Z. Diao et al. A Quantum Circuit Design for Grover’s Algorithm
*/


function ncx(Q, values) {
  var span = [];
  span.push(values[0]); span.push(values[1]); span.push('');
  for (var i = 2; i < values.length; i++) {
    span.push(values[i]); span.push('');
  }
  Q.comment("Initial State");
  Q.init(span);
  Q.barrier().brk();
  Q.comment("n-bit control circuit");
  for (var i = 0; i <= values.length; i+=2) {
    Q.comment("toffoli "+i+" "+(i+1)+" "+(i+2));
    Q.bit(i).ccx(i+1, i+2);
  }
  Q.brk();
  Q.comment("backward!");
  Q.brk();
  var l = (values.length % 2 == 0) ? 0 : 1;
  for (var i = (values.length-l); i >= 2; i-=2) {
    Q.comment("toffoli "+(i-2)+" "+(i-1)+" "+(i));
    Q.bit(i-2).ccx(i-1, i);
  }
  Q.brk();
  return Q;
}

var Q = new QProcessor();
Q = ncx(Q, [1,1,1,1]);
Q.bit().measure();
var result = Q.compile();
console.log(result);