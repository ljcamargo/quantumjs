/**
 * File tree data structure + builder for the SamplesPanel explorer.
 * Converts a flat sample registry (path → code) into a nested tree
 * ready for hierarchical rendering (e.g. "samples/qft/qft_sugar.js").
 */

export type TreeNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
};

export function buildSampleTree(entries: { path: string; code: string }[]): TreeNode {
  const root: TreeNode = {
    name: 'samples',
    path: '',
    type: 'directory',
    children: [],
  };

  for (const entry of entries) {
    const parts = entry.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current.children!.push({ name: part, path: entry.path, type: 'file' });
      } else {
        let dir = current.children!.find(
          (n): n is TreeNode => n.type === 'directory' && n.name === part
        );
        if (!dir) {
          dir = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: 'directory',
            children: [],
          };
          current.children!.push(dir);
        }
        current = dir;
      }
    }
  }

  return root;
}
