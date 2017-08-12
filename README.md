# QuantumJS
[![GitHub version](https://badge.fury.io/gh/lsjcp%2Fquantumjs.svg)](https://badge.fury.io/gh/lsjcp%2Fquantumjs)

This is an open source library to ease the creation of complex **QASM 2.0** quantum circuits (algorithms) with the simplicity of javascript chaining patterns and other high-level language features.

**QuantumJS** generates compliant **Quantum Assembly Language 2.0** capable of being executed on a real five qubits quantum processor from **IBM Quantum Experience** or simulate the execution of circuits other topologies on this platform.

The aim of this library is to provide a framework to bind current classical computing with quantum computing beyond experimental levels.

To know more and get access to the quantum processor and platform visit [IBM Quantum Experience](https://quantumexperience.ng.bluemix.net/qstage/#).

## Usage

### Setup

Include quantum.js on your project.

Initialize an **IDEAL** quantum processor with unlimited qubits and unlimited interactions.
```javascript
var Q = new QuantumJS();
```

Or initialize with the 5-qubit IBMQX2.
```javascript
var Q = new QuantumJS('ibmqx2');
```

You may initialize with a custom topology:
```javascript
var Q = new QuantumJS({
  'name': 'ibmqx3',
  'registries': [
    {
      'kind':'quantum',
      'name':'q',
      'length': 5,
      'coupling_map': [[0,1],[0,2],[1,2],[3,2],[3,4],[4,2]],
      'topology': [[1,2],[2],[],[2,4],[2]]
    },
    {
      'kind':'classical',
      'name':'c',
      'length': 5
    }
  ]
});
```

### Qubits

Select a qubit by its index number
```javascript
Q.bit(0);
```
You can also specify a q-register name for the qubit array.
```javascript
Q.bit(0, 'a');
```
The default qubit register name is ‘q’

If no index is specified, the entire 'q' register array is returned
```javascript
Q.bit();
```

When using an IDEAL processor (no topology) qubits and q-registers are created on demand if they do not exist.

When a topology is specified, qubits and q-registers must be within the predefined configuration or an error is thrown.

### Quantum Gates

After selecting a qubit, you can apply a quantum gate (or transformation);

#### Gates

**Pauli X (bit-flip, not)**
```javascript
Q.bit(0).x();
```
**Pauli Y**
```javascript
Q.bit(0).y();
```
**Pauli Z**
```javascript
Q.bit(0).z();
```
**Idle Gate (Identity)**
```javascript
Q.bit(0).id();
```
**Hadamard Gate**
```javascript
Q.bit(0).h();
```
**Square Root Gate (S) and conjugate (S†, SDG)**
```javascript
Q.bit(0).s(); //S
Q.bit(0).s_(); //S conjugate
```

**Non-Clifford T and conjugate (T†, TDG)**
```javascript
Q.bit(0).t(); //T
Q.bit(0).t_(); //T conjugate
```

**Rotation Gates (U)**
You must provide rotation angles in an array (lambda, phi, theta)
```javascript
// lambda
Q.bit(0).u( [Q.π.div(2)] );     // u1(pi/2) q[0]; 
// lambda, phi
Q.bit(0).u( [Q.π.div(2), Q.π.div(4)] ); // u2(pi/2, pi/4) q[0]; 
// lambda, phi, theta
Q.bit(0).u( [0.3, 0.2, 0.1] );    // u3(0.3, 0.2, 0.1) q[0]; 
```

#### Controlled Gates
**CNOT or CX**
```javascript
Q.bit(0).cnot(1); // apply x gate to q(1) when q(0) is |1> 
Q.bit(0).cx(1); // another name for the same function
```
**CY, CZ**
```javascript
Q.bit(1).cy(2); // apply y gate to q(2) when q(1) is |1> 
Q.bit(3).cz(2); // apply z gate to q(2) when q(3) is |1> 
```

Controlled gates are limited on real devices. When using real or non-ideal topology a compile error is thrown if the interaction is not allowed.


### Measuring

Measuring qubits to specific classical registers.
```javascript
Q.bit(2).measureTo(2); // measure q[2] to c[2], the default register is ‘c’
Q.bit(2).measure(); // measure q[2] to c[2], index of classical bit will be inferred from qubit
Q.bit(2).measureTo(0,’c2’); // measure q[2] to c2[0]
```

Measuring the entire array. Qubits and Classical array must be of the same size or error is thrown
```javascript
Q.bit().measure(); // measure all qubits from q to c
// this is equal to..
Q.bit(0).measureTo(0);
Q.bit(1).measureTo(1);
Q.bit(2).measureTo(2);
// and so on...
```

Rotate to V, W, X, Y or Z and measure (to simplify bloch tomography)
```javascript
Q.bit(2).measureX(2); 
// equal to: Q.bit(2).h().measureTo(2);

Q.bit(2).measureY(2); 
// equal to: Q.bit(2).s_().h().measureTo(2);

Q.bit(2).measureW(2); 
// equal to: Q.bit(2).s().h().t().h().measureTo(2);
```

### Compile

Get the QASM2.0 code for on IBM Quantum Experience on a variable.
```javascript
var qasm = Q.compile(); 
```

You may also use a callback pattern for compiling
```javascript
Q.compile(function(str) {
  $('div').text(str); // In this examples we use jQuery to write the qasm code to a div
  hljs.initHighlightingOnLoad(); //and highlight.js to highlight the code
});
```

## Custom Functions
You may create and import custom routines and use it in the same chaining pattern.

#### Quantum Fourier Transform (n-bits)

```javascript
function qft(bits, values) {
  //Q variable will be prepended to the function after adding it
  if (bits && bits instanceof Object) {
    values = bits; bits = values.length;
  }
  Q.comment(bits + "-bit Quantum Fourier Transform");
  if (values) Q.init(values);
  Q.barrier().brk();
  for (var i = 0; i < bits; i++) {
    for (var j = 0; j < i; j++) {
      Q.bit(i).cu1(Q.π.div(Math.pow(2, i-j)), j);
    }
    Q.bit(i).h().brk();
  }
  //The appended function will return Q variable
};

var values = [1,0,1,0,1,0,1,0];
var Q = new QuantumJS();
Q.addFunction('qft', qft); //add the function to Q
Q.fnc.qft(values); //and call it, the function will return Q.
Q.bit().h();
Q.bit().measure();
Q.compile(function(compiled) {
  console.log(compiled);
});
```

###Other Custom Functions Examples
#### Inverse Quantum Fourier Transform (n-bits)

```javascript
function iqft(bits, values) {
  if (bits && bits instanceof Object) {
    values = bits; bits = values.length;
  }
  Q.comment(bits + "-bit Inverse Quantum Fourier Transform");
  if (values) Q.init(values);
  Q.barrier().brk();
  for (var i = 0; i < bits; i++) {
    for (var j = 0; j < i; j++) {
      Q.bit(i).u([Q.π.div(Math.pow(2, i-j))])._if(Q.cbit('c'+(i-1)));
    }
    Q.bit(i).h().brk();
    Q.bit(i).measureTo(0,'c'+i);
  }
};

//IQFT FROM A UNIFORM SUPERPOSITION OF 8-qubits
var values = ['+','+','+','+','+','+','+','+'];
var Q = new QuantumJS();
Q.addFunction('iqft', iqft);
Q.fnc.iqft(values);
var qasm = Q.compile();
console.log(qasm);
```

### N-bit Control X

```javascript
function getNCXSpannedArray(arr) {
  var span = [];
  span.push(arr[0]); span.push(arr[1]); span.push('');
  for (var i = 2; i < arr.length; i++) { span.push(arr[i]); span.push(''); }
  return span;
}

var values = [1,1,1,1];
var Q = new QuantumJS();
var span = getNCXSpannedArray(values);

Q.addFunction('ncx', n => {
  for (var i = 0; i <= n; i+=2) Q.bit(i).ccx(i+1, i+2);
  var l = (n % 2 == 0) ? 0 : 1;
  for (var i = (n-l); i >= 2; i-=2) Q.bit(i-2).ccx(i-1, i);
});
Q.comment("Set Initial State");
Q.init(span);
Q.barrier().brk();
Q.fnc.ncx(values.length);
Q.bit().measure();

var qasm = Q.compile();
console.log(qasm);
```