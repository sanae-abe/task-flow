/**
 * Lexical Editor Theme Configuration
 *
 * Tailwind CSS-based theme for Lexical editor
 */

import type { EditorThemeClasses } from 'lexical';

export const lexicalTheme: EditorThemeClasses = {
  // Text formatting
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'lexical-inline-code',
  },

  // Links
  link: 'text-primary underline hover:text-primary/80 cursor-pointer',

  // Lists
  list: {
    ul: 'list-disc ml-6 my-2',
    ol: 'list-decimal ml-6 my-2',
    listitem: 'my-1',
    nested: {
      listitem: 'list-none',
    },
  },

  // Code blocks
  code: 'bg-muted p-4 rounded-md border border-border font-mono text-sm my-2 block',
  codeHighlight: {
    // Code highlighting can be added later
  },

  // Paragraphs
  paragraph: 'mb-2 last:mb-0',

  // Quotes
  quote: 'border-l-4 border-border pl-4 italic my-2',

  // Headings
  heading: {
    h1: 'text-2xl font-bold my-2',
    h2: 'text-xl font-bold my-2',
    h3: 'text-lg font-bold my-2',
  },
};
