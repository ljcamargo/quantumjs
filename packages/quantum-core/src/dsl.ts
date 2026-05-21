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

  // Sub-circuit scoping context
  public offset: number = 0;
  public iteration: number = 0;
  public parentSpan: number = 0;
  public inverseSpan: number = 0;

  // Scoped math/instruction helpers for DSL brevity
  public pi = pi;
  public div = (left: AST.Expression, right: number | AST.Expression): AST.Expression => {
    return div(left, right);
  };
  
  // The greek letter gimmick proxy
  public π = {
    div: (right: number | AST.Expression): AST.Expression => {
      return div(pi, right);
    }
  };

  constructor(config: CircuitConfig) {
    this.qubitCount = config.qubits;
    this.bitCount = config.bits !== undefined ? config.bits : 1; // Defaults to 1 as per original logic
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

  barrier(indices?: number[]) {
    const targetIndices = indices || Array.from({ length: this.qubitCount }, (_, i) => i);
    this.program.body.push({
      kind: 'BarrierStatement',
      qubits: targetIndices.map(index => ({ kind: 'QubitReference', identifier: 'q', index })),
    });
    return this;
  }

  first() {
    return this.bit(0);
  }

  last() {
    return this.bit(this.qubitCount - 1);
  }

  cbit(index?: number, reg?: string) {
    return new CBitProxy(this, index, reg);
  }

  // Asserts and grows the classical register size on demand (equivalent to original assertSize)
  assertClassicalSize(index?: number) {
    const targetSize = index !== undefined ? index + 1 : this.qubitCount;
    if (targetSize > this.bitCount) {
      this.bitCount = targetSize;
      const decl = this.program.body.find(
        (s): s is AST.ClassicalDeclaration => s.kind === 'ClassicalDeclaration' && s.identifier === 'c'
      );
      if (decl) {
        decl.size = this.bitCount;
      }
    }
  }

  // Context-Aware Layouts (Parity with QuantumKT)
  sub(start: number, end: number, callback: (q: Circuit) => void) {
    const size = end - start;
    const subCircuit = new Circuit({ qubits: size, version: this.program.version });
    subCircuit.program.body = []; // Clear sub-declarations
    subCircuit.parentSpan = this.qubitCount;
    subCircuit.offset = this.offset + start;
    
    callback(subCircuit);
    
    this.mergeSubCircuit(subCircuit, start);
    return this;
  }

  ascend(step: number = 1, callback: (q: Circuit) => void) {
    const span = this.qubitCount;
    for (let i = 0; i < span; i += step) {
      const size = i + 1;
      const subCircuit = new Circuit({ qubits: size, version: this.program.version });
      subCircuit.program.body = [];
      subCircuit.parentSpan = span;
      subCircuit.offset = this.offset + i;
      subCircuit.iteration = i;
      subCircuit.inverseSpan = (1 + span) - size;
      
      callback(subCircuit);
      
      this.mergeSubCircuit(subCircuit, i);
    }
    return this;
  }

  descend(callback: (q: Circuit) => void) {
    const span = this.qubitCount;
    for (let i = span - 1; i >= 0; i--) {
      const size = i + 1;
      const subCircuit = new Circuit({ qubits: size, version: this.program.version });
      subCircuit.program.body = [];
      subCircuit.parentSpan = span;
      subCircuit.offset = this.offset + 0;
      subCircuit.iteration = i;
      subCircuit.inverseSpan = (1 + span) - size;
      
      callback(subCircuit);
      
      this.mergeSubCircuit(subCircuit, 0);
    }
    return this;
  }

  loop(times: number, callback: (q: Circuit) => void) {
    for (let i = 0; i < times; i++) {
      callback(this);
    }
    return this;
  }

  private mergeSubCircuit(sub: Circuit, offset: number) {
    sub.program.body.forEach(stmt => {
      const mapped = this.mapStatementOffset(stmt, offset);
      if (mapped) {
        this.program.body.push(mapped);
      }
    });
  }

  private mapStatementOffset(stmt: AST.Statement, offset: number): AST.Statement | null {
    switch (stmt.kind) {
      case 'GateCall':
        return {
          ...stmt,
          qubits: stmt.qubits.map(q => ({
            ...q,
            index: q.index !== undefined ? q.index + offset : undefined
          }))
        };
      case 'MeasureStatement':
        return {
          ...stmt,
          qubit: {
            ...stmt.qubit,
            index: stmt.qubit.index !== undefined ? stmt.qubit.index + offset : undefined
          }
        };
      case 'BarrierStatement':
        return {
          ...stmt,
          qubits: stmt.qubits.map(q => ({
            ...q,
            index: q.index !== undefined ? q.index + offset : undefined
          }))
        };
      case 'ConditionalStatement':
        const bodyMapped = this.mapStatementOffset(stmt.body, offset);
        if (!bodyMapped) return null;
        return {
          ...stmt,
          body: bodyMapped
        };
      case 'CommentStatement':
        return stmt;
      default:
        return null;
    }
  }

  comment(text: string) {
    this.program.body.push({ kind: 'CommentStatement', text });
    return this;
  }

  brk() {
    this.program.body.push({ kind: 'CommentStatement', text: '' });
    return this;
  }

  // Flexible Input Initialization Helper (formerly init)
  input(
    source: string | (number | string)[] | ((q: Circuit) => void),
    options?: { endian?: 'big' | 'little' }
  ) {
    if (typeof source === 'function') {
      source(this);
      return this;
    }

    const endian = options?.endian || 'big';
    let elements: (string | number)[] = typeof source === 'string' ? source.split('') : source;

    if (endian === 'little') {
      elements = [...elements].reverse();
    }

    elements.forEach((val, i) => {
      // Map index but ensure we do nothing for Identity (I) or Ground State (0)
      const skipValues = ['0', 0, 'I', 'i', '='];
      if (skipValues.includes(val)) {
        return; // Skip adding any gate
      }

      const b = this.bit(i);
      if (val === '1' || val === 1 || val === 'X' || val === 'x') {
        b.x();
      } else if (val === '+') {
        b.h();
      } else if (val === '-') {
        b.h().z();
      } else if (val === '>' || val === 'r' || val === '+i') {
        b.h().s();
      } else if (val === '<' || val === 'l' || val === '-i') {
        b.h().s_();
      } else if (val === 'H' || val === 'h') {
        b.h();
      } else if (val === 'S' || val === 's') {
        b.s();
      } else if (val === 'Z' || val === 'z') {
        b.z();
      }
    });
    return this;
  }


  mask(maskArray: number[], func: (q: QBitProxy) => void) {
    maskArray.forEach((val, i) => {
      if (val === 1) func(this.bit(i));
    });
    return this;
  }

  // Extension helper
  addFunction(name: string, fnc: Function) {
    (this as any)[name] = (...args: any[]) => {
      fnc.apply(this, [this, ...args]);
      return this;
    };
    return this;
  }

  // Support for accessing the function proxy
  get fnc() {
    return this;
  }

  compile(options?: { version?: string }): string {
    const emitter = new Emitter();
    return emitter.emit(this.program, options);
  }
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
  s_() { return this.addGate('sdg'); } // s conjugate
  t() { return this.addGate('t'); }
  t_() { return this.addGate('tdg'); } // t conjugate
  id() { return this.addGate('id'); }
  reset() { return this.addGate('reset'); }

  u(params: (number | AST.Expression)[]) {
    const exprs = params.map(p => typeof p === 'number' ? { kind: 'Literal', value: p } as AST.Literal : p);
    return this.addGate('u', undefined, exprs);
  }

  cx(target: QBitProxy) { return this.addGate('cx', target); }
  cy(target: QBitProxy) { return this.addGate('cy', target); }
  cz(target: QBitProxy) { return this.addGate('cz', target); }
  cnot(target: QBitProxy) { return this.cx(target); }

  cp(target: QBitProxy, theta: number | AST.Expression) {
    const thetaExpr: AST.Expression = typeof theta === 'number' 
      ? { kind: 'Literal', value: theta } 
      : theta;
    return this.addGate('cp', target, [thetaExpr]);
  }
  cu1(target: QBitProxy, theta: number | AST.Expression) { return this.cp(target, theta); }

  ch(target: QBitProxy) {
    // Decomposition if needed or just gate call if defined in stdgates
    return this.addGate('ch', target);
  }

  ccx(b: QBitProxy, c: QBitProxy) {
    for (let i = 0; i < this.indices.length; i++) {
      const q1 = this.indices[i];
      const q2 = b.indices[i] !== undefined ? b.indices[i] : b.indices[0];
      const q3 = c.indices[i] !== undefined ? c.indices[i] : c.indices[0];
      this.circuit.body.push({
        kind: 'GateCall',
        gate: 'ccx',
        qubits: [
          { kind: 'QubitReference', identifier: 'q', index: q1 },
          { kind: 'QubitReference', identifier: 'q', index: q2 },
          { kind: 'QubitReference', identifier: 'q', index: q3 },
        ],
      });
    }
    return this;
  }
  toffoli(b: QBitProxy, c: QBitProxy) { return this.ccx(b, c); }

  swap(target: QBitProxy) { return this.addGate('swap', target); }

  barrier() {
    this.circuit.body.push({
      kind: 'BarrierStatement',
      qubits: this.indices.map(index => ({ kind: 'QubitReference', identifier: 'q', index })),
    });
    return this;
  }

  repeat(times: number, op: keyof QBitProxy, ...params: any[]) {
    for (let i = 0; i < times; i++) {
      (this[op] as Function)(...params);
    }
    return this;
  }

  // Basis changes
  toW() { return this.s().h().t().h(); }
  toV() { return this.s().h().t_().h(); }
  toX() { return this.h(); }
  toY() { return this.s_().h(); }
  toZ() { return this; }

  measure() {
    const index = (this.indices.length === 1 && this.indices[0]! > -1) 
      ? this.indices[0]! 
      : undefined;
    return this.measureTo(index);
  }

  measureTo(index?: number | CBitProxy, group?: string) {
    let cbit: CBitProxy;
    if (typeof index === 'object' && index instanceof CBitProxy) {
      cbit = index;
    } else {
      cbit = this.circuit.cbit(index as number, group);
    }

    if (cbit) {
      // Assert and grow the classical register size on demand (assertSize logic)
      if (cbit.index === -1) {
        this.circuit.assertClassicalSize(); // Grows to match qubitCount
      } else {
        this.circuit.assertClassicalSize(cbit.index); // Grows to index + 1
      }

      if (this.indices.length === 1) {
        this.circuit.body.push({
          kind: 'MeasureStatement',
          qubit: { kind: 'QubitReference', identifier: 'q', index: this.indices[0]! },
          target: { 
            kind: 'ClassicalReference', 
            identifier: cbit.reg, 
            index: cbit.index === -1 ? undefined : cbit.index 
          },
        });
      } else {
        this.circuit.body.push({
          kind: 'MeasureStatement',
          qubit: { kind: 'QubitReference', identifier: 'q' }, // No index
          target: { 
            kind: 'ClassicalReference', 
            identifier: cbit.reg, 
            index: cbit.index === -1 ? undefined : cbit.index 
          },
        });
      }
    }
    return this;
  }

  measureX(index?: number | CBitProxy, group?: string) { return this.toX().measureTo(index, group); }
  measureY(index?: number | CBitProxy, group?: string) { return this.toY().measureTo(index, group); }
  measureZ(index?: number | CBitProxy, group?: string) { return this.toZ().measureTo(index, group); }
  measureW(index?: number | CBitProxy, group?: string) { return this.toW().measureTo(index, group); }
  measureV(index?: number | CBitProxy, group?: string) { return this.toV().measureTo(index, group); }

  comment(text: string) {
    this.circuit.comment(text);
    return this;
  }

  brk() {
    this.circuit.brk();
    return this;
  }

  _if(cbit: CBitProxy, callback?: (q: QBitProxy) => void) {
    if (callback) {
      const originalBody = [...this.circuit.body];
      this.circuit.body.length = 0;
      callback(this);
      const tempBody = [...this.circuit.body];
      this.circuit.body.length = 0;
      originalBody.forEach(s => this.circuit.body.push(s));
      tempBody.forEach(stmt => {
        this.circuit.body.push({
          kind: 'ConditionalStatement',
          condition: cbit.condition,
          body: stmt
        });
      });
    } else {
      // In the old DSL, Q.bit(i).x()._if(cbit) would condition the PREVIOUS operation.
      // This is what the pre() function did.
      const lastStmt = this.circuit.body[this.circuit.body.length - 1];
      if (lastStmt && lastStmt.kind !== 'CommentStatement' && lastStmt.kind !== 'QubitDeclaration' && lastStmt.kind !== 'ClassicalDeclaration' && lastStmt.kind !== 'IncludeStatement') {
        this.circuit.body[this.circuit.body.length - 1] = {
          kind: 'ConditionalStatement',
          condition: cbit.condition,
          body: lastStmt as AST.Statement
        };
      }
    }
    return this;
  }
}

