/**
 * HTML処理用のヘルパー関数
 */

/**
 * HTMLエスケープ処理を行う関数
 */
export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>'); // 改行をBRタグに変換

/**
 * モダンなHTML挿入関数
 */
export const insertHtmlAtCursor = (html: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  try {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    // HTMLを解析してDOM要素として挿入
    const div = document.createElement('div');
    div.innerHTML = html;
    const fragment = document.createDocumentFragment();

    while (div.firstChild) {
      fragment.appendChild(div.firstChild);
    }

    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (_error) {
    // HTML挿入に失敗、フォールバックを使用
    // フォールバック: document.execCommand
    try {
      document.execCommand('insertHTML', false, html);
    } catch (_fallbackError) {
      // フォールバック挿入も失敗 - プロダクションではサイレント
    }
  }
};
