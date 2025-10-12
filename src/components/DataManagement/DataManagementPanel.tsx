import { memo, useState } from 'react';
import { Box, UnderlineNav } from '@primer/react';

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
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* タブナビゲーション */}
      <UnderlineNav aria-label="データ管理" sx={{ px: 0, transform: 'translateY(-8px)' }}>
        <UnderlineNav.Item
          aria-current={activeTab === 'export' ? 'page' : undefined}
          onSelect={() => setActiveTab('export')}
        >
          エクスポート
        </UnderlineNav.Item>
        <UnderlineNav.Item
          aria-current={activeTab === 'import' ? 'page' : undefined}
          onSelect={() => setActiveTab('import')}
        >
          インポート
        </UnderlineNav.Item>
      </UnderlineNav>

      {/* タブコンテンツ */}
      <div>
        {activeTab === 'export' ? (
          <ExportSection
            onExportAll={onExportAll}
            onExportCurrent={onExportCurrent}
          />
        ) : (
          <ImportSection
            onImportSuccess={onImportSuccess}
          />
        )}
      </div>
    </Box>
  );
});

DataManagementPanel.displayName = 'DataManagementPanel';
