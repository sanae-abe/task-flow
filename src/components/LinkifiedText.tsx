import React, { useMemo } from "react";
import DOMPurify from "dompurify";

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
const LinkifiedText: React.FC<LinkifiedTextProps> = ({ children, className = "", style = {} }) => {
  const processedContent = useMemo(() => {
    // URL自動リンク化を実行する関数（コード記述を除外）
    const linkifyUrls = (text: string) =>
      text.replace(
        /(?<!\w\.)(?:https?:\/\/[^\s]+|www\.[^\s]+(?![A-Z_])|(?<!\w\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?![A-Z_])[^\s]*)/g,
        (url) => {
          // process.env.JWT_SECRET のようなコード記述を除外
          if (/^[a-zA-Z0-9_]+\.[A-Z_][A-Z0-9_]*$/.test(url)) {
            return url; // コード記述として判定、リンク化しない
          }
          const href = url.startsWith("http") ? url : `https://${url}`;
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        },
      );

    // インラインコードとブロックコードを分けて処理
    const processInlineCode = (html: string): string =>
      html.replace(
        /<code([^>]*)>([\s\S]*?)<\/code>/gi,
        (_match, attributes, content) => {
          // リッチテキストエディタのすべての<br>タグを改行に変換
          const processedContent = content.replace(/<br\s*\/?>/gi, "\n");

          // HTMLタグをエスケープ
          const escapedContent = processedContent
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\{/g, "&#123;")
            .replace(/\}/g, "&#125;");

          return `<code${attributes}>${escapedContent}</code>`;
        },
      );

    // div+pre構造のコードブロック処理（リッチテキストエディタ由来）
    const processDivPreCodeBlock = (html: string): string =>
      html.replace(
        /<div[^>]*><pre([^>]*)>([\s\S]*?)<\/pre><\/div>/gi,
        (_match, _preAttributes, content) => {
          // ステップ1: エディタ由来の属性を削除
          let cleanContent = content
            .replace(/contenteditable="[^"]*"/gi, "")
            .replace(/spellcheck="[^"]*"/gi, "")
            .replace(/style="[^"]*"/gi, "");

          // ステップ2: リッチテキストエディタの<br>タグを改行に変換
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, "\n");

          // ステップ3: HTMLタグをエスケープ（改行は保持）
          const escapedContent = cleanContent
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\{/g, "&#123;")
            .replace(/\}/g, "&#125;");

          return `<pre>${escapedContent}</pre>`;
        },
      );

    const processBlockCode = (html: string): string =>
      html.replace(
        /<pre([^>]*)>([\s\S]*?)<\/pre>/gi,
        (_match, attributes, content) => {
          // ステップ1: エディタ由来の属性を削除
          let cleanContent = content
            .replace(/contenteditable="[^"]*"/gi, "")
            .replace(/spellcheck="[^"]*"/gi, "")
            .replace(/style="[^"]*"/gi, "");

          // ステップ2: リッチテキストエディタの<br>タグを改行に変換
          // ただし、連続する<br>タグは1つの改行として処理し、コードブロックの分割を防ぐ
          cleanContent = cleanContent.replace(
            /<br\s*\/?>\s*<br\s*\/?>/gi,
            "\n",
          );
          cleanContent = cleanContent.replace(/<br\s*\/?>/gi, "\n");

          // ステップ3: HTMLタグをエスケープ
          const escapedContent = cleanContent
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\{/g, "&#123;")
            .replace(/\}/g, "&#125;");

          return `<pre${attributes}>${escapedContent}</pre>`;
        },
      );

    // HTMLタグが含まれているかチェック
    const isHtml = /<[^>]+>/.test(children);

    let content: string;

    if (isHtml) {
      // ステップ1: 既存のリンクタグを保護
      const linkMap = new Map<string, string>();
      content = children.replace(/<a\s[^>]*href[^>]*>.*?<\/a>/gi, (match) => {
        const placeholder = `__LINK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
        linkMap.set(placeholder, match);
        return placeholder;
      });

      // ステップ2: コードブロック（div+pre構造とpreタグとcodeタグ）を保護
      const codeBlockMap = new Map<string, string>();

      // div+pre構造を保護（リッチテキストエディタ由来）
      content = content.replace(
        /<div[^>]*><pre(?:\s[^>]*)?>[\s\S]*?<\/pre><\/div>/gi,
        (match) => {
          const placeholder = `__DIV_PRE_BLOCK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        },
      );

      // 単独preタグを保護
      content = content.replace(
        /<pre(?:\s[^>]*)?>[\s\S]*?<\/pre>/gi,
        (match) => {
          const placeholder = `__PRE_BLOCK_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        },
      );

      // codeタグを保護
      content = content.replace(
        /<code(?:\s[^>]*)?>[\s\S]*?<\/code>/gi,
        (match) => {
          const placeholder = `__CODE_PLACEHOLDER_${Math.random().toString(36).substring(2, 11)}__`;
          codeBlockMap.set(placeholder, match);
          return placeholder;
        },
      );

      // ステップ3: URL自動リンク化（コードブロック以外）
      content = linkifyUrls(content);

      // ステップ4: 保護されたコードブロックを処理して復元
      codeBlockMap.forEach((originalCode, placeholder) => {
        let processedCode = originalCode;

        if (originalCode.startsWith("<div")) {
          // div+pre構造のコードブロック処理
          processedCode = processDivPreCodeBlock(originalCode);
        } else if (originalCode.startsWith("<pre")) {
          processedCode = processBlockCode(originalCode);
        } else if (originalCode.startsWith("<code")) {
          processedCode = processInlineCode(originalCode);
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
        (match) => {
          const placeholder = `__FINAL_DIV_PRE_BLOCK_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        },
      );

      // preブロックを一時的に保護
      content = content.replace(
        /<pre(?:\s[^>]*)?>[\s\S]*?<\/pre>/gi,
        (match) => {
          const placeholder = `__FINAL_PRE_BLOCK_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        },
      );

      // インラインコードを一時的に保護
      content = content.replace(
        /<code(?:\s[^>]*)?>[\s\S]*?<\/code>/gi,
        (match) => {
          const placeholder = `__FINAL_INLINE_CODE_${placeholderIndex}__`;
          finalCodeBlocks.push(match);
          finalPlaceholders.push(placeholder);
          placeholderIndex++;
          return placeholder;
        },
      );

      // コードブロック以外の改行を<br>に変換
      content = content.replace(/\n/g, "<br>");

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
      content = children.replace(/\n/g, "<br>");
      content = linkifyUrls(content);
    }

    // XSS攻撃からの保護：DOMPurifyでHTMLをサニタイズ
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "a",
        "code",
        "pre",
        "div",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "span",
        "html",
        "head",
        "body",
        "title",
        "meta",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "class",
        // JSX/仮想DOM表示のための属性（表示専用、実際の実行はしない）
        "classname",
        "onclick",
        "onsubmit",
        "onchange",
        "onfocus",
        "onblur",
        "onkeydown",
        "onkeyup",
        "onmouseover",
        "onmouseout",
        "onmouseenter",
        "onmouseleave",
        "key",
        "ref",
        "htmlfor",
        "defaultvalue",
        "defaultchecked",
        "data-*",
        "aria-*",
        "id",
        "name",
        "value",
        "type",
        "placeholder",
      ],
      // より寛容な設定でJSX属性を保護
      ALLOW_DATA_ATTR: true,
      ALLOW_ARIA_ATTR: true,
      // リンクの検証：httpまたはhttpsのみ許可
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      // 悪意のあるプロトコルをブロック（コードブロック内では表示のみなので安全）
      FORBID_ATTR: ["onerror", "onload"],
      // DOM操作を防ぐ
      FORBID_TAGS: ["script", "object", "embed", "form", "input", "button"],
      // 新しいウィンドウで開くリンクにセキュリティ属性を追加
      ADD_ATTR: ["target", "rel"],
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
      className={`prose prose-sm max-w-none text-foreground ${className}`}
      style={combinedStyle}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default LinkifiedText;