export class CBitProxy {
  public condition: AST.BinaryExpression;
  public reg: string;
  public index: number;

  constructor(public circuit: Circuit, index?: number, reg?: string) {
    this.reg = reg || 'c';
    this.index = (index === undefined || index === null) ? -1 : index;
    
    this.condition = {
      kind: 'BinaryExpression',
      left: { 
        kind: 'Identifier', 
        name: this.index === -1 ? this.reg : `${this.reg}[${this.index}]` 
      },
      operator: '==',
      right: { kind: 'Literal', value: 1 }
    };
  }

  isTrue() {
    this.condition.operator = '==';
    this.condition.right = { kind: 'Literal', value: 1 };
    return this;
  }

  isFalse() {
    this.condition.operator = '==';
    this.condition.right = { kind: 'Literal', value: 0 };
    return this;
  }

  get name() {
    return this.reg + (this.index === -1 ? "" : `[${this.index}]`);
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

// Pipeline Abstraction (Parity with QuantumKT Flow)
export interface PipelineConfig {
  input?: string | (number | string)[] | ((q: Circuit) => void) | {
    source: string | (number | string)[] | ((q: Circuit) => void);
    endian?: 'big' | 'little';
  };
  output?: 'readEach' | 'readToOne' | {
    format: 'readEach' | 'readToOne';
    postProcess?: (results: Record<string, number>) => any;
  };
}

export class Pipeline {
  private circuit: Circuit;
  private inputConfig?: any;
  private outputConfig?: any;

  constructor(qubits: number, config: PipelineConfig, callback: (q: Circuit) => void) {
    this.circuit = new Circuit({ qubits });
    this.inputConfig = config.input;
    this.outputConfig = config.output;

    // 1. Process Input prep stage
    if (this.inputConfig) {
      if (typeof this.inputConfig === 'object' && 'source' in this.inputConfig) {
        this.circuit.input(this.inputConfig.source, { endian: this.inputConfig.endian });
      } else {
        this.circuit.input(this.inputConfig);
      }
    }

    // 2. Process Core Algorithm stage
    callback(this.circuit);

    // 3. Process Output measurement stage
    if (this.outputConfig) {
      const format = typeof this.outputConfig === 'object' ? this.outputConfig.format : this.outputConfig;
      if (format === 'readEach') {
        this.circuit.all().measure();
      } else if (format === 'readToOne') {
        this.circuit.first().measure();
      }
    }
  }

  compile(options?: { version?: string }) {
    return this.circuit.compile(options);
  }

  get rawCircuit() {
    return this.circuit;
  }

  run(simulator: any): any {
    const qasm = this.circuit.compile({ version: '2.0' });
    let results: any = null;
    simulator.importQASM(qasm, (err: any) => {
      if (err) throw new Error(String(err));
      simulator.run();
      results = simulator.probabilities();
    });

    if (this.outputConfig && typeof this.outputConfig === 'object' && this.outputConfig.postProcess) {
      return this.outputConfig.postProcess(results);
    }
    return results;
  }
}

export function pipeline(
  qubits: number,
  config: PipelineConfig,
  callback: (q: Circuit) => void
): Pipeline {
  return new Pipeline(qubits, config, callback);
}

