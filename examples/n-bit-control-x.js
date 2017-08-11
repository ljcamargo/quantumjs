/* 
*  This codes implements an n-bit control (X) gate like an "extended toffoli" with 3 or more control bits 
*  i.e. having toffoli: ccx q[0],q[2],q[3]
*  ncx compiles to a circuit that allows somethings like ccx q[0],q[2],q[3],q[4],.....,q[n]
*
*  Based on a Lambda n–1(X) implementation devised in:
*  Z. Diao et al. A Quantum Circuit Design for Grover’s Algorithm
*/


function ncx(n) {
  for (var i = 0; i <= n; i+=2) {
    Q.bit(i).ccx(i+1, i+2);
  }
  var l = (n % 2 == 0) ? 0 : 1;
  for (var i = (n-l); i >= 2; i-=2) {
    Q.bit(i-2).ccx(i-1, i);
  }
}

function getNCXSpannedArray(arr) {
  var span = [];
  span.push(arr[0]); span.push(arr[1]); span.push('');
  for (var i = 2; i < arr.length; i++) {
    span.push(arr[i]); span.push('');
  }
  return span;
}

var values = [1,1,1,1];
var Q = new QuantumJS();
var span = getNCXSpannedArray(values);

Q.addFunction('ncx', ncx);
Q.comment("Set Initial State");
Q.init(span);
Q.barrier().brk();
Q.fnc.ncx(values.length);
Q.bit().measure();

var qasm = Q.compile();
console.log(qasm);