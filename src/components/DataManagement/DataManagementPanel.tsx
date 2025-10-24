import { memo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
  /** メッセージ表示時のコールバック */
  onMessage?: (message: { type: 'success' | 'critical' | 'warning' | 'danger' | 'default' | 'info' | 'upsell'; text: string }) => void;
}

export const DataManagementPanel = memo<DataManagementPanelProps>(({
  onExportAll,
  onExportCurrent,
  onMessage
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold m-0">
          データ管理
        </h2>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'export' | 'import')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">エクスポート</TabsTrigger>
          <TabsTrigger value="import">インポート</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <ExportSection
            onExportAll={onExportAll}
            onExportCurrent={onExportCurrent}
            onMessage={onMessage}
          />
        </TabsContent>

        <TabsContent value="import">
          <ImportSection
            onMessage={onMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

DataManagementPanel.displayName = 'DataManagementPanel';