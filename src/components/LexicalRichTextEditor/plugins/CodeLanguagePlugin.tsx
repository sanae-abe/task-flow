/**
 * Code Language Plugin
 *
 * Adds language selection dropdown to code blocks
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isCodeNode, CodeNode, normalizeCodeLang } from '@lexical/code';
import { $getNodeByKey, NodeKey } from 'lexical';

const CODE_LANGUAGE_FRIENDLY_NAME_MAP: Record<string, string> = {
  c: 'C',
  clike: 'C-like',
  css: 'CSS',
  html: 'HTML',
  js: 'JavaScript',
  markdown: 'Markdown',
  objc: 'Objective-C',
  plain: 'Plain Text',
  py: 'Python',
  rust: 'Rust',
  sql: 'SQL',
  swift: 'Swift',
  typescript: 'TypeScript',
  xml: 'XML',
  tsx: 'TSX',
  jsx: 'JSX',
  json: 'JSON',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

interface CodeLanguageSelectorProps {
  lang: string;
  editor: ReturnType<typeof useLexicalComposerContext>[0];
  nodeKey: NodeKey;
}

function CodeLanguageSelector({
  lang,
  editor,
  nodeKey,
}: CodeLanguageSelectorProps): React.ReactElement {
  const handleCodeLanguageSelect = (value: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isCodeNode(node)) {
        const newLang = normalizeCodeLang(value);
        if (newLang) {
          node.setLanguage(newLang);
        }
      }
    });
  };

  return (
    <select
      className='absolute top-2 right-2 z-10 text-xs bg-background border border-border rounded px-2 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring'
      onChange={e => handleCodeLanguageSelect(e.target.value)}
      value={lang}
    >
      {getCodeLanguageOptions().map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

/**
 * Code Language Plugin Component
 *
 * Adds language selection dropdown to code blocks
 */
export function CodeLanguagePlugin(): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerMutationListener(CodeNode, mutations => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            if (type === 'created' || type === 'updated') {
              const node = $getNodeByKey(key);
              if ($isCodeNode(node)) {
                const element = editor.getElementByKey(key);
                if (element) {
                  const lang = node.getLanguage() || 'plain';

                  // Remove existing selector if any
                  const existingSelector = element.querySelector(
                    '.code-language-selector'
                  );
                  if (existingSelector) {
                    existingSelector.remove();
                  }

                  // Create and append selector
                  const selectorContainer = document.createElement('div');
                  selectorContainer.className = 'code-language-selector';
                  selectorContainer.style.position = 'relative';

                  const parent = element.parentElement;
                  if (parent) {
                    parent.style.position = 'relative';
                  }

                  // Create React root and render selector
                  import('react-dom/client').then(({ createRoot }) => {
                    const root = createRoot(selectorContainer);
                    root.render(
                      <CodeLanguageSelector
                        lang={lang}
                        editor={editor}
                        nodeKey={key}
                      />
                    );
                    element.prepend(selectorContainer);
                  });
                }
              }
            }
          }
        });
      }),
    [editor]
  );

  return null;
}
