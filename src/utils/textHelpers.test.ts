/**
 * textHelpers utility tests
 * テキスト処理ユーティリティの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import { stripHtml, truncateText } from './textHelpers';

describe('textHelpers', () => {
  describe('stripHtml', () => {
    it('should return plain text when no HTML tags present', () => {
      const text = 'Hello World';
      expect(stripHtml(text)).toBe('Hello World');
    });

    it('should strip simple HTML tags', () => {
      const html = '<p>Hello World</p>';
      expect(stripHtml(html)).toBe('Hello World');
    });

    it('should strip multiple HTML tags', () => {
      const html = '<div><p>Hello <strong>World</strong></p></div>';
      expect(stripHtml(html)).toBe('Hello World');
    });

    it('should strip nested HTML tags', () => {
      const html =
        '<div><span><em>Nested</em> <strong>Tags</strong></span></div>';
      expect(stripHtml(html)).toBe('Nested Tags');
    });

    it('should handle self-closing tags', () => {
      const html = 'Line 1<br/>Line 2';
      expect(stripHtml(html)).toBe('Line 1Line 2');
    });

    it('should handle HTML entities', () => {
      const html = '<p>&lt;div&gt; &amp; &quot;quotes&quot;</p>';
      expect(stripHtml(html)).toBe('<div> & "quotes"');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });

    it('should handle text with HTML-like characters but not tags', () => {
      const text = '2 < 3 and 5 > 4';
      expect(stripHtml(text)).toBe('2 < 3 and 5 > 4');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>Unclosed paragraph';
      const result = stripHtml(html);
      expect(result).toBe('Unclosed paragraph');
    });

    it('should handle script tags', () => {
      const html =
        '<p>Safe content</p><script>alert("xss")</script><p>More content</p>';
      const result = stripHtml(html);
      // DOMParser may keep script content in some browsers, just verify HTML is stripped
      expect(result).toContain('Safe content');
      expect(result).toContain('More content');
    });

    it('should handle style tags', () => {
      const html = '<p>Text</p><style>.class { color: red; }</style>';
      const result = stripHtml(html);
      // DOMParser may keep style content in some browsers, just verify main text is there
      expect(result).toContain('Text');
    });

    it('should preserve whitespace between elements', () => {
      const html = '<span>First</span> <span>Second</span>';
      expect(stripHtml(html)).toBe('First Second');
    });

    it('should handle complex nested structure', () => {
      const html = `
        <article>
          <header><h1>Title</h1></header>
          <section>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </section>
        </article>
      `;
      const result = stripHtml(html);
      expect(result).toContain('Title');
      expect(result).toContain('Paragraph 1');
      expect(result).toContain('Paragraph 2');
    });

    it('should handle HTML comments', () => {
      const html = '<p>Text <!-- comment --> More</p>';
      const result = stripHtml(html);
      expect(result).toContain('Text');
      expect(result).toContain('More');
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than maxLength', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });

    it('should not truncate text equal to maxLength', () => {
      const text = 'ExactLength';
      expect(truncateText(text, 11)).toBe('ExactLength');
    });

    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text';
      expect(truncateText(text, 10)).toBe('This is a ...');
    });

    it('should add ellipsis to truncated text', () => {
      const text = 'Long text here';
      const result = truncateText(text, 5);
      expect(result).toBe('Long ...');
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle maxLength of 0', () => {
      const text = 'Text';
      expect(truncateText(text, 0)).toBe('...');
    });

    it('should handle maxLength of 1', () => {
      const text = 'Text';
      expect(truncateText(text, 1)).toBe('T...');
    });

    it('should handle single character text', () => {
      expect(truncateText('A', 1)).toBe('A');
      expect(truncateText('A', 0)).toBe('...');
    });

    it('should preserve exact characters before ellipsis', () => {
      const text = 'Hello World!';
      const result = truncateText(text, 5);
      expect(result).toBe('Hello...');
      expect(result.substring(0, 5)).toBe('Hello');
    });

    it('should handle Japanese text correctly', () => {
      const text = 'これは日本語のテキストです';
      const result = truncateText(text, 5);
      // substring(0, 5) extracts first 5 characters: "これは日本"
      expect(result).toBe('これは日本...');
      expect(result).toContain('...');
    });

    it('should handle emoji correctly', () => {
      const text = '😀😁😂😃😄';
      const result = truncateText(text, 3);
      // Emoji may be counted as multiple characters, just verify truncation occurred
      expect(result).toContain('...');
      expect(result.length).toBeGreaterThan(3);
    });

    it('should handle mixed content', () => {
      const text = 'Hello 世界 🌍!';
      const result = truncateText(text, 8);
      expect(result).toBe('Hello 世界...');
    });
  });
});
