# QuantumJS


This is an open source library to ease the creation of complex **QASM 2.0** quantum circuits (algorithms) with the simplicity of javascript chaining patterns and other higher level language features.

**QuantumJS** generates compliant **Quantum Assembly Language 2.0** capable of being executed on a real five qubits quantum processor from **IBM Quantum Experience** or simulate the execution of circuits other topologies on this platform.

The aim of this library is to provide a framework to bind current classical computing with quantum computing beyond experimental levels. In the future, when APIs become publicly available, this library could be used to perform quantum computation by connecting to a remote quantum computer and fetching results in real time.

To know more and get access to the quantum processor and platform visit [IBM Quantum Experience](https://quantumexperience.ng.bluemix.net/qstage/#).

## Usage

### Setup

Include quantum.js on your project.

Initialize an **IDEAL** quantum processor with unlimited qubits and unlimited interactions.
```javascript
var Q = new QProcessor();
```

Or initialize with the IBM Q5 Real Device topology.
```javascript
var Q = new QProcessor(IBM_Q5_2017);
```

You may also create another custom topology (read further)

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

#### Clifford Gates

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
**Hadamard Gate (Identity)**
```javascript
Q.bit(0).h();
```


(under construction)
