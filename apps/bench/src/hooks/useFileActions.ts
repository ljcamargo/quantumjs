import { useCallback } from 'react';
import { downloadText, downloadResultsCsv, copyToClipboard, resultsToCsv } from '../lib/download';

/**
 * Handlers for the copy/download/new actions exposed as panel header buttons.
 * Pure side-effect callbacks keyed off the current code/qasm/results.
 */
export function useFileActions(
  code: string,
  qasm: string,
  results: Record<string, number> | null,
  setCode: (c: string) => void,
) {
  const handleNewCode = useCallback(() => setCode(''), [setCode]);

  const handleDownloadCode = useCallback(() => downloadText('circuit.js', code), [code]);
  const handleCopyCode = useCallback(() => copyToClipboard(code), [code]);

  const handleDownloadQasm = useCallback(() => downloadText('circuit.qasm', qasm), [qasm]);
  const handleCopyQasm = useCallback(() => copyToClipboard(qasm), [qasm]);

  const handleDownloadResults = useCallback(() => {
    if (results) downloadResultsCsv('results.csv', results);
  }, [results]);

  const handleCopyResults = useCallback(() => {
    if (results) copyToClipboard(resultsToCsv(results));
  }, [results]);

  return {
    handleNewCode,
    handleDownloadCode,
    handleCopyCode,
    handleDownloadQasm,
    handleCopyQasm,
    handleDownloadResults,
    handleCopyResults,
  };
}
