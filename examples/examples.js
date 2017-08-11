//A Random Classical Circuit
var Q = new QuantumJS(ibmqx2);
Q.bit(0).x();
Q.bit(2).x();
Q.bit(4).x();
Q.bit(0).measureTo(0);
Q.bit(1).measureTo(1);
Q.bit(2).measureTo(2);
Q.bit(3).measureTo(3);
Q.bit(4).measureTo(4);
$('code').text(Q.compile());
hljs.initHighlightingOnLoad();


//5Q Complete Superposition Circuit (Simplified)
var Q = new QuantumJS(ibmqx2);
Q.bits().h().measure();

Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});


//BELL ZW State Measurement
var Q = new QuantumJS(ibmqx2);
Q.bit(0).h().cnot(1);
Q.bit(1).toW();
Q.bit(0).measure();
Q.bit(1).measure();

Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});


//3Q GHZ State XYY-Measurement
var Q = new QuantumJS();
Q.bit(0).h();
Q.bit(1).h();
Q.bit(2).x();
Q.bit(1).cnot(2);
Q.bit(0).cnot(2);
Q.bit().h();
Q.barrier();
Q.bit(1).s_();
Q.bit(2).s_();
Q.bit().h();
Q.bit().measure();

Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});



//RNOT EXAMPLE 
var Q = new QuantumJS();
Q.bit(1).x();
Q.bit(0).rcnot(1).measureTo(0);
Q.bit(1).measure();

Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});


//SWAP EXAMPLE
var Q = new QuantumJS();
Q.bit(1).x();
Q.bit(0).swapWith(1);
Q.bit(1).measureTo(0);
Q.bit(1).measureTo(1);
Q.barrier();
Q.bit().x();
Q.bit(1).measureTo(0);

Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});


//Toffoli with flips
var Q = new QuantumJS();

Q.comment("set initial state");
Q.init([1,1,'=']);

Q.comment("tofolli");
Q.bit(2).h();
Q.bit(1).cnot(2);
Q.bit(2).t_();
Q.bit(0).cnot(2);
Q.bit(2).t();
Q.bit(1).cnot(2);
Q.bit(2).t_();
Q.bit(0).cnot(2);
Q.bit(1).t();
Q.bit(2).t().h();
Q.comment("swap 1,2");
Q.bit(1).swapWith(2);
Q.comment("end swap");
Q.bit(0).cnot(2).t();
Q.bit(2).t_();
Q.bit(0).cnot(2);
Q.comment("swap back 1,2");
Q.bit(1).swapWith(2);
Q.comment("end swap back");
Q.bit().measure();


Q.compile(function(compiled) {
  $('code').text(compiled);
  hljs.initHighlightingOnLoad();
});