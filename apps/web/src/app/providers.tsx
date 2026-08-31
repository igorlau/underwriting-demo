import type * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Application-wide providers, initialised once at start-up. Routing is the only
 * one the prototype needs; a query client, theme or auth provider would be
 * composed here rather than threaded through the tree.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
