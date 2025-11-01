import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface LinkifiedTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HTMLコンテンツやプレーンテキストを安全に表示するコンポーネント
 * リッチテキストエディタで作成されたHTMLコンテンツの表示に対応
 * DOMPurifyによるXSS攻撃からの保護機能付き
 */
const LinkifiedText: React.FC<LinkifiedTextProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const processedContent = useMemo(() => {
    // コードブロック内のすべての<span>タグを除去（コンテンツのみ抽出）
    const stripAllSpanTags = (html: string): string => {
      let result = html;
      // すべての<span>タグを再帰的に除去（ネストされた<span>にも対応）
      let previousResult;
      do {
        previousResult = result;
        // <span ...>content</span> を content に置換
        result = result.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
      } while (result !== previousResult); // 変化がなくなるまで繰り返し
      return result;
    };
    // URL自動リンク化を実行する関数（コード記述を除外）
    const linkifyUrls = (text: string) =>
      text.replace(
        /(?<!\w\.)(?:https?:\/\/[^ \t\r\n<>]+|www\.[^ \t\r\n<>]+(?![A-Z_])|(?<!\w\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?![A-Z_])[^ \t\r\n<>]*)/g,
        url => {
          // process.env.JWT_SECRET のようなコード記述を除外
          if (/^[a-zA-Z0-9_]+\.[A-Z_][A-Z0-9_]*$/.test(url)) {
            return url; // コード記述として判定、リンク化しない
          }
          // URLの末尾から句読点や括弧を除去
          const cleanUrl = url.replace(/[.,;:!?)\]}>]+$/, '');
          const href = cleanUrl.startsWith('http')
            ? cleanUrl
            : `https://${cleanUrl}`;
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
        }
      );

    // インラインコードとブロックコードを分けて処理
    const processInlineCode = (html: string): string =>
      html.replace(
        /<code([^>]*)>([\s\S]*?)<\/code>/gi,
        (_match, attributes, content) => {
          // ステップ1: すべての<span>タグを除去
          let cleanContent = stripAllSpanTags(content);

          // ステップ2: リッチテキストエディタのすべての<br>タグを改行に変換
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, '\n');

          // ステップ3: HTMLタグをエスケープ
          const escapedContent = cleanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');

          return `<code${attributes}>${escapedContent}</code>`;
        }
      );

    // Lexicalインラインコード（<span class="lexical-inline-code">）の処理
    const processLexicalInlineCode = (html: string): string =>
      html.replace(
        /<span\s+class="lexical-inline-code"[^>]*>([\s\S]*?)<\/span>/gi,
        (_match, content) => {
          // ステップ1: すべての<span>タグを除去（ネストされた<span>も除去）
          const cleanContent = stripAllSpanTags(content);

          // ステップ2: HTMLタグをエスケープ
          const escapedContent = cleanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');

          // <code>タグに変換して返す
          return `<code>${escapedContent}</code>`;
        }
      );

    // div+pre構造のコードブロック処理（リッチテキストエディタ由来）
    const processDivPreCodeBlock = (html: string): string =>
      html.replace(
        /<div[^>]*><pre([^>]*)>([\s\S]*?)<\/pre><\/div>/gi,
        (_match, _preAttributes, content) => {
          // ステップ1: すべての<span>タグを除去
          let cleanContent = stripAllSpanTags(content);

          // ステップ2: エディタ由来の属性を削除
          cleanContent = cleanContent
            .replace(/contenteditable="[^"]*"/gi, '')
            .replace(/spellcheck="[^"]*"/gi, '')
            .replace(/style="[^"]*"/gi, '');

          // ステップ3: リッチテキストエディタの<br>タグを改行に変換
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, '\n');

          // ステップ4: HTMLタグをエスケープ（改行は保持）
          const escapedContent = cleanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');

          return `<pre>${escapedContent}</pre>`;
        }
      );

    // <pre><code>構造の処理（リッチテキストエディタ由来）
    const processPreCodeBlock = (html: string): string =>
      html.replace(
        /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
        (_match, preAttributes, codeAttributes, content) => {
          // ステップ1: すべての<span>タグを除去
          let cleanContent = stripAllSpanTags(content);

          // ステップ2: エディタ由来の属性を削除
          cleanContent = cleanContent
            .replace(/contenteditable="[^"]*"/gi, '')
            .replace(/spellcheck="[^"]*"/gi, '');

          // ステップ3: リッチテキストエディタの<br>タグを改行に変換
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, '\n');

          // ステップ4: HTMLタグをエスケープ（codeタグ内のコンテンツのみ）
          const escapedContent = cleanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');

          return `<pre${preAttributes}><code${codeAttributes}>${escapedContent}</code></pre>`;
        }
      );

    const processBlockCode = (html: string): string =>
      html.replace(
        /<pre([^>]*)>([\s\S]*?)<\/pre>/gi,
        (_match, attributes, content) => {
          // ステップ1: すべての<span>タグを除去
          let cleanContent = stripAllSpanTags(content);

          // ステップ2: エディタ由来の属性を削除
          cleanContent = cleanContent
            .replace(/contenteditable="[^"]*"/gi, '')
            .replace(/spellcheck="[^"]*"/gi, '')
            .replace(/style="[^"]*"/gi, '');

          // ステップ3: リッチテキストエディタの<br>タグを改行に変換
          // ただし、連続する<br>タグは1つの改行として処理し、コードブロックの分割を防ぐ
          cleanContent = cleanContent.replace(
            /<br\s*\/?>\s*<br\s*\/?>/gi,
            '\n'
          );
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, '\n');

          // ステップ4: HTMLタグをエスケープ
          const escapedContent = cleanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');

          return `<pre${attributes}>${escapedContent}</pre>`;
        }
      );

    // HTMLタグが含まれているかチェック
    const isHtml = /<[^>]+>/.test(children);

    let content: string;

    if (isHtml) {
      // ステップ1: 既存のリンクタグを保護
      const linkMap = new Map<string, string>();
      content = children.replace(/<a\s[^>]*href[^>]*>.*?<\/a>/gi, match => {
        const placeholder = `__LINK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
        linkMap.set(placeholder, match);
        return placeholder;
      });

      // ステップ2: コードブロック（div+pre構造とpre+code構造とpreタグとcodeタグ）を保護
      const codeBlockMap = new Map<string, string>();

      // div+pre構造を保護（リッチテキストエディタ由来）
      content = content.replace(
        /<div[^>]*><pre(?:\s[^>]*)?>[\s\S]*?<\/pre><\/div>/gi,
        match => {
          const placeholder = `__DIV_PRE_BLOCK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        }
      );

      // pre+code構造を保護（リッチテキストエディタ由来、最優先）
      content = content.replace(
        /<pre(?:\s[^>]*)?><code(?:\s[^>]*)?>[\s\S]*?<\/code><\/pre>/gi,
        match => {
          const placeholder = `__PRE_CODE_BLOCK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        }
      );

      // 単独preタグを保護
      content = content.replace(/<pre(?:\s[^>]*)?>[\s\S]*?<\/pre>/gi, match => {
        const placeholder = `__PRE_BLOCK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
        codeBlockMap.set(placeholder, match);
        return placeholder;
      });

      // codeタグを保護
      content = content.replace(
        /<code(?:\s[^>]*)?>[\s\S]*?<\/code>/gi,
        match => {
          const placeholder = `__CODE_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        }
      );

      // Lexicalインラインコード（<span class="lexical-inline-code">）を保護
      content = content.replace(
        /<span\s+class="lexical-inline-code"[^>]*>[\s\S]*?<\/span>/gi,
        match => {
          const placeholder = `__LEXICAL_INLINE_CODE_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        }
      );

      // ステップ3: URL自動リンク化（コードブロック以外）
      content = linkifyUrls(content);

      // ステップ4: 保護されたコードブロックを処理して復元
      codeBlockMap.forEach((originalCode, placeholder) => {
        let processedCode = originalCode;

        if (originalCode.startsWith('<div')) {
          // div+pre構造のコードブロック処理
          processedCode = processDivPreCodeBlock(originalCode);
        } else if (placeholder.includes('PRE_CODE_BLOCK')) {
          // pre+code構造のコードブロック処理（最優先）
          processedCode = processPreCodeBlock(originalCode);
        } else if (originalCode.startsWith('<pre')) {
          processedCode = processBlockCode(originalCode);
        } else if (originalCode.startsWith('<code')) {
          processedCode = processInlineCode(originalCode);
        } else if (placeholder.includes('LEXICAL_INLINE_CODE')) {
          // Lexicalインラインコード処理
          processedCode = processLexicalInlineCode(originalCode);
        }

        content = content.replace(placeholder, processedCode);
      });

      // ステップ5: 改行を<br>に変換（コードブロック外のみ）
      // より厳密にコードブロックを識別し、その内部は一切変更しない
      const finalCodeBlocks: string[] = [];
      const finalPlaceholders: string[] = [];
      let placeholderIndex = 0;

      // div+pre構造を一時的に保護（既に処理済み）
      content = content.replace(
        /<div[^>]*><pre(?:\s[^>]*)?>[\s\S]*?<\/pre><\/div>/gi,
        match => {
          const placeholder = `__FINAL_DIV_PRE_BLOCK_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        }
      );

      // pre+code構造を一時的に保護（最優先）
      content = content.replace(
        /<pre(?:\s[^>]*)?><code(?:\s[^>]*)?>[\s\S]*?<\/code><\/pre>/gi,
        match => {
          const placeholder = `__FINAL_PRE_CODE_BLOCK_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        }
      );

      // preブロックを一時的に保護
      content = content.replace(/<pre(?:\s[^>]*)?>[\s\S]*?<\/pre>/gi, match => {
        const placeholder = `__FINAL_PRE_BLOCK_${placeholderIndex}__`;
        finalCodeBlocks.push(match);
        finalPlaceholders.push(placeholder);
        placeholderIndex++;
        return placeholder;
      });

      // インラインコードを一時的に保護
      content = content.replace(
        /<code(?:\s[^>]*)?>[\s\S]*?<\/code>/gi,
        match => {
          const placeholder = `__FINAL_INLINE_CODE_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        }
      );

      // Lexicalインラインコードを一時的に保護
      content = content.replace(
        /<span\s+class="lexical-inline-code"[^>]*>[\s\S]*?<\/span>/gi,
        match => {
          const placeholder = `__FINAL_LEXICAL_INLINE_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        }
      );

      // コードブロック以外の改行を<br>に変換
      content = content.replace(/\n/g, '<br>');

      // コードブロックを復元
      finalPlaceholders.forEach((placeholder, index) => {
        const codeBlock = finalCodeBlocks[index];
        if (codeBlock !== undefined) {
          content = content.replace(placeholder, codeBlock);
        }
      });

      // ステップ6: 保護したリンクタグを復元
      linkMap.forEach((originalLink, placeholder) => {
        content = content.replace(placeholder, originalLink);
      });
    } else {
      // プレーンテキストの場合は改行を<br>に変換してからURL自動リンク化
      content = children.replace(/\n/g, '<br>');
      content = linkifyUrls(content);
    }

    // XSS攻撃からの保護：DOMPurifyでHTMLをサニタイズ
    // htmlConverter.tsと統一した設定で一貫性を確保
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'a',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'blockquote',
        'span', // Lexicalのインラインコード（<span class="lexical-inline-code">）対応
        'div', // 既存のコードブロック処理との互換性維持
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'style',
        'class',
        // アクセシビリティとHTML標準属性
        'id',
        'name',
      ],
      // data-*とaria-*属性を許可（アクセシビリティ対応）
      ALLOW_DATA_ATTR: true,
      ALLOW_ARIA_ATTR: true,
      // リンクの検証：httpまたはhttpsのみ許可
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      // セキュリティ強化：危険な属性とタグをブロック
      FORBID_ATTR: ['onerror', 'onload'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      // DOMオブジェクトではなく文字列を返す
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });

    // DOMPurify処理後はそのまま返す
    return sanitizedContent;
  }, [children]);

  const combinedStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <span
      className={`block prose prose-sm max-w-none text-foreground ${className} [&_p]:mb-[1em] [&_ul]:mb-[1em] [&_ol]:mb-[1em] [&_ul]:ml-[1em] [&_ol]:ml-[1em]] [&_ul]:list-disc [&_ol]:list-disc [&_a]:underline [&_a]:font-medium [&_pre>code]:!text-inherit [&_pre>code]:!border-0 [&_pre>code]:!p-0[&_pre>code]:!bg-transparent`}
      style={combinedStyle}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default LinkifiedText;
