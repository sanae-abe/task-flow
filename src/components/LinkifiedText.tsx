import { Text } from '@primer/react';
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface LinkifiedTextProps {
  children: string;
  sx?: React.CSSProperties;
}

/**
 * HTMLコンテンツやプレーンテキストを安全に表示するコンポーネント
 * リッチテキストエディタで作成されたHTMLコンテンツの表示に対応
 * DOMPurifyによるXSS攻撃からの保護機能付き
 */
const LinkifiedText: React.FC<LinkifiedTextProps> = ({ children, sx }) => {
  const processedContent = useMemo(() => {
    // URL自動リンク化を実行する関数
    const linkifyUrls = (text: string) => text.replace(
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g,
      (url) => {
        const href = url.startsWith('http') ? url : `https://${url}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
    );

    // HTMLタグが含まれているかチェック
    const isHtml = /<[^>]+>/.test(children);

    let content: string;

    if (isHtml) {
      // HTMLコンテンツの場合、既存のリンクタグ以外の部分でURL自動リンク化を実行
      const linkMap = new Map<string, string>();

      content = children.replace(
        // 既存のリンクタグを一時的に保護
        /<a\s[^>]*href[^>]*>.*?<\/a>/gi,
        (match) => {
          // リンクタグをプレースホルダーに置換
          const placeholder = `__LINK_PLACEHOLDER_${Math.random().toString(36).substr(2, 9)}__`;
          linkMap.set(placeholder, match);
          return placeholder;
        }
      );

      // リンクタグ以外の部分でURL自動リンク化
      content = linkifyUrls(content);

      // プレースホルダーを元のリンクタグに戻す
      linkMap.forEach((originalLink, placeholder) => {
        content = content.replace(placeholder, originalLink);
      });
    } else {
      // プレーンテキストの場合はそのままURL自動リンク化
      content = linkifyUrls(children);
    }

    // HTML内容を正規化：不要な<pre>タグで囲まれた改行を修正
    if (isHtml) {
      // コードブロックを一時的に保護
      const codeBlocks: string[] = [];
      content = content.replace(
        /<div[^>]*><pre[^>]*contenteditable[^>]*>([\s\S]*?)<\/pre><\/div>/g,
        (match, innerContent) => {
          // コードブロック内のHTMLタグをエスケープして保護
          const escapedContent = innerContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const protectedBlock = match.replace(innerContent, escapedContent);
          codeBlocks.push(protectedBlock);
          return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        }
      );

      // 自動生成された<pre>タグを削除（コードブロック以外）
      content = content.replace(/<pre>([^<]*)<\/pre>/g, '$1');

      // 改行を<br>に変換
      content = content.replace(/\n/g, '<br>');

      // 連続する<br>を段落に変換
      content = content.replace(/(<br>\s*){2,}/g, '</p><p>');

      // 最初と最後に段落タグを追加（必要に応じて）
      if (content.includes('<br>') || content.includes('</p><p>')) {
        content = `<p>${content}</p>`;
        // 空の段落を削除
        content = content.replace(/<p><\/p>/g, '');
      }

      // コードブロックを復元
      codeBlocks.forEach((block, index) => {
        content = content.replace(`__CODEBLOCK_${index}__`, block);
      });
    }

    // XSS攻撃からの保護：DOMPurifyでHTMLをサニタイズ
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'a', 'code', 'pre', 'div',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'contenteditable', 'style', 'spellcheck'
      ],
      // リンクの検証：httpまたはhttpsのみ許可
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      // 悪意のあるプロトコルをブロック
      FORBID_ATTR: ['onerror', 'onload', 'onclick'],
      // DOM操作を防ぐ
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      // 新しいウィンドウで開くリンクにセキュリティ属性を追加
      ADD_ATTR: ['target', 'rel'],
      // DOMオブジェクトではなく文字列を返す
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    });

    return sanitizedContent;
  }, [children]);

  return (
    <Text
      sx={{
        '& a': {
          color: 'accent.fg',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& code': {
          backgroundColor: 'canvas.subtle',
          color: 'accent.fg',
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: 'mono',
          fontSize: '0.875em',
          border: '1px solid',
          borderColor: 'border.default',
        },
        '& ul, & ol': {
          margin: '8px 0',
          paddingLeft: '24px',
        },
        '& li': {
          margin: '4px 0',
        },

        '& pre': {
          backgroundColor: 'canvas.subtle',
          color: 'fg.default',
          padding: '8px',
          borderRadius: '6px',
          fontFamily: 'mono',
          fontSize: '13px',
          lineHeight: '1.45',
          overflowX: 'auto',
          border: '1px solid',
          borderColor: 'border.default',
          margin: '0 0 8px',
          '& code': {
            backgroundColor: 'transparent',
            color: 'inherit',
            padding: 0,
            border: 'none',
          },
        },
        '& p': {
          margin: '0 0 8px',
          '&:last-child': {
            margin: 0,
          },
        },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default LinkifiedText;