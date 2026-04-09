export type Node =
  | Program
  | Statement
  | Expression;

export interface Program {
  kind: 'Program';
  version: string;
  body: Statement[];
}

export type Statement =
  | IncludeStatement
  | QubitDeclaration
  | ClassicalDeclaration
  | GateCall
  | MeasureStatement
  | BarrierStatement;

export interface IncludeStatement {
  kind: 'IncludeStatement';
  filename: string;
}

export interface QubitDeclaration {
  kind: 'QubitDeclaration';
  identifier: string;
  size?: number;
}

export interface ClassicalDeclaration {
  kind: 'ClassicalDeclaration';
  identifier: string;
  size?: number;
}

export interface GateCall {
  kind: 'GateCall';
  gate: string;
  params?: Expression[] | undefined;
  qubits: QubitReference[];
}

export interface QubitReference {
  kind: 'QubitReference';
  identifier: string;
  index?: number | undefined;
}

export interface MeasureStatement {
  kind: 'MeasureStatement';
  qubit: QubitReference;
  target: ClassicalReference;
}

export interface ClassicalReference {
  kind: 'ClassicalReference';
  identifier: string;
  index?: number | undefined;
}

export interface BarrierStatement {
  kind: 'BarrierStatement';
  qubits: QubitReference[];
}

export type Expression =
  | Literal
  | BinaryExpression
  | Identifier;

export interface Literal {
  kind: 'Literal';
  value: string | number;
}

export interface BinaryExpression {
  kind: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface Identifier {
  kind: 'Identifier';
  name: string;
}
