import { useState, useCallback, memo } from 'react';
import { Box, Button, Text, Spinner, Flash, Select } from '@primer/react';
import { FileIcon } from '@primer/octicons-react';

import { useKanban } from '../contexts/KanbanContext';
import { validateImportData, readFileAsText } from '../utils/dataExport';
import { useDataImportDropZone } from '../hooks/useDataImportDropZone';

import CommonDialog from './CommonDialog';

/**
 * データインポート用のダイアログコンポーネント
 * JSONファイルからカンバンボードデータをインポートする機能を提供
 */
interface DataImportDialogProps {
  /** ダイアログの表示状態 */
  isOpen: boolean;
  /** ダイアログを閉じる際のコールバック */
  onClose: () => void;
}

type ImportMode = 'merge' | 'replace';
type MessageType = { type: 'success' | 'error'; text: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DataImportDialog = memo<DataImportDialogProps>(({ isOpen, onClose }) => {
  const { importBoards } = useKanban();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');

  const dropZoneProps = useDataImportDropZone({
    maxFileSize: MAX_FILE_SIZE,
    onFileProcessed: useCallback(async (file: File) => {
      setIsLoading(true);
      setMessage(null);

      try {
        const fileContent = await readFileAsText(file);
        const parsedData = JSON.parse(fileContent);
        const validatedData = validateImportData(parsedData);

        const replaceAll = importMode === 'replace';
        importBoards(validatedData.boards, replaceAll);

        const importedCount = validatedData.boards.length;
        const modeText = replaceAll ? '置換' : '追加';
        setMessage({ 
          type: 'success', 
          text: `${importedCount}個のボードを${modeText}しました` 
        });

        // 成功後に少し待ってからダイアログを閉じる
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);

      } catch (error) {
        let errorMessage = 'インポートに失敗しました';
        if (error instanceof SyntaxError) {
          errorMessage = 'JSONファイルの形式が正しくありません';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }, [importMode, importBoards, onClose]),
    disabled: isLoading
  });

  const handleDialogClose = useCallback(() => {
    if (!isLoading) {
      onClose();
      setMessage(null);
    }
  }, [isLoading, onClose]);

  const handleModeChange = useCallback((mode: ImportMode) => {
    setImportMode(mode);
  }, []);

  return (
    <CommonDialog
      isOpen={isOpen}
      title="データインポート"
      onClose={handleDialogClose}
      ariaLabelledBy="import-dialog-title"
      actions={
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* メッセージ表示 */}
          {message && (
            <Flash variant={message.type === 'error' ? 'danger' : 'success'}>
              {message.text}
            </Flash>
          )}
          
          {/* アクションボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleDialogClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={dropZoneProps.handleFileSelect}
              disabled={isLoading}
              leadingVisual={FileIcon}
              sx={{ color: 'fg.onEmphasis !important' }}
            >
              {isLoading ? 'インポート中...' : 'JSONファイルを選択'}
            </Button>
          </Box>
        </Box>
      }
    >
      {/* インポートモード選択 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.muted' }}>インポートモード</Text>
        <Select
          value={importMode}
          onChange={(e) => handleModeChange(e.target.value as ImportMode)}
          disabled={isLoading}
        >
          <Select.Option value="merge">既存データに追加</Select.Option>
          <Select.Option value="replace">既存データを置換</Select.Option>
        </Select>
      </Box>

      {/* ローディング表示 */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Spinner size="small" />
          <Text sx={{ fontSize: 1 }}>処理中...</Text>
        </Box>
      )}
      
      {/* 隠しファイル入力 */}
      <input
        ref={dropZoneProps.fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={dropZoneProps.handleFileInputChange}
        style={{ display: 'none' }}
        disabled={isLoading}
      />
    </CommonDialog>
  );
});

DataImportDialog.displayName = 'DataImportDialog';