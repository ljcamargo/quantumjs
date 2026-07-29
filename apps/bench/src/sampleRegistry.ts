/**
 * Sample file registry — the root of the virtual filesystem.
 *
 * Each entry is a .js file loaded via webpack's raw-loader (scoped to
 * src/samples/ in next.config.ts). The files are regular JavaScript that
 * use the Quantum global — no special syntax or dialect.
 *
 * To add a sample:
 *   1. Create your .js file in src/samples/ (or a subdirectory)
 *   2. Add an import + entry to the `entries` array below
 */
export interface SampleEntry {
  /** Virtual filesystem path (e.g. "samples/qft_sugar.js"). */
  path: string;
  /** Raw source code. */
  code: string;
}

// @ts-expect-error — raw-loader provides string content
import qftSimpleCode from './samples/qft_simple.js';
// @ts-expect-error — raw-loader provides string content
import qftSugarCode from './samples/qft_sugar.js';
// @ts-expect-error — raw-loader provides string content
import stairsSampleCode from './samples/stairs_sample.js';
// @ts-expect-error — raw-loader provides string content
import adderN10Code from './samples/adder_n10.js';
// @ts-expect-error — raw-loader provides string content
import adderN4Code from './samples/adder_n4.js';
// @ts-expect-error — raw-loader provides string content
import basisChangeN3Code from './samples/basis_change_n3.js';
// @ts-expect-error — raw-loader provides string content
import bb84N8Code from './samples/bb84_n8.js';
// @ts-expect-error — raw-loader provides string content
import bellN4Code from './samples/bell_n4.js';
// @ts-expect-error — raw-loader provides string content
import catStateN4Code from './samples/cat_state_n4.js';
// @ts-expect-error — raw-loader provides string content
import deutschN2Code from './samples/deutsch_n2.js';
// @ts-expect-error — raw-loader provides string content
import dnnN2Code from './samples/dnn_n2.js';
// @ts-expect-error — raw-loader provides string content
import dnnN8Code from './samples/dnn_n8.js';

const entries: SampleEntry[] = [
  { path: 'samples/qft_simple.js', code: qftSimpleCode as string },
  { path: 'samples/qft_sugar.js', code: qftSugarCode as string },
  { path: 'samples/stairs_sample.js', code: stairsSampleCode as string },
  { path: 'samples/adder_n10.js', code: adderN10Code as string },
  { path: 'samples/adder_n4.js', code: adderN4Code as string },
  { path: 'samples/basis_change_n3.js', code: basisChangeN3Code as string },
  { path: 'samples/bb84_n8.js', code: bb84N8Code as string },
  { path: 'samples/bell_n4.js', code: bellN4Code as string },
  { path: 'samples/cat_state_n4.js', code: catStateN4Code as string },
  { path: 'samples/deutsch_n2.js', code: deutschN2Code as string },
  { path: 'samples/dnn_n2.js', code: dnnN2Code as string },
  { path: 'samples/dnn_n8.js', code: dnnN8Code as string },
];

export default entries;

/** Look up a sample's source code by its virtual path. */
export function getSampleCode(path: string): string | undefined {
  return entries.find((e) => e.path === path)?.code;
}
