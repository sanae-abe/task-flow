import { useState, useCallback } from "react";

import { useKanban } from "../contexts/KanbanContext";
import { validateImportData, readFileAsText } from "../utils/dataExport";
import type {
  ImportMode,
  ImportState,
} from "../components/DataManagement/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UseDataImportOptions {
  /** インポート成功時のコールバック */
  onSuccess?: (importedCount: number) => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'danger' | 'warning'; text: string }) => void;
}

/**
 * データインポート機能を提供するカスタムフック
 */
export const useDataImport = (options?: UseDataImportOptions) => {
  const { importBoards } = useKanban();
  const [state, setState] = useState<ImportState>({
    isLoading: false,
    selectedFile: null,
    mode: "merge",
    message: null,
  });

  /**
   * ファイルを選択
   */
  const selectFile = useCallback((file: File) => {
    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `ファイルサイズが大きすぎます（最大: ${MAX_FILE_SIZE / 1024 / 1024}MB）`;
      setState((prev) => ({
        ...prev,
        message: {
          type: "error",
          text: errorMessage,
        },
      }));
      options?.onMessage?.({
        type: 'danger',
        text: errorMessage
      });
      return;
    }

    // ファイルタイプチェック
    if (!file.type.includes("json") && !file.name.endsWith(".json")) {
      const errorMessage = "JSONファイルを選択してください";
      setState((prev) => ({
        ...prev,
        message: {
          type: "error",
          text: errorMessage,
        },
      }));
      options?.onMessage?.({
        type: 'danger',
        text: errorMessage
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedFile: file,
      message: null,
    }));
  }, [options]);

  /**
   * インポートモードを変更
   */
  const setImportMode = useCallback((mode: ImportMode) => {
    setState((prev) => ({
      ...prev,
      mode,
    }));
  }, []);

  /**
   * メッセージをクリア
   */
  const clearMessage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      message: null,
    }));
  }, []);

  /**
   * 選択をクリア
   */
  const clearSelection = useCallback(() => {
    setState({
      isLoading: false,
      selectedFile: null,
      mode: "merge",
      message: null,
    });
  }, []);

  /**
   * インポートを実行
   */
  const executeImport = useCallback(async () => {
    if (!state.selectedFile) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      message: null,
    }));

    try {
      const fileContent = await readFileAsText(state.selectedFile);
      const parsedData = JSON.parse(fileContent);
      const validatedData = validateImportData(parsedData);

      const replaceAll = state.mode === "replace";
      importBoards(validatedData.boards, replaceAll);

      const importedCount = validatedData.boards.length;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        message: null,
      }));

      options?.onSuccess?.(importedCount);
    } catch (error) {
      let errorMessage = "インポートに失敗しました";
      if (error instanceof SyntaxError) {
        errorMessage = "JSONファイルの形式が正しくありません";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        message: {
          type: "error",
          text: errorMessage,
        },
      }));

      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }, [state.selectedFile, state.mode, importBoards, options]);

  return {
    state,
    selectFile,
    setImportMode,
    clearMessage,
    clearSelection,
    executeImport,
    maxFileSize: MAX_FILE_SIZE,
  };
};
