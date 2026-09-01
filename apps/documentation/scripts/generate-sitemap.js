// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const GithubSlugger = require('github-slugger'); // npm install github-slugger

const SITE_URL = 'https://quantumjsdocs.netlify.app';
const BASE_URL = '/';
const OUT_DIR = path.join(__dirname, '..', 'build');

// Overrides ONLY the display "path" field for specific route keys.
// The .md URL itself is left untouched — docusaurus-plugin-llms's actual
// working file (e.g. docs.md) is what we keep linking to.
const PATH_OVERRIDES = {
  docs: '/', // docs.md is the intro page, which lives at site root
};

function normalize(routePath) {
  const trimmed = routePath.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? 'index' : trimmed;
}

function buildMdLookup(dir, base = dir, map = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      buildMdLookup(full, base, map);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = path.relative(base, full).split(path.sep).join('/');
      const key = normalize(rel.replace(/\.md$/, '').replace(/\/index$/, ''));
      map.set(key, full);
    }
  }
  return map;
}

function extractHeadings(mdFile) {
  const lines = fs.readFileSync(mdFile, 'utf-8').split('\n');
  const slugger = new GithubSlugger();
  const headings = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const level = match[1].length;
    const title = match[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!title) continue;
    headings.push({ level, title, anchor: slugger.slug(title) });
  }
  return headings;
}

function nestSections(flatHeadings, pageUrl) {
  const root = [];
  const stack = [];

  for (const h of flatHeadings) {
    const node = {
      heading: `${'#'.repeat(h.level)} ${h.title}`,
      handle: h.anchor,
      humanUrl: `${pageUrl}#${h.anchor}`,
      contents: [],
    };

    while (stack.length && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }

    (stack.length ? stack[stack.length - 1].node.contents : root).push(node);
    stack.push({ node, level: h.level });
  }

  return root;
}

function main() {
  const mdLookup = buildMdLookup(OUT_DIR);

  const sitemapJson = [];
  for (const [routeKey, mdFile] of mdLookup) {
    // URL always reflects the real, working file location — untouched.
    const fullUrl = `${SITE_URL}${BASE_URL}${routeKey === 'index' ? '' : routeKey}`
      .replace(/([^:]\/)\/+/g, '$1');

    // Path is the display/hierarchy field — this is what gets overridden.
    const displayPath = routeKey in PATH_OVERRIDES
      ? PATH_OVERRIDES[routeKey]
      : '/' + (routeKey === 'index' ? '' : routeKey);

    const headings = extractHeadings(mdFile);

    sitemapJson.push({
      url: fullUrl + '.md',
      path: displayPath,
      title: headings.find(h => h.level === 1)?.title ?? null,
      contents: nestSections(headings.filter(h => h.level > 1), fullUrl),
    });
  }

  sitemapJson.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });

  const destination = path.join(OUT_DIR, 'sitemap.json');
  fs.writeFileSync(destination, JSON.stringify(sitemapJson, null, 2));
  console.log(`✅ JSON sitemap successfully generated at: ${destination}`);
}

main();
