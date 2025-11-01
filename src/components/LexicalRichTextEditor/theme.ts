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
  code: 'lexical-code-block bg-muted p-4 rounded-md border border-border font-mono text-sm my-2 block relative',
  codeHighlight: {
    atrule: 'token-atrule',
    attr: 'token-attr',
    boolean: 'token-boolean',
    builtin: 'token-builtin',
    cdata: 'token-cdata',
    char: 'token-char',
    class: 'token-class',
    'class-name': 'token-class-name',
    comment: 'token-comment',
    constant: 'token-constant',
    deleted: 'token-deleted',
    doctype: 'token-doctype',
    entity: 'token-entity',
    function: 'token-function',
    important: 'token-important',
    inserted: 'token-inserted',
    keyword: 'token-keyword',
    namespace: 'token-namespace',
    number: 'token-number',
    operator: 'token-operator',
    prolog: 'token-prolog',
    property: 'token-property',
    punctuation: 'token-punctuation',
    regex: 'token-regex',
    selector: 'token-selector',
    string: 'token-string',
    symbol: 'token-symbol',
    tag: 'token-tag',
    url: 'token-url',
    variable: 'token-variable',
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
