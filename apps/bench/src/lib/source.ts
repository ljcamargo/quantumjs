/**
 * Starter document for the editor's "New file" action.
 *
 * It is intentionally a valid, minimal circuit. The Bench autoruns on a 1 s
 * debounce, so a completely empty string would be evaluated and surface
 * "Code must return a Quantum.Circuit object". A real (empty) circuit keeps
 * the visualizer and QASM panel meaningful until the user starts writing.
 */
export const NEW_FILE_TEMPLATE = `const c = Quantum.circuit({ qubits: 2, bits: 2 }, Q => {
  // Build your circuit here. For example:
  // Q.bit(0).h();
  // Q.bit(0).cx(Q.bit(1));
  // Q.all().measure();
});

return c;
`;

/**
 * True when a source document contains more than whitespace and comments.
 *
 * Used to skip compile/simulate for "virtually empty" documents (a new file
 * whose template was deleted, or an editor containing only comments) instead
 * of showing a misleading "must return a circuit" error.
 */
export function hasExecutableCode(source: string): boolean {
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLineComments = withoutBlockComments.replace(/\/\/.*$/gm, '');
  return withoutLineComments.trim().length > 0;
}
