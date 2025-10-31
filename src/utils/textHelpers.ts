/**
 * テキスト処理のためのユーティリティ関数
 */

/**
 * HTMLタグを除去してプレーンテキストを取得
 * @param html HTMLを含むテキスト
 * @returns プレーンテキスト
 */
export const stripHtml = (html: string): string => {
  // HTMLタグが含まれていない場合はそのまま返す
  if (!/<[^>]+>/.test(html)) {
    return html;
  }

  // ブラウザのDOMParserを使用してHTMLを解析し、テキストのみを抽出
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || doc.body.innerText || '';
};

/**
 * テキストを指定した文字数で切り詰める
 * @param text 対象のテキスト
 * @param maxLength 最大文字数
 * @returns 切り詰められたテキスト
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};
