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
export declare class AuthValidator {
    private readonly MCP_AUTH_TOKEN_SCHEMA;
    private readonly expectedToken;
    constructor();
    /**
     * MCPトークンを検証します
     *
     * @param token 検証するトークン
     * @returns トークンが有効な場合はtrue
     */
    validateMcpToken(token: string | undefined): boolean;
    /**
     * タイミング攻撃を防ぐための定数時間比較
     *
     * @param a 比較する文字列1
     * @param b 比較する文字列2
     * @returns 文字列が一致する場合はtrue
     */
    private constantTimeCompare;
    /**
     * 基本的なAPI Key検証（将来拡張用）
     *
     * @param apiKey 検証するAPI Key
     * @returns API Keyが有効な場合はtrue
     */
    validateApiKey(apiKey: string | undefined): boolean;
    /**
     * JWTトークン検証（将来拡張用）
     *
     * @param jwtToken 検証するJWTトークン
     * @returns JWTが有効な場合はtrue
     */
    validateJwtToken(jwtToken: string | undefined): boolean;
    /**
     * 認証が設定されているかを確認
     *
     * @returns 認証トークンが設定されている場合はtrue
     */
    isAuthConfigured(): boolean;
    /**
     * 認証エラーメッセージを生成
     *
     * @param reason エラー理由
     * @returns フォーマットされたエラーメッセージ
     */
    getAuthErrorMessage(reason?: string): string;
}
//# sourceMappingURL=auth-validator.d.ts.map