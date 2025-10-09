import { memo, useCallback, useState } from 'react';
import { Box, Text, Button, Select, Flash, Spinner } from '@primer/react';
import { UploadIcon, FileIcon, AlertIcon } from '@primer/octicons-react';

import { useDataImport } from '../../hooks/useDataImport';
import { useDataImportDropZone } from '../../hooks/useDataImportDropZone';
import { CollapsibleSection } from './CollapsibleSection';

/**
 * データインポート機能を提供するセクション
 */
interface ImportSectionProps {
  /** インポート成功時のコールバック */
  onImportSuccess?: () => void;
}

export const ImportSection = memo<ImportSectionProps>(({ onImportSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    state,
    selectFile,
    setImportMode,
    clearSelection,
    executeImport,
    maxFileSize
  } = useDataImport({
    onSuccess: () => {
      // 成功後に少し待ってから選択をクリア
      setTimeout(() => {
        clearSelection();
        onImportSuccess?.();
      }, 1500);
    }
  });

  const dropZoneProps = useDataImportDropZone({
    maxFileSize,
    onFileSelected: selectFile,
    disabled: state.isLoading
  });

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <CollapsibleSection
      icon={UploadIcon}
      title="データのインポート"
      description="バックアップファイルからデータを復元"
      isExpanded={isExpanded}
      onToggle={handleToggleExpand}
      iconBg="attention.subtle"
      iconColor="attention.fg"
      expandedBg="attention.subtle"
      expandedBorderColor="attention.emphasis"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 警告メッセージ */}
        <Flash variant="warning">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <AlertIcon size={16} />
            <Box>
              <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                データのインポートには注意が必要です
              </Text>
              <Text sx={{ fontSize: 1 }}>
                {state.mode === 'replace' ? (
                  <Text sx={{ color: 'danger.fg', fontWeight: 'bold' }}>
                    「既存データを置換」モードでは、現在のすべてのデータが削除されます。
                  </Text>
                ) : (
                  '「既存データに追加」モードでは、現在のデータに新しいデータが追加されます。'
                )}
              </Text>
            </Box>
          </Box>
        </Flash>

        {/* インポートモード選択 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.default' }}>
            インポートモード
          </Text>
          <Select
            value={state.mode}
            onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
            disabled={state.isLoading}
            sx={{
              borderColor: state.mode === 'replace' ? 'danger.emphasis' : 'border.default',
              '&:focus': {
                borderColor: state.mode === 'replace' ? 'danger.emphasis' : 'accent.emphasis'
              }
            }}
          >
            <Select.Option value="merge">既存データに追加（推奨）</Select.Option>
            <Select.Option value="replace">既存データを置換（注意）</Select.Option>
          </Select>
          <Text sx={{ fontSize: 0, color: 'fg.muted', mt: 1 }}>
            {state.mode === 'merge'
              ? 'インポートしたデータを現在のデータに追加します。既存のデータは保持されます。'
              : '現在のすべてのデータを削除して、インポートしたデータに置き換えます。この操作は元に戻せません。'}
          </Text>
        </Box>

        {/* 選択されたファイル表示 */}
        {state.selectedFile && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 2,
              bg: 'canvas.subtle',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'border.default'
            }}
          >
            <Text sx={{ fontSize: 1, fontWeight: '600', color: 'fg.default' }}>
              選択されたファイル
            </Text>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FileIcon size={16} />
              <Box>
                <Text sx={{ fontSize: 1, color: 'fg.default', display: 'block' }}>
                  {state.selectedFile.name}
                </Text>
                <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                  サイズ: {(state.selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* ローディング表示 */}
        {state.isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Spinner size="small" />
            <Text sx={{ fontSize: 1 }}>処理中...</Text>
          </Box>
        )}

        {/* メッセージ表示 */}
        {state.message && (
          <Flash variant={state.message.type === 'error' ? 'danger' : 'success'}>
            {state.message.text}
          </Flash>
        )}

        {/* アクションボタン */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!state.selectedFile ? (
            <Button
              variant="default"
              onClick={dropZoneProps.handleFileSelect}
              disabled={state.isLoading}
              leadingVisual={FileIcon}
              sx={{ flex: 1, justifyContent: 'center' }}
            >
              JSONファイルを選択
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                onClick={clearSelection}
                disabled={state.isLoading}
                sx={{ flex: 1 }}
              >
                キャンセル
              </Button>
              <Button
                variant={state.mode === 'replace' ? 'danger' : 'primary'}
                onClick={executeImport}
                disabled={state.isLoading}
                leadingVisual={UploadIcon}
                sx={{
                  flex: 1,
                  justifyContent: 'center',
                  color: 'fg.onEmphasis !important'
                }}
              >
                {state.isLoading ? 'インポート中...' : 'インポート実行'}
              </Button>
            </>
          )}
        </Box>

        {/* 隠しファイル入力 */}
        <input
          ref={dropZoneProps.fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={dropZoneProps.handleFileInputChange}
          style={{ display: 'none' }}
          disabled={state.isLoading}
        />
      </Box>
    </CollapsibleSection>
  );
});

ImportSection.displayName = 'ImportSection';