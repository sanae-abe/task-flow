import DOMPurify from 'isomorphic-dompurify';
/**
 * MarkdownSanitizer - XSS攻撃対策
 *
 * TODO.mdから読み込んだMarkdownテキストをサニタイズします。
 * 悪意あるスクリプトやHTMLタグを除去します。
 *
 * @example
 * ```typescript
 * const sanitizer = new MarkdownSanitizer();
 * const safeTitle = sanitizer.sanitizeTitle('<script>alert("XSS")</script>Task');
 * // => 'Task'
 * ```
 */
export class MarkdownSanitizer {
    /**
     * タスクタイトルをサニタイズします
     *
     * すべてのHTMLタグと属性を除去し、プレーンテキストのみを返します。
     *
     * @param title サニタイズするタイトル
     * @returns サニタイズされたタイトル
     */
    sanitizeTitle(title) {
        if (!title || typeof title !== 'string') {
            return '';
        }
        // すべてのHTMLタグを除去
        const sanitized = DOMPurify.sanitize(title, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true, // タグは除去するが、中身のテキストは保持
        });
        // 余分な空白を除去
        return sanitized.trim().replace(/\s+/g, ' ');
    }
    /**
     * タスク説明をサニタイズします
     *
     * 基本的なMarkdownタグ（強調、リンク等）のみを許可します。
     *
     * @param description サニタイズする説明
     * @returns サニタイズされた説明
     */
    sanitizeDescription(description) {
        if (!description || typeof description !== 'string') {
            return '';
        }
        // 基本的なMarkdownタグのみ許可
        const sanitized = DOMPurify.sanitize(description, {
            ALLOWED_TAGS: [
                'p',
                'br',
                'strong',
                'em',
                'code',
                'pre',
                'ul',
                'ol',
                'li',
            ],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true,
        });
        return sanitized.trim();
    }
    /**
     * Markdownコンテンツ全体をサニタイズします
     *
     * 一般的なMarkdown要素を許可しつつ、危険なタグを除去します。
     *
     * @param content サニタイズするコンテンツ
     * @returns サニタイズされたコンテンツ
     */
    sanitizeMarkdown(content) {
        if (!content || typeof content !== 'string') {
            return '';
        }
        // 一般的なMarkdown要素を許可
        const sanitized = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [
                // テキスト装飾
                'p',
                'br',
                'strong',
                'em',
                'code',
                'pre',
                'blockquote',
                // リスト
                'ul',
                'ol',
                'li',
                // 見出し
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                // テーブル
                'table',
                'thead',
                'tbody',
                'tr',
                'th',
                'td',
                // リンク（hrefは後で許可）
                'a',
            ],
            ALLOWED_ATTR: ['href'], // リンクのhref属性のみ許可
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            KEEP_CONTENT: true,
        });
        return sanitized.trim();
    }
    /**
     * URLをサニタイズします
     *
     * @param url サニタイズするURL
     * @returns サニタイズされたURL（安全でない場合は空文字列）
     */
    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        // 危険なプロトコルをチェック
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        const lowerUrl = url.toLowerCase().trim();
        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return '';
            }
        }
        // URLエンコードされた危険なプロトコルもチェック
        const decoded = decodeURIComponent(lowerUrl);
        for (const protocol of dangerousProtocols) {
            if (decoded.startsWith(protocol)) {
                return '';
            }
        }
        return url.trim();
    }
    /**
     * セクション名をサニタイズします
     *
     * @param section サニタイズするセクション名
     * @returns サニタイズされたセクション名
     */
    sanitizeSection(section) {
        if (!section || typeof section !== 'string') {
            return '';
        }
        // 絵文字は保持、HTMLタグのみ除去
        const sanitized = DOMPurify.sanitize(section, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true,
        });
        return sanitized.trim();
    }
    /**
     * 複数行のテキストをサニタイズします
     *
     * @param text サニタイズするテキスト
     * @returns サニタイズされたテキスト（行ごと）
     */
    sanitizeMultiline(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        return text
            .split('\n')
            .map(line => this.sanitizeTitle(line))
            .join('\n');
    }
    /**
     * バッチでタイトルをサニタイズします
     *
     * @param titles サニタイズするタイトルの配列
     * @returns サニタイズされたタイトルの配列
     */
    sanitizeTitles(titles) {
        return titles.map(title => this.sanitizeTitle(title));
    }
    /**
     * サニタイズが必要かどうかをチェックします
     *
     * @param text チェックするテキスト
     * @returns HTMLタグが含まれる場合はtrue
     */
    needsSanitization(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        // HTMLタグの存在をチェック
        const htmlTagPattern = /<[^>]*>/;
        return htmlTagPattern.test(text);
    }
}
//# sourceMappingURL=sanitizer.js.map