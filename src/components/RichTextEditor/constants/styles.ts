/**
 * RichTextEditor style constants
 *
 * This file contains all the styling constants used across the RichTextEditor module.
 */

import type { EditorStyles } from '../types';

// Main editor style constants
export const EDITOR_STYLES: EditorStyles = {
  code: {
    backgroundColor: "hsl(var(--muted))",
    color: "#e01e5a",
    padding: "2px 4px",
    borderRadius: "0.25rem",
    fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
    fontSize: "0.875em",
  },
  link: {
    color: "#0969da",
    textDecoration: "underline",
  },
  codeBlock: {
    backgroundColor: "hsl(var(--muted))",
    padding: "8px",
    borderRadius: "0.5rem",
    border: "1px solid #d0d7de",
    fontFamily: "'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    fontSize: "13px",
    whiteSpace: 'pre-wrap',
    margin: "0 0 8px",
    display: 'block',
  },
} as const;;

// Utility function to create inline style strings
export const createInlineStyleString = (styles: Record<string, string | number>): string =>
  Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value}`;
    })
    .join('; ');

// Common toolbar styles
export const TOOLBAR_STYLES = {
  container: {
    display: 'flex',
    gap: '4px',
    padding: '8px',
    borderBottom: '1px solid #d0d7de',
    backgroundColor: 'hsl(var(--muted))',
    borderTopLeftRadius: '0.5rem',
    borderTopRightRadius: '0.5rem',
  },
  button: {
    padding: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#e6f3ff',
    color: '#0969da',
  },
} as const;

// Editor container styles
export const EDITOR_CONTAINER_STYLES = {
  container: {
    border: '1px solid #d0d7de',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  editor: {
    minHeight: '120px',
    padding: '12px',
    outline: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  placeholder: {
    color: '#656d76',
    pointerEvents: 'none' as const,
  },
} as const;