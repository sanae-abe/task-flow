import { z } from 'zod';
/**
 * AuthValidator - MCP認証機構
 *
 * MCPクライアントからのアクセスを認証します。
 * トークンベース認証で悪意あるクライアントを防ぎます。
 *
 * @example
 * ```typescript
 * const validator = new AuthValidator();
 * const isValid = validator.validateMcpToken(context.authToken);
 * if (!isValid) {
 *   throw new Error('Unauthorized MCP access');
 * }
 * ```
 */
export class AuthValidator {
    MCP_AUTH_TOKEN_SCHEMA = z.string().min(32);
    expectedToken;
    constructor() {
        this.expectedToken = process.env.MCP_AUTH_TOKEN;
        // 本番環境では環境変数を強制
        if (process.env.NODE_ENV === 'production' && !this.expectedToken) {
            throw new Error('SECURITY ERROR: MCP_AUTH_TOKEN must be set in production environment. ' +
                'Generate a secure token with: openssl rand -base64 32');
        }
        // 開発環境での警告
        if (!this.expectedToken && process.env.NODE_ENV !== 'test') {
            console.warn('⚠️  MCP_AUTH_TOKEN is not set. MCP Tool access will be denied. ' +
                'Generate a token with: openssl rand -base64 32');
        }
    }
    /**
     * MCPトークンを検証します
     *
     * @param token 検証するトークン
     * @returns トークンが有効な場合はtrue
     */
    validateMcpToken(token) {
        // トークン未設定の場合はすべて拒否
        if (!this.expectedToken) {
            return false;
        }
        // トークンが提供されていない場合
        if (!token) {
            return false;
        }
        // スキーマ検証（最低32文字）
        try {
            this.MCP_AUTH_TOKEN_SCHEMA.parse(token);
        }
        catch {
            return false;
        }
        // タイミング攻撃対策（定数時間比較）
        return this.constantTimeCompare(token, this.expectedToken);
    }
    /**
     * タイミング攻撃を防ぐための定数時間比較
     *
     * @param a 比較する文字列1
     * @param b 比較する文字列2
     * @returns 文字列が一致する場合はtrue
     */
    constantTimeCompare(a, b) {
        // 長さが異なる場合は即座に失敗
        if (a.length !== b.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
    /**
     * 基本的なAPI Key検証（将来拡張用）
     *
     * @param apiKey 検証するAPI Key
     * @returns API Keyが有効な場合はtrue
     */
    validateApiKey(_apiKey) {
        // 将来実装予定
        // 現在はMCP認証のみサポート
        return false;
    }
    /**
     * JWTトークン検証（将来拡張用）
     *
     * @param jwtToken 検証するJWTトークン
     * @returns JWTが有効な場合はtrue
     */
    validateJwtToken(_jwtToken) {
        // 将来実装予定（Phase 6以降）
        return false;
    }
    /**
     * 認証が設定されているかを確認
     *
     * @returns 認証トークンが設定されている場合はtrue
     */
    isAuthConfigured() {
        return !!this.expectedToken;
    }
    /**
     * 認証エラーメッセージを生成
     *
     * @param reason エラー理由
     * @returns フォーマットされたエラーメッセージ
     */
    getAuthErrorMessage(reason) {
        const baseMessage = 'Unauthorized MCP access';
        if (!this.expectedToken) {
            return `${baseMessage}: MCP_AUTH_TOKEN not configured`;
        }
        if (reason) {
            return `${baseMessage}: ${reason}`;
        }
        return baseMessage;
    }
}
//# sourceMappingURL=auth-validator.js.map