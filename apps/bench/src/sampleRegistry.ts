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

const entries: SampleEntry[] = [
  { path: 'samples/qft_simple.js', code: qftSimpleCode as string },
  { path: 'samples/qft_sugar.js', code: qftSugarCode as string },
  { path: 'samples/stairs_sample.js', code: stairsSampleCode as string },
];

export default entries;

/** Look up a sample's source code by its virtual path. */
export function getSampleCode(path: string): string | undefined {
  return entries.find((e) => e.path === path)?.code;
}
