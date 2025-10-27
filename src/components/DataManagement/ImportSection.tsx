import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, File, X } from 'lucide-react';

import { useDataImport } from '../../hooks/useDataImport';
import { useDataImportDropZone } from '../../hooks/useDataImportDropZone';
import UniversalDropZone from '../UniversalDropZone';
import DialogFlashMessage from '../shared/DialogFlashMessage';

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
    <div className="flex flex-col gap-3 w-full">
      {/* インポートモード選択 */}
      <div>
        <label className="text-sm font-semibold">
          インポートモード
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="merge"
              name="importMode"
              value="merge"
              checked={state.mode === 'merge'}
              onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="merge" className="text-sm text-gray-900">
              既存データに追加（推奨）
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="replace"
              name="importMode"
              value="replace"
              checked={state.mode === 'replace'}
              onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="replace" className="text-sm text-gray-900">
              既存データを置換
            </label>
          </div>
        </div>
      </div>

      {/* 警告メッセージ - 置換モード時のみ表示 */}
      {state.mode === 'replace' && (
        <DialogFlashMessage message={{
          type: 'warning',
          title: '危険: データの置換操作',
          text: `現在のすべてのデータが削除されます。この操作は元に戻せません。`,
        }}
          isStatic
        />
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
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">
            選択されたファイル
          </p>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-border border-gray-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <File size={24} />
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <p className="text-sm font-semibold break-words leading-tight">
                  {state.selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {(state.selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={state.isLoading}
              className="p-1 h-auto min-w-0 text-red-600 hover:text-red-700"
              aria-label="ファイルを削除"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {state.isLoading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">処理中...</p>
        </div>
      )}

      {/* インポート実行ボタン */}
      {state.selectedFile && (
        <Button
          variant={state.mode === 'replace' ? 'destructive' : 'default'}
          onClick={executeImport}
          disabled={state.isLoading}
          className="self-start"
        >
          <Upload size={16} className="mr-2" />
          {state.isLoading ? 'インポート中...' : 'インポート実行'}
        </Button>
      )}

    </div>
  );
});

ImportSection.displayName = 'ImportSection';