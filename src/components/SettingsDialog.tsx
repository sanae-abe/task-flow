import { Database, Tag, Columns, Trash2, ListTodo, Info } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import { DialogFlashMessage, useDialogFlashMessage } from './shared';
import { LabelManagementPanel } from './LabelManagement';
import { DataManagementPanel } from './DataManagement';
import { BoardSettingsPanel } from './BoardSettings';
import { TemplateManagementPanel } from './TemplateManagement';
import { RecycleBinSettingsPanel } from './RecycleBin/RecycleBinSettingsPanel';
import UnifiedRecycleBinView from './RecycleBin/UnifiedRecycleBinView';
import { AboutPanel } from './About';
import type { KanbanBoard } from '../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
  onExportBoard?: (board?: KanbanBoard) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onExportData,
  onExportBoard,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'labels' | 'data' | 'board' | 'templates' | 'recycleBin' | 'about'
  >('labels');

  // DialogFlashMessageフック使用
  const { message, handleMessage, clearMessage } = useDialogFlashMessage();

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.settings')}
      variant='modal'
      size='xl'
    >
      <div className='h-[500px] flex'>
        {/* サイドバー（ナビゲーション） */}
        <div className='w-48 min-w-[150px] max-w-[200px] pr-4 border-r border-border'>
          <nav className='flex flex-col space-y-1'>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'board'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('board')}
              aria-current={activeTab === 'board' ? 'page' : undefined}
            >
              <Columns size={16} />
              {t('settings.board')}
            </button>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'templates'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('templates')}
              aria-current={activeTab === 'templates' ? 'page' : undefined}
            >
              <ListTodo size={16} />
              {t('template.template')}
            </button>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'labels'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('labels')}
              aria-current={activeTab === 'labels' ? 'page' : undefined}
            >
              <Tag size={16} />
              {t('settings.labels')}
            </button>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'recycleBin'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('recycleBin')}
              aria-current={activeTab === 'recycleBin' ? 'page' : undefined}
            >
              <Trash2 size={16} />
              {t('settings.recycleBin')}
            </button>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'data'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('data')}
              aria-current={activeTab === 'data' ? 'page' : undefined}
            >
              <Database size={16} />
              {t('settings.dataManagement')}
            </button>
            <button
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                activeTab === 'about'
                  ? 'bg-accent text-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => setActiveTab('about')}
              aria-current={activeTab === 'about' ? 'page' : undefined}
            >
              <Info size={16} />
              About
            </button>
          </nav>
        </div>

        {/* メインコンテンツエリア */}
        <div className='flex-1 py-2 pl-4 overflow-auto'>
          <div className='relative flex flex-col gap-3'>
            {/* メッセージ表示（全タブ共通） */}
            <DialogFlashMessage message={message} onDismiss={clearMessage} />

            {activeTab === 'board' ? (
              <BoardSettingsPanel />
            ) : activeTab === 'templates' ? (
              <TemplateManagementPanel onMessage={handleMessage} />
            ) : activeTab === 'labels' ? (
              <LabelManagementPanel onMessage={handleMessage} />
            ) : activeTab === 'recycleBin' ? (
              <div>
                <RecycleBinSettingsPanel />

                {/* 統合ゴミ箱セクション */}
                <div className='mt-6 pt-6 border-t border-border'>
                  <UnifiedRecycleBinView onMessage={handleMessage} />
                </div>
              </div>
            ) : activeTab === 'about' ? (
              <AboutPanel />
            ) : (
              <DataManagementPanel
                onExportAll={onExportData}
                onExportCurrent={onExportBoard}
                onMessage={handleMessage}
              />
            )}
          </div>
        </div>
      </div>
    </UnifiedDialog>
  );
};

export default SettingsDialog;
