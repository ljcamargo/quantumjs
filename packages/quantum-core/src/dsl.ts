import * as AST from './ast.js';
import { Emitter } from './emitter.js';

export interface CircuitConfig {
  qubits: number;
  bits?: number;
  version?: string;
}

export class Circuit {
  private program: AST.Program;
  private qubitCount: number;
  private bitCount: number;

  constructor(config: CircuitConfig) {
    this.qubitCount = config.qubits;
    this.bitCount = config.bits || config.qubits;
    this.program = {
      kind: 'Program',
      version: config.version || '3.0',
      body: [
        { kind: 'IncludeStatement', filename: 'stdgates.inc' },
        { kind: 'QubitDeclaration', identifier: 'q', size: config.qubits },
        { kind: 'ClassicalDeclaration', identifier: 'c', size: this.bitCount },
      ],
    };
  }

  get body() {
    return this.program.body;
  }

  get size() {
    return this.qubitCount;
  }

  bit(index: number) {
    return new QBitProxy(this, [index]);
  }

  bits(indices: number[]) {
    return new QBitProxy(this, indices);
  }

  all() {
    const indices = Array.from({ length: this.qubitCount }, (_, i) => i);
    return new QBitProxy(this, indices);
  }

  first() {
    return this.bit(0);
  }

  last() {
    return this.bit(this.qubitCount - 1);
  }

  // DSL Patterns
  descend(callback: (q: QBitProxy, context: DescendContext) => void) {
    for (let i = 0; i < this.qubitCount; i++) {
      callback(this.bit(i), {
        iteration: i,
        last: this.bit(this.qubitCount - 1),
        first: this.bit(0),
        parentSpan: this.qubitCount,
      });
    }
  }

  compile(options?: { version?: string }): string {
    const emitter = new Emitter();
    return emitter.emit(this.program, options);
  }
}

export interface DescendContext {
  iteration: number;
  last: QBitProxy;
  first: QBitProxy;
  parentSpan: number;
}

export class QBitProxy {
  constructor(private circuit: Circuit, private indices: number[]) {}

  private addGate(gate: string, target?: QBitProxy, params?: AST.Expression[]) {
    if (target) {
      // Controlled gate or multi-qubit gate
      // For simplicity, we assume one-to-one mapping if both are selections
      // But standard QASM gates usually take specific lists.
      // E.g. cx q[0], q[1];
      for (let i = 0; i < this.indices.length; i++) {
        const ctrl = this.indices[i];
        const tgt = target.indices[i] !== undefined ? target.indices[i] : target.indices[0];
        this.circuit.body.push({
          kind: 'GateCall',
          gate,
          qubits: [
            { kind: 'QubitReference', identifier: 'q', index: ctrl },
            { kind: 'QubitReference', identifier: 'q', index: tgt },
          ],
          params,
        });
      }
    } else {
      for (const index of this.indices) {
        this.circuit.body.push({
          kind: 'GateCall',
          gate,
          qubits: [{ kind: 'QubitReference', identifier: 'q', index }],
          params,
        });
      }
    }
    return this;
  }

  h() { return this.addGate('h'); }
  x() { return this.addGate('x'); }
  y() { return this.addGate('y'); }
  z() { return this.addGate('z'); }
  s() { return this.addGate('s'); }
  t() { return this.addGate('t'); }

  cx(target: QBitProxy) { return this.addGate('cx', target); }
  cy(target: QBitProxy) { return this.addGate('cy', target); }
  cz(target: QBitProxy) { return this.addGate('cz', target); }

  cp(target: QBitProxy, theta: number | AST.Expression) {
    const thetaExpr: AST.Expression = typeof theta === 'number' 
      ? { kind: 'Literal', value: theta } 
      : theta;
    return this.addGate('cp', target, [thetaExpr]);
  }

  barrier() {
    this.circuit.body.push({
      kind: 'BarrierStatement',
      qubits: this.indices.map(index => ({ kind: 'QubitReference', identifier: 'q', index })),
    });
    return this;
  }

  measure(targetIndex?: number) {
    for (let i = 0; i < this.indices.length; i++) {
      const qIndex = this.indices[i];
      const bIndex = targetIndex !== undefined ? targetIndex : qIndex;
      this.circuit.body.push({
        kind: 'MeasureStatement',
        qubit: { kind: 'QubitReference', identifier: 'q', index: qIndex },
        target: { kind: 'ClassicalReference', identifier: 'c', index: bIndex },
      });
    }
    return this;
  }
}

export function circuit(config: CircuitConfig, callback: (q: Circuit) => void): Circuit {
  const c = new Circuit(config);
  callback(c);
  return c;
}

// Math helpers for DSL
export const pi = { kind: 'Identifier', name: 'pi' } as AST.Expression;
export function div(left: AST.Expression, right: number | AST.Expression): AST.Expression {
  return {
    kind: 'BinaryExpression',
    left,
    operator: '/',
    right: typeof right === 'number' ? { kind: 'Literal', value: right } : right,
  };
}
