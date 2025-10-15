import { memo } from 'react';
import { Text, Button, Spinner, RadioGroup, Radio, FormControl, Flash } from '@primer/react';
import { UploadIcon, FileIcon, XIcon, AlertIcon } from '@primer/octicons-react';

import { useDataImport } from '../../hooks/useDataImport';
import { useDataImportDropZone } from '../../hooks/useDataImportDropZone';
import UniversalDropZone from '../UniversalDropZone';

/**
 * データインポート機能を提供するセクション
 */
interface ImportSectionProps {
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

export const ImportSection = memo<ImportSectionProps>(({ onMessage }) => {
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
      }, 1500);
    },
    onError: () => {
      // エラー処理は useDataImport 内で統一して実行
    },
    onMessage
  });

  const dropZoneProps = useDataImportDropZone({
    maxFileSize,
    onFileSelected: selectFile,
    disabled: state.isLoading
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "12px", width: '100%' }}>
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
        <Flash  variant="warning">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div><AlertIcon size={16} /></div>
            <div>
              <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>危険: データの置換操作</Text>
              <Text sx={{ display: 'block' }}>
                現在のすべてのデータが削除されます。この操作は元に戻せません。
              </Text>
            </div>
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: "8px" }}>
          <Text sx={{ fontSize: 1, fontWeight: "700" }}>
            選択されたファイル
          </Text>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: 'var(--bgColor-muted)',
              borderRadius: 'var(--borderRadius-medium)',
              border: '1px solid',
              borderColor: 'var(--borderColor-default)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: "8px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <FileIcon size={24} />
              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: "4px",
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
              </div>
            </div>
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
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {state.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: "8px" }}>
          <Spinner size="small" />
          <Text sx={{ fontSize: 1 }}>処理中...</Text>
        </div>
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

    </div>
  );
});

ImportSection.displayName = 'ImportSection';