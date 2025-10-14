import { memo, useState } from 'react';
import { UnderlineNav, Text } from '@primer/react';

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
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

export const DataManagementPanel = memo<DataManagementPanelProps>(({
  onExportAll,
  onExportCurrent,
  onImportSuccess,
  onMessage
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: "12px", paddingBottom: "16px" }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Text
          as="h2"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: 0
          }}
        >
          データ管理
        </Text>
      </div>
      {/* タブナビゲーション */}
      <UnderlineNav aria-label="データ管理" sx={{ px: 0, transform: 'translateY(-4px)' }}>
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
            onMessage={onMessage}
          />
        ) : (
          <ImportSection
            onImportSuccess={onImportSuccess}
            onMessage={onMessage}
          />
        )}
      </div>
    </div>
  );
});

DataManagementPanel.displayName = 'DataManagementPanel';
