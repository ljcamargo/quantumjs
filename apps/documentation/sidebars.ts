import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'DSL Guide',
      collapsed: false,
      items: [
        'dsl/circuits',
        'dsl/qubits',
        'dsl/gates',
        'dsl/input',
        'dsl/measurement',
        'dsl/staircase-loops',
        'dsl/conditionals',
        'dsl/custom-functions',
      ],
    },
    {
      type: 'category',
      label: 'Pipeline',
      collapsed: false,
      items: [
        'pipeline/pipeline',
      ],
    },
    {
      type: 'category',
      label: 'Bench',
      collapsed: false,
      items: [
        'bench/bench',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/api',
      ],
    },
  ],
};

export default sidebars;
