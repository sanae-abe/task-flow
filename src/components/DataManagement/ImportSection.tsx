import { memo } from 'react';
import { Box, Text, Button, Flash, Spinner, RadioGroup, Radio, FormControl, Link } from '@primer/react';
import { UploadIcon, FileIcon, AlertIcon } from '@primer/octicons-react';

import { useDataImport } from '../../hooks/useDataImport';
import { useDataImportDropZone } from '../../hooks/useDataImportDropZone';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* インポートモード選択 */}
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

      {/* ドラッグ&ドロップエリア */}
      {!state.selectedFile && (
        <Box
          onDragOver={dropZoneProps.handleDragOver}
          onDragEnter={dropZoneProps.handleDragEnter}
          onDragLeave={dropZoneProps.handleDragLeave}
          onDrop={dropZoneProps.handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: dropZoneProps.isDragOver ? 'accent.emphasis' : 'border.default',
            borderRadius: 2,
            p: 5,
            textAlign: 'center',
            bg: dropZoneProps.isDragOver ? 'accent.subtle' : 'canvas.subtle',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'accent.emphasis',
              bg: 'accent.subtle'
            }
          }}
          onClick={dropZoneProps.handleFileSelect}
        >
          <UploadIcon size={32} />
          <Text sx={{ mt: 2, fontWeight: 'semibold', display: 'block' }}>
            JSONファイルをドラッグ&ドロップ
          </Text>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            または{' '}
            <Link
              sx={{ cursor: 'pointer' }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                dropZoneProps.handleFileSelect();
              }}
            >
              ファイルを選択
            </Link>
          </Text>
        </Box>
      )}

      {/* 選択されたファイル表示 */}
      {state.selectedFile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            bg: 'canvas.subtle',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'border.default'
          }}
        >
          <FileIcon size={24} />
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontWeight: 'semibold', display: 'block' }}>
              {state.selectedFile.name}
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
              {(state.selectedFile.size / 1024).toFixed(1)} KB
            </Text>
          </Box>
          <Button size="small" onClick={clearSelection} disabled={state.isLoading}>
            削除
          </Button>
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
  );
});

ImportSection.displayName = 'ImportSection';