/**
 * RichTextEditor用のスタイル定数
 */
export const EDITOR_STYLES = {
  code: {
    backgroundColor: '#f6f8fa',
    color: '#e01e5a',
    padding: '2px 4px',
    borderRadius: 'var(--borderRadius-small)',
    fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
    fontSize: '0.875em',
    border: '1px solid #d0d7de',
  },
  codeBlock: {
    margin: '0 0 8px',
    border: '1px solid #d0d7de',
    borderRadius: 'var(--borderRadius-medium)',
    padding: '8px',
    fontFamily: "'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    fontSize: '13px',
    lineHeight: '1.45',
    overflowX: 'auto',
    color: '#24292f',
    backgroundColor: '#f6f8fa',
  },
} as const;

/**
 * スタイル文字列生成関数
 */
export const createInlineStyleString = (styles: Record<string, string | number>) => Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');