import { Text } from '@primer/react';
import React from 'react';

interface LinkifiedTextProps {
  children: string;
  sx?: React.CSSProperties;
}

/**
 * HTMLコンテンツやプレーンテキストを表示するコンポーネント
 * リッチテキストエディタで作成されたHTMLコンテンツの表示に対応
 */
const LinkifiedText: React.FC<LinkifiedTextProps> = ({ children, sx }) => {
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
      /<div[^>]*><div[^>]*><pre[^>]*contenteditable[^>]*>[\s\S]*?<\/pre><\/div><\/div>/g,
      (match) => {
        codeBlocks.push(match);
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
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default LinkifiedText;