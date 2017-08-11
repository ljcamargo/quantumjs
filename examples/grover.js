//////    WARNING !!!!
//////    PROTOTYPE! NOT TESTED !!!!
//////

function getNCXMask(values) {
  var mask = [1,1,0];
  for (var i = 2; i < values.length; i++) {
    mask.push(1); mask.push(0);
  }
  return mask;
}

function invertMask(mask) {
  var imask = [];
  for (var i = 0; i < mask.length; i++) {
    imask[i] = (mask[i] == 0) ? 1 : 0;
  }
  return imask;
}

function ncx(n) {
  for (var i = 0; i <= n; i+=2) {
    Q.bit(i).ccx(i+1, i+2);
  }
  var l = (n % 2 == 0) ? 0 : 1;
  for (var i = (n-l); i >= 2; i-=2) {
    Q.bit(i-2).ccx(i-1, i);
  }
}

function grover(input, iters) {
  var mask = getNCXMask(input);
  var imask = invertMask(mask);

  Q.comment("Walsch Hadamard Block: Preparing uniform superposition");
  Q.mask(mask, bit => bit.h());
  Q.brk();

  Q.comment("Oracle");
  Q.mask(imask, bit => bit.s());
  Q.bit(mask.length-1).h();
  Q.fnc.ncx(input.length);
  Q.bit(mask.length-1).h();
  Q.mask(imask, bit => bit.s());
  Q.brk().brk();

  Q.comment("Grover Iterator");
  for (var i = 0; i < iters; i++) {
    Q.comment("Iter " + i);
    Q.mask(mask, bit => bit.h());
    Q.mask(mask, bit => bit.x());
    Q.bit(mask.length-1).h();
    Q.fnc.ncx(input.length);
    Q.bit(mask.length-1).h();
    Q.mask(mask, bit => bit.x());
    Q.mask(mask, bit => bit.h());
    Q.brk();
  }
}

var Q = new QuantumJS();
var input = [1,1,1,1];
Q.addFunction('ncx', ncx);
Q.addFunction('grover', grover);
Q.fnc.grover(input, 4);
Q.comment("Measurement");
Q.bit().measure();
Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});