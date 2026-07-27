/** Trigger a browser download of a text string as a file. */
export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(filename, blob);
}

/** Trigger a browser download of an SVG element as a .svg file. */
export function downloadSvg(filename: string, svgElement: SVGSVGElement): void {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(filename, blob);
}

/**
 * Convert probability results (Record<string, number>) to CSV and download.
 * Columns: state, probability (as percentage).
 */
export function downloadResultsCsv(
  filename: string,
  results: Record<string, number>
): void {
  const header = 'state,probability_pct';
  const rows = Object.entries(results)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, prob]) => `${state},${(prob * 100).toFixed(2)}`);
  const csv = [header, ...rows].join('\n');
  downloadText(filename, csv);
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
