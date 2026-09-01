// src/mcp/useDocsMcpTools.ts
import { useMcpTool } from 'webmcp-react';
import { useRouter } from 'next/navigation';

type SitemapSection = {
  heading: string;
  handle: string;
  humanUrl: string;
  contents: SitemapSection[];
};

type SitemapEntry = {
  agentUrl: string;
  humanUrl: string;
  path: string;
  title: string;
  contents: SitemapSection[];
};

const DOCS_BASE_URL = 'https://quantumjsdocs.netlify.app';
const SITEMAP_URL = DOCS_BASE_URL + '/sitemap.json';
const LLMS_TXT_URL = DOCS_BASE_URL + '/llms.txt';
const LLMS_FULL_TXT_URL = DOCS_BASE_URL + '/llms-full.txt';
const SKILL_MD_URL = DOCS_BASE_URL + '/SKILL.md';

export function docsUrl(path: string): string {
  return `${DOCS_BASE_URL}${path}`;
}

// --- fetch caching -----------------------------------------------------
// Sitemap and per-page markdown are fetched once and reused across tool
// calls in the same session (e.g. get_doc_content called for two different
// sections of the same page shouldn't refetch the .md twice).

let sitemapPromise: Promise<SitemapEntry[]> | null = null;
function loadSitemap(): Promise<SitemapEntry[]> {
  if (!sitemapPromise) {
    sitemapPromise = fetch(SITEMAP_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load sitemap: ${r.status}`);
      return r.json();
    });
  }
  return sitemapPromise;
}

const markdownCache = new Map<string, Promise<string>>();
function loadMarkdown(agentUrl: string): Promise<string> {
  const url = agentUrl;
  if (!markdownCache.has(url)) {
    markdownCache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
        return r.text();
      })
    );
  }
  return markdownCache.get(url)!;
}

// --- markdown section extraction ---------------------------------------

function headingLevel(heading: string): number {
  const match = heading.match(/^(#+)\s/);
  return match ? match[1].length : 1;
}

/** Slices markdown from a heading line up to (not including) the next
 * heading of the same or shallower level — the "grep until next header"
 * behavior you described. */
function extractSection(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n');
  const level = headingLevel(heading);
  const target = heading.trim();

  const startIdx = lines.findIndex((line) => line.trim() === target);
  if (startIdx === -1) return null;

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^#+\s/.test(line) && headingLevel(line) <= level) {
      endIdx = i;
      break;
    }
  }

  return lines.slice(startIdx, endIdx).join('\n').trim();
}

function findEntry(sitemap: SitemapEntry[], path: string): SitemapEntry | undefined {
  return sitemap.find((e) => e.path === path);
}

function findSectionByHandle(contents: SitemapSection[], handle: string): SitemapSection | undefined {
  for (const section of contents) {
    if (section.handle === handle) return section;
    const nested = findSectionByHandle(section.contents, handle);
    if (nested) return nested;
  }
  return undefined;
}

function flattenSections(contents: SitemapSection[]): Array<{ heading: string; handle: string }> {
  const out: Array<{ heading: string; handle: string }> = [];
  for (const section of contents) {
    out.push({ heading: section.heading.replace(/^#+\s*/, ''), handle: section.handle });
    out.push(...flattenSections(section.contents));
  }
  return out;
}

// --- hook ----------------------------------------------------------------

export function useDocsTools() {
  const router = useRouter();

  useMcpTool({
    name: 'list_docs',
    description:
      'Lists every documentation page with its title, path, and section headings (with stable handles). Call this first to find which page/section covers a topic, before fetching any content.',
    inputSchema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    handler: async () => {
      try {
        const sitemap = await loadSitemap();
        return {
          content: [],
          structuredContent: {
            pages: sitemap.map((entry) => ({
              path: entry.path,
              title: entry.title,
              sections: flattenSections(entry.contents),
            })),
          },
        };
      } catch (e) {
        return { content: [], structuredContent: { error: String(e) } };
      }
    },
  });

  useMcpTool({
    name: 'get_doc_content',
    description:
      'Fetches documentation content to read. Pass only `path` for the full page, or `path` + `handle` (from list_docs) to get just one section, from that heading up to the next heading of equal or higher level — use `handle` whenever possible to avoid pulling more content than needed.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Page path from list_docs, e.g. "/bench".' },
        handle: { type: 'string', description: 'Optional section handle from list_docs, e.g. "the-editor".' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { path, handle } = args as { path: string; handle?: string };
      try {
        const sitemap = await loadSitemap();
        const entry = findEntry(sitemap, path);
        if (!entry) {
          return { content: [], structuredContent: { error: `No page found at path "${path}"` } };
        }

        const markdown = await loadMarkdown(entry.agentUrl);

        if (!handle) {
          return { content: [], structuredContent: { path, title: entry.title, content: markdown } };
        }

        const section = findSectionByHandle(entry.contents, handle);
        if (!section) {
          return { content: [], structuredContent: { error: `No section "${handle}" found on page "${path}"` } };
        }

        const sectionContent = extractSection(markdown, section.heading);
        return {
          content: [],
          structuredContent: {
            path,
            handle,
            heading: section.heading.replace(/^#+\s*/, ''),
            content: sectionContent ?? '',
          },
        };
      } catch (e) {
        return { content: [], structuredContent: { error: String(e) } };
      }
    },
  });

  useMcpTool({
    name: 'navigate_to_doc',
    description:
      "Navigates the user's own browser tab to a documentation page, optionally scrolled to a specific section and page, if not to the docs home. Use this when the user should see the page themselves — not as a way to read content yourself, use get_doc_content for that.",
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Optinal page path from list_docs, e.g. "/bench". if not provided redirects to docs home' },
        handle: { type: 'string', description: 'Optional section handle to scroll to, e.g. "the-editor".' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const { path, handle } = args as { path?: string; handle?: string };
      const target = path ? (handle ? `${path}#${handle}` : path) : DOCS_BASE_URL;
      router.push(target);
      return { content: [], structuredContent: { navigatedTo: target } };
    },
  });

  useMcpTool({
    name: 'get_full_doc',
    description:
      'Returns the contents of llms-full.txt as a string which stands for the full documentation of the quantumjs project. Use this tool only if you wish to have and read the full documentation but mind the size is substantial, for shorter queries; prefer list_docs + get_doc_content for anything you already know the topic of, since those return far less text.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false
    },
    handler: async () => {
      try {
        const res = await fetch(LLMS_FULL_TXT_URL);
        if (!res.ok) throw new Error(`Failed to fetch llms-full.txt: ${res.status}`);
        const text = await res.text();
        return { content: [{ type: "text", text: text }] };
      } catch (e) {
        return { content: [], structuredContent: { error: String(e) } };
      }
    },
  });

  useMcpTool({
    name: 'get_skill_md',
    description:
      'This tools return the content of SKILL.md as string, for agents to read or install in their environment, this skill will teach agents in how to write, understand, and translate QuantumJS code — the expressive DSL for quantum circuit construction targeting OpenQASM 3.0. Covers circuit creation, every gate with exact QASM output, scoped layout staircases, measurement patterns, pipeline abstraction, custom functions, full algorithm library, and detailed translation from Qiskit and QASM into idiomatic QuantumJS.',
    inputSchema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    handler: async () => {
      try {
        const res = await fetch(SKILL_MD_URL);
        if (!res.ok) throw new Error(`Failed to fetch SKILL.md: ${res.status}`);
        const text = await res.text();
        return { content: [{ type: "text", text: text }] };
      } catch (e) {
        return { content: [], structuredContent: { error: String(e) } };
      }
    },
  });
}
