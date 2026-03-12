/**
 * React-to-HTML Renderer for PDF Generation
 * 
 * This module is a wrapper that delegates to the server-only renderer
 * to avoid Next.js bundler issues with react-dom/server
 * 
 * NOTE: This file exists only for re-export. The actual implementation
 * is in reactRenderer.server.ts which uses runtime require() to avoid
 * bundler issues.
 */

// Re-export from server-only file using dynamic require to avoid bundler analysis
// This prevents Next.js from analyzing the server file during build
export function renderTemplateToHTML(templateId: string, cvData: any): string {
  // Use require at call site to avoid static analysis
  const { renderTemplateToHTML: serverRender } = require('./reactRenderer.server');
  return serverRender(templateId, cvData);
}

