// src/theme/NavbarItem/WebMcpBadge/index.tsx
import React from 'react';
import { useWebMCPStatus } from 'webmcp-react';
import styles from './styles.module.css';

export default function WebMcpBadge() {
  const { available: webmcpAvailable } = useWebMCPStatus();

  if (!webmcpAvailable) return null;

  return (
    <div className={styles.badge}>
      <span className={styles.label}>WebMCP Enabled</span>
      <img src="/image/webmcp.svg" alt="WebMCP available" className={styles.icon} />
    </div>
  );
}
