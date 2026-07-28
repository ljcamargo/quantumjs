/** Copy a string to the system clipboard. */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/** Trigger a browser download of a text string as a file. */
export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(filename, blob);
}

/** Serialize an SVG DOM element to its string representation. */
export function svgToString(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

/** Trigger a browser download of an SVG element as a .svg file. */
export function downloadSvg(filename: string, svgElement: SVGSVGElement): void {
  const blob = new Blob([svgToString(svgElement)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  triggerDownload(filename, blob);
}

/** Convert probability results into CSV text (state, probability_pct). */
export function resultsToCsv(results: Record<string, number>): string {
  const header = 'state,probability_pct';
  const rows = Object.entries(results)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, prob]) => `${state},${(prob * 100).toFixed(2)}`);
  return [header, ...rows].join('\n');
}

/**
 * Convert probability results to CSV and download.
 */
export function downloadResultsCsv(
  filename: string,
  results: Record<string, number>
): void {
  downloadText(filename, resultsToCsv(results));
}

// ─── helpers ──────────────────────────────────────────────────────────────

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
