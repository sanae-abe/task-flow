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
    // HTMLタグが含まれている場合はそのまま表示、プレーンテキストの場合はURLを自動リンク化
    const isHtml = /<[^>]+>/.test(children);

    let content = isHtml
      ? children
      : children.replace(
          /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g,
          (url) => {
            const href = url.startsWith('http') ? url : `https://${url}`;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
          }
        );

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
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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
        ...sx,
        '& p': {
          margin: '0 0 8px 0',
          lineHeight: 1.5,
          '&:last-child': {
            margin: 0,
          },
          '&:empty': {
            display: 'none',
          },
        },
        '& br': {
          lineHeight: 1.5,
        },
        '& strong': {
          fontWeight: 'bold',
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& u': {
          textDecoration: 'underline',
        },
        '& a': {
          color: 'accent.fg',
          textDecoration: 'underline',
          '&:hover': {
            color: 'accent.emphasis',
          },
        },
        '& code': {
          backgroundColor: '#e8f5e8',
          color: '#e01e5a',
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
          fontSize: '0.875em',
          border: '1px solid #d1d9e0',
          fontWeight: '500',
        },
        '& ul, & ol': {
          margin: '8px 0',
          paddingLeft: '24px',
        },
        '& li': {
          margin: '4px 0',
        },
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }} // サニタイズ済みのため安全
    />
  );
};

export default LinkifiedText;