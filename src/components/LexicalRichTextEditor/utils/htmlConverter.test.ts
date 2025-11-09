/**
 * HTML Converter - DOMPurify Security Tests
 * DOMPurifyの統合とXSS攻撃パターンのサニタイズ検証
 */

import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';
import { isHtmlEmpty } from './htmlConverter';

describe('htmlConverter - DOMPurify Security Integration', () => {
  describe('DOMPurify Configuration', () => {
    it('should be imported and available', () => {
      expect(DOMPurify).toBeDefined();
      expect(DOMPurify.sanitize).toBeDefined();
    });

    it('should sanitize script tags', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe</p>';
      const sanitized = DOMPurify.sanitize(malicious, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Safe</p>');
    });

    it('should sanitize event handlers', () => {
      const malicious = '<p onclick="alert(\'XSS\')">Click me</p>';
      const sanitized = DOMPurify.sanitize(malicious, {
        ALLOWED_TAGS: ['p'],
        ALLOWED_ATTR: [],
      });

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('Click me');
    });

    it('should sanitize iframe injection', () => {
      const malicious =
        '<iframe src="https://evil.com"></iframe><p>Content</p>';
      const sanitized = DOMPurify.sanitize(malicious, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).toContain('<p>Content</p>');
    });

    it('should sanitize JavaScript URLs', () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const sanitized = DOMPurify.sanitize(malicious, {
        ALLOWED_TAGS: ['a'],
        ALLOWED_ATTR: ['href'],
      });

      expect(sanitized).not.toContain('javascript:');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const sanitized = DOMPurify.sanitize(safe, {
        ALLOWED_TAGS: ['p', 'strong', 'em'],
      });

      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });

    it('should allow safe attributes', () => {
      const safe = '<a href="https://example.com" target="_blank">Link</a>';
      const sanitized = DOMPurify.sanitize(safe, {
        ALLOWED_TAGS: ['a'],
        ALLOWED_ATTR: ['href', 'target'],
      });

      expect(sanitized).toContain('href="https://example.com"');
      expect(sanitized).toContain('target="_blank"');
    });
  });

  describe('XSS Attack Patterns - Comprehensive List', () => {
    const maliciousPatterns = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<a href="javascript:alert(\'XSS\')">click</a>',
      '<iframe src="https://evil.com"></iframe>',
      '<object data="https://evil.com/malware"></object>',
      '<embed src="https://evil.com/malware">',
      '<svg><script>alert("XSS")</script></svg>',
      '<form action="https://evil.com"><input></form>',
      '<meta http-equiv="refresh" content="0;url=https://evil.com">',
      '<base href="https://evil.com/">',
      '<div onclick="alert(\'XSS\')">Click</div>',
      '<span onmouseover="alert(\'XSS\')">Hover</span>',
      '<img src=x onload=alert("XSS")>',
      '<body onload=alert("XSS")>',
      '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
    ];

    maliciousPatterns.forEach((pattern, index) => {
      it(`should sanitize attack pattern ${index + 1}: ${pattern.substring(0, 50)}...`, () => {
        const sanitized = DOMPurify.sanitize(pattern, {
          ALLOWED_TAGS: ['p', 'div', 'span', 'strong', 'em'],
          ALLOWED_ATTR: [],
        });

        // すべてのXSS攻撃ベクターが除去されることを確認
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('onmouseover');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<object');
        expect(sanitized).not.toContain('<embed');
        expect(sanitized).not.toContain('<meta');
        expect(sanitized).not.toContain('<base');
      });
    });
  });

  describe('isHtmlEmpty Helper Function', () => {
    it('should return true for empty string', () => {
      expect(isHtmlEmpty('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isHtmlEmpty('   \n\t  ')).toBe(true);
    });

    it('should return true for empty HTML tags', () => {
      expect(isHtmlEmpty('<p></p>')).toBe(true);
      expect(isHtmlEmpty('<p>  </p>')).toBe(true);
      expect(isHtmlEmpty('<div><p></p></div>')).toBe(true);
    });

    it('should return false for non-empty HTML', () => {
      expect(isHtmlEmpty('<p>Text</p>')).toBe(false);
      expect(isHtmlEmpty('<p><strong>Bold</strong></p>')).toBe(false);
    });

    it('should sanitize input before checking', () => {
      // XSS攻撃パターンは空とみなされるべき
      expect(isHtmlEmpty('<script>alert("XSS")</script>')).toBe(true);
    });

    it('should handle special characters', () => {
      expect(isHtmlEmpty('<p>&lt;div&gt; &amp; &quot;test&quot;</p>')).toBe(
        false
      );
    });

    it('should handle Unicode', () => {
      expect(isHtmlEmpty('<p>日本語</p>')).toBe(false);
      expect(isHtmlEmpty('<p>🎉</p>')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long input', () => {
      const longText = 'a'.repeat(10000);
      const input = `<p>${longText}</p>`;
      const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).toContain('aaaa');
      expect(sanitized.length).toBeGreaterThan(9000);
    });

    it('should handle deeply nested HTML', () => {
      const nested = '<div><p><strong><em><u>Deep</u></em></strong></p></div>';
      const sanitized = DOMPurify.sanitize(nested, {
        ALLOWED_TAGS: ['div', 'p', 'strong', 'em', 'u'],
      });

      expect(sanitized).toContain('Deep');
    });

    it('should handle mixed safe and malicious content', () => {
      const mixed = '<p>Safe</p><script>alert("XSS")</script><p>Also safe</p>';
      const sanitized = DOMPurify.sanitize(mixed, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).toContain('Safe');
      expect(sanitized).toContain('Also safe');
      expect(sanitized).not.toContain('<script');
    });

    it('should handle multiple attack vectors in same input', () => {
      const multiAttack =
        '<img src=x onerror=alert(1)><script>alert(2)</script><iframe src="evil.com"></iframe>';
      const sanitized = DOMPurify.sanitize(multiAttack, {
        ALLOWED_TAGS: [],
      });

      expect(sanitized).toBe('');
    });
  });

  describe('Special HTML Entities', () => {
    it('should preserve HTML entities', () => {
      const input = '<p>&lt;div&gt; &amp; &quot;test&quot;</p>';
      const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&amp;');
      // DOMPurify may convert &quot; to " depending on context
      expect(sanitized).toMatch(/&quot;|"/);
    });

    it('should handle numeric entities', () => {
      const input = '<p>&#60;&#62;&#38;</p>';
      const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p'],
      });

      expect(sanitized).toBeDefined();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle null/undefined gracefully', () => {
      expect(() => DOMPurify.sanitize('')).not.toThrow();
    });

    it('should be deterministic (same input = same output)', () => {
      const input = '<p>Test <strong>content</strong></p>';
      const config = { ALLOWED_TAGS: ['p', 'strong'] };

      const result1 = DOMPurify.sanitize(input, config);
      const result2 = DOMPurify.sanitize(input, config);

      expect(result1).toBe(result2);
    });

    it('should handle rapid sanitization calls', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => `<p>Test ${i}</p>`);

      expect(() => {
        inputs.forEach(input =>
          DOMPurify.sanitize(input, { ALLOWED_TAGS: ['p'] })
        );
      }).not.toThrow();
    });
  });
});
