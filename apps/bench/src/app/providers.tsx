// app/providers.tsx
'use client';

import { WebMCPProvider } from 'webmcp-react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WebMCPProvider name="quantumjs" version="1.0.0">
      {children}
    </WebMCPProvider>
  );
}
