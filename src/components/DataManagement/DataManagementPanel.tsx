import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  onMessage?: (message: {
    type:
      | 'success'
      | 'critical'
      | 'warning'
      | 'danger'
      | 'default'
      | 'info'
      | 'upsell';
    text: string;
  }) => void;
}

export const DataManagementPanel = memo<DataManagementPanelProps>(
  ({ onExportAll, onExportCurrent, onMessage }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

    return (
      <div className='flex flex-col gap-3'>
        {/* ヘッダー */}
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>{t('settings.dataManagement')}</h2>
        </div>

        {/* タブナビゲーション */}
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'export' | 'import')}
        >
          <TabsList className='grid w-full grid-cols-2 mb-4'>
            <TabsTrigger value='export'>{t('export.export')}</TabsTrigger>
            <TabsTrigger value='import'>{t('export.import')}</TabsTrigger>
          </TabsList>

          <TabsContent value='export'>
            <ExportSection
              onExportAll={onExportAll}
              onExportCurrent={onExportCurrent}
              onMessage={onMessage}
            />
          </TabsContent>

          <TabsContent value='import'>
            <ImportSection onMessage={onMessage} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

DataManagementPanel.displayName = 'DataManagementPanel';
