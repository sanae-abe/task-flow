import { memo } from 'react';
import { Box } from '@primer/react';

import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';
import type { KanbanBoard } from '../../types';

/**
 * データ管理パネル - エクスポート/インポート機能を統合
 */
interface DataManagementPanelProps {
  /** 全データエクスポート時のコールバック */
  onExportAll?: () => void;
  /** ボード選択エクスポート時のコールバック */
  onExportCurrent?: (board?: KanbanBoard) => void;
  /** インポート成功時のコールバック */
  onImportSuccess?: () => void;
}

export const DataManagementPanel = memo<DataManagementPanelProps>(({
  onExportAll,
  onExportCurrent,
  onImportSuccess
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      pb: 3
    }}
  >
    {/* エクスポートセクション */}
    <ExportSection
      onExportAll={onExportAll}
      onExportCurrent={onExportCurrent}
    />

    {/* 区切り線 */}
    <Box
      sx={{
        height: '1px',
        bg: 'border.default'
      }}
    />

    {/* インポートセクション */}
    <ImportSection
      onImportSuccess={onImportSuccess}
    />
  </Box>
));

DataManagementPanel.displayName = 'DataManagementPanel';
