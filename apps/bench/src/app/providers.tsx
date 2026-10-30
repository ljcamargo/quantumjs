// app/providers.tsx
'use client';

import { WebMCPProvider } from 'webmcp-react';
import { I18nProvider } from '../i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <WebMCPProvider name="quantumjs" version="1.0.0">
        {children}
      </WebMCPProvider>
    </I18nProvider>
  );
}
