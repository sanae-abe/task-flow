import { memo } from 'react';
import { Box, Text, Button, Flash, Spinner, RadioGroup, Radio, FormControl } from '@primer/react';
import { UploadIcon, FileIcon, XIcon, AlertIcon } from '@primer/octicons-react';

import { useDataImport } from '../../hooks/useDataImport';
import { useDataImportDropZone } from '../../hooks/useDataImportDropZone';
import UniversalDropZone from '../UniversalDropZone';
import ErrorMessage from '../ErrorMessage';

/**
 * データインポート機能を提供するセクション
 */
interface ImportSectionProps {
  /** インポート成功時のコールバック */
  onImportSuccess?: () => void;
}

export const ImportSection = memo<ImportSectionProps>(({ onImportSuccess }) => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* インポートモード選択 - 元のRadioGroup維持 */}
      <FormControl>
        <FormControl.Label sx={{ fontSize: 1, fontWeight: '600' }}>
          インポートモード
        </FormControl.Label>
        <RadioGroup
          name="importMode"
          onChange={(value) => setImportMode(value as 'merge' | 'replace')}
          sx={{ mt: 1 }}
        >
          <FormControl>
            <Radio checked={state.mode === 'merge'} value="merge" />
            <FormControl.Label>既存データに追加（推奨）</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio checked={state.mode === 'replace'} value="replace" />
            <FormControl.Label>既存データを置換</FormControl.Label>
          </FormControl>
        </RadioGroup>
      </FormControl>

      {/* 警告メッセージ - 置換モード時のみ表示 */}
      {state.mode === 'replace' && (
        <Flash variant="warning">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <AlertIcon size={16} />
            <Box>
              <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                危険: データの置換操作
              </Text>
              <Text sx={{ fontSize: 1, color: 'danger.fg', fontWeight: 'bold' }}>
                現在のすべてのデータが削除されます。この操作は元に戻せません。
              </Text>
            </Box>
          </Box>
        </Flash>
      )}

      {/* ドラッグ&ドロップエリア - UniversalDropZone使用 */}
      {!state.selectedFile && (
        <UniversalDropZone
          isDragOver={dropZoneProps.isDragOver}
          isLoading={state.isLoading}
          maxFileSize={maxFileSize}
          allowedTypes={['.json', 'application/json']}
          multiple={false}
          onDragOver={dropZoneProps.handleDragOver}
          onDragEnter={dropZoneProps.handleDragEnter}
          onDragLeave={dropZoneProps.handleDragLeave}
          onDrop={dropZoneProps.handleDrop}
          onClick={dropZoneProps.handleFileSelect}
          fileInputRef={dropZoneProps.fileInputRef}
          onFileInputChange={dropZoneProps.handleFileInputChange}
          importMode="both"
          title="JSONファイルをドラッグ&ドロップ"
          subtitle="または クリックしてファイルを選択"
          ariaLabel="JSONファイルを選択してデータをインポート"
        />
      )}

      {/* 選択されたファイル表示 - AttachmentList風スタイル */}
      {state.selectedFile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text sx={{ fontSize: 1, fontWeight: "700" }}>
            選択されたファイル
          </Text>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bg: 'canvas.subtle',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'border.default'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: 1,
                minWidth: 0,
              }}
            >
              <FileIcon size={24} />
              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Text
                  sx={{
                    fontSize: 1,
                    fontWeight: '600',
                    wordBreak: 'break-word',
                    lineHeight: 1.2,
                  }}
                >
                  {state.selectedFile.name}
                </Text>
                <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                  {(state.selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
            </Box>
            <Button
              variant="invisible"
              size="small"
              onClick={clearSelection}
              disabled={state.isLoading}
              sx={{
                p: 1,
                color: 'danger.fg',
                '&:hover': {
                  color: 'danger.emphasis',
                },
              }}
              aria-label="ファイルを削除"
            >
              <XIcon size={16} />
            </Button>
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

      {/* エラー表示 - ErrorMessage使用 */}
      <ErrorMessage error={state.message?.type  === 'error' ? state.message.text : null} />

      {/* 成功メッセージ */}
      {state.message?.type === 'success' && (
      <FormControl.Validation variant="success">{state.message.text}</FormControl.Validation>
      )}

      {/* インポート実行ボタン */}
      {state.selectedFile && (
        <Button
          variant={state.mode === 'replace' ? 'danger' : 'primary'}
          onClick={executeImport}
          disabled={state.isLoading}
          leadingVisual={UploadIcon}
          sx={{ alignSelf: 'flex-start' }}
        >
          {state.isLoading ? 'インポート中...' : 'インポート実行'}
        </Button>
      )}
    </Box>
  );
});

ImportSection.displayName = 'ImportSection';