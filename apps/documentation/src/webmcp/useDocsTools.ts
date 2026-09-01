// src/mcp/useDocsTools.ts (start this file now, grow it later)
import { useMcpTool } from 'webmcp-react';
import { useLocation } from '@docusaurus/router';

export function useDocsTools() {
  const location = useLocation();

  useMcpTool({
    name: 'get_current_page',
    description: "Returns the path and title of the documentation page currently open in the user's browser tab.",
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    handler: async () => {
      return {
        content: [],
        structuredContent: {
          path: location.pathname,
          title: typeof document !== 'undefined' ? document.title : null,
        },
      };
    },
  });
}
