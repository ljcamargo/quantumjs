import * as AST from './ast.js';

export interface EmitterOptions {
  version?: string; // '2.0' or '3.0'
}

export class Emitter {
  emit(node: AST.Program, options: EmitterOptions = {}): string {
    const version = options.version || node.version;
    const isV3 = version.startsWith('3');
    
    let output = `OPENQASM ${version};\n`;
    for (const statement of node.body) {
      const line = this.emitStatement(statement, isV3);
      if (line) output += line + '\n';
    }
    return output;
  }

  private emitStatement(node: AST.Statement, isV3: boolean): string {
    switch (node.kind) {
      case 'IncludeStatement':
        if (!isV3 && node.filename === 'stdgates.inc') {
          return `include "qelib1.inc";`;
        }
        return `include "${node.filename}";`;
      case 'QubitDeclaration':
        if (isV3) {
          return `qubit${node.size ? `[${node.size}]` : ''} ${node.identifier};`;
        } else {
          return `qreg ${node.identifier}[${node.size || 1}];`;
        }
      case 'ClassicalDeclaration':
        if (isV3) {
          return `bit${node.size ? `[${node.size}]` : ''} ${node.identifier};`;
        } else {
          return `creg ${node.identifier}[${node.size || 1}];`;
        }
      case 'GateCall':
        const params = node.params ? `(${node.params.map(p => this.emitExpression(p)).join(', ')})` : '';
        const qubits = node.qubits.map(q => this.emitQubitReference(q)).join(', ');
        return `${node.gate}${params} ${qubits};`;
      case 'MeasureStatement':
        if (isV3) {
          // Both -> and = are valid in 3.0, but let's use = if we want "pure 3.0" feel
          // However for compatibility, -> is safer.
          // Let's stick to -> for now as it works in both and is less problematic for parsers.
          // BUT the user specifically got an error on = before.
          return `${this.emitClassicalReference(node.target)} = measure ${this.emitQubitReference(node.qubit)};`;
        } else {
          return `measure ${this.emitQubitReference(node.qubit)} -> ${this.emitClassicalReference(node.target)};`;
        }
      case 'BarrierStatement':
        return `barrier ${node.qubits.map(q => this.emitQubitReference(q)).join(', ')};`;
      case 'CommentStatement':
        return `// ${node.text}`;
      case 'ConditionalStatement':
        // QASM 2.0 and 3.0 have different conditional syntax
        // 2.0: if(c==1) h q[0];
        // 3.0: if(c == 1) { h q[0]; }
        const condition = this.emitExpression(node.condition);
        const body = this.emitStatement(node.body, isV3);
        if (isV3) {
          return `if (${condition}) {\n  ${body}\n}`;
        } else {
          return `if(${condition}) ${body}`;
        }
      default:
        return '';
    }
  }

  private emitQubitReference(node: AST.QubitReference): string {
    return `${node.identifier}${node.index !== undefined ? `[${node.index}]` : ''}`;
  }

  private emitClassicalReference(node: AST.ClassicalReference): string {
    return `${node.identifier}${node.index !== undefined ? `[${node.index}]` : ''}`;
  }

  private emitExpression(node: AST.Expression): string {
    switch (node.kind) {
      case 'Literal':
        return String(node.value);
      case 'Identifier':
        return node.name;
      case 'BinaryExpression':
        return `(${this.emitExpression(node.left)} ${node.operator} ${this.emitExpression(node.right)})`;
      default:
        return '';
    }
  }
}
