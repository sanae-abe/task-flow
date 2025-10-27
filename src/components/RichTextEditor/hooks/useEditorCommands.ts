import { useCallback } from 'react';
import { insertHtmlAtCursor } from '../utils/htmlHelpers';
import { EDITOR_STYLES, createInlineStyleString } from '../utils/editorStyles';

/**
 * エディタコマンド管理用カスタムフック
 */
export const useEditorCommands = (
  editorRef: React.RefObject<HTMLDivElement>,
  handleInput: () => void
) => {
  // モダンなSelection APIベースのコマンド実行
  const executeCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();
      if (!selection) {return;}

      try {
        switch (command) {
          case 'bold':
            document.execCommand('bold', false);
            break;
          case 'italic':
            document.execCommand('italic', false);
            break;
          case 'underline':
            document.execCommand('underline', false);
            break;
          case 'strikeThrough':
            document.execCommand('strikeThrough', false);
            break;
          case 'insertUnorderedList':
            document.execCommand('insertUnorderedList', false);
            break;
          case 'insertOrderedList':
            document.execCommand('insertOrderedList', false);
            break;
          default:
            // フォールバック: 従来のdocument.execCommand
            if (value) {
              document.execCommand(command, false, value);
            } else {
              document.execCommand(command);
            }
        }
        handleInput();
      } catch (_error) {
        // コマンド実行失敗、フォールバック処理
        try {
          if (value) {
            document.execCommand(command, false, value);
          } else {
            document.execCommand(command);
          }
          handleInput();
        } catch (_fallbackError) {
          // フォールバックも失敗 - プロダクションではサイレント
        }
      }
    }
  }, [editorRef, handleInput]);

  const insertCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();

      if (selection && selection.toString()) {
        // 選択されたテキストをインラインコードで囲む
        const selectedText = selection.toString();
        const codeStyle = createInlineStyleString(EDITOR_STYLES.code);
        const codeHtml = `<code style="${codeStyle}">${selectedText}</code>`;
        insertHtmlAtCursor(codeHtml);
      } else {
        // 選択がない場合は空のインラインコードを挿入してカーソルを中に配置
        const codeStyle = createInlineStyleString(EDITOR_STYLES.code);
        const codeHtml = `<code style="${codeStyle}">コードを入力</code>`;
        insertHtmlAtCursor(codeHtml);
      }

      handleInput();
    }
  }, [editorRef, handleInput]);

  const insertCodeBlock = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();

      let initialCode = 'コードを入力してください...';
      if (selection && selection.toString()) {
        initialCode = selection.toString();
      }

      // コードブロックを挿入（GitHub風）
      const blockStyle = createInlineStyleString({
        ...EDITOR_STYLES.codeBlock,
        border: '1px solid #d0d7de !important'
      });
      const preStyle = createInlineStyleString({
        margin: '0 !important',
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        color: 'inherit',
        background: 'transparent',
        border: 'none',
        padding: '0'
      });
      const codeBlockHtml = `<div style="${blockStyle}"><pre style="${preStyle}" contenteditable="true" spellcheck="false">${initialCode}</pre></div>`;
      insertHtmlAtCursor(codeBlockHtml);

      handleInput();
    }
  }, [editorRef, handleInput]);

  return {
    executeCommand,
    insertCode,
    insertCodeBlock,
  };
};