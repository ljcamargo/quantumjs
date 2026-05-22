import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'QuantumJS',
  tagline: 'A fluent DSL and OpenQASM compiler for JavaScript and TypeScript',
  favicon: 'image/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://quantumjsdocs.netlify.app',
  baseUrl: '/',

  organizationName: 'ljcamargo',
  projectName: 'quantumjs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/ljcamargo/quantumjs/tree/master/apps/documentation/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'image/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'QuantumJS',
      logo: {
        alt: 'QuantumJS',
        src: 'image/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://quantumjs.netlify.app',
          label: 'Try Online',
          position: 'left',
        },
        {
          href: 'https://github.com/ljcamargo/quantumjs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/' },
            { label: 'DSL Guide', to: '/dsl/circuits' },
            { label: 'API Reference', to: '/reference/api' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Try Online', href: 'https://quantumjs.netlify.app' },
            { label: 'GitHub', href: 'https://github.com/ljcamargo/quantumjs' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Luis J Camargo. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
