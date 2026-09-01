import React, {type ReactNode} from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';
import { WebMCPProvider } from 'webmcp-react';
import { useDocsTools } from '../../webmcp/useDocsTools';

type Props = WrapperProps<typeof LayoutType>;

function WebMcpTools() {
  useDocsTools();
  return null;
}

export default function LayoutWrapper(props: Props): ReactNode {

  return (
    <WebMCPProvider name="quantumjs_docs" version="1.0.0">
      <WebMcpTools />
      <Layout {...props} />
    </WebMCPProvider>
  );
}
