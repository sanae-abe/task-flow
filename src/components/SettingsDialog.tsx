import { DatabaseIcon, TagIcon } from '@primer/octicons-react';
import { Box, SplitPageLayout, NavList } from '@primer/react';
import React, { useState } from 'react';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import { LabelManagementPanel } from './LabelManagement';
import { DataManagementPanel } from './DataManagement';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
  onExportBoard?: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onExportData,
  onExportBoard
}) => {
  const [activeTab, setActiveTab] = useState<'labels' | 'data'>('labels');

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title="設定"
      variant="modal"
      size="xl"
    >
      <Box sx={{ height: '500px' }}>
        <SplitPageLayout>
          {/* サイドバー（ナビゲーション） */}
          <SplitPageLayout.Pane
            position="start"
            width={{ min: '150px', max: '150px', default: '150px' }}
            padding="none"
            divider="none"
            sx={{ height: '100%' }}
          >
            <NavList>
              <NavList.Item
                aria-current={activeTab === 'labels' ? 'page' : undefined}
                onClick={() => setActiveTab('labels')}
              >
                <NavList.LeadingVisual>
                  <TagIcon />
                </NavList.LeadingVisual>
                ラベル管理
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === 'data' ? 'page' : undefined}
                onClick={() => setActiveTab('data')}
              >
                <NavList.LeadingVisual>
                  <DatabaseIcon />
                </NavList.LeadingVisual>
                データ管理
              </NavList.Item>
            </NavList>
          </SplitPageLayout.Pane>

          {/* メインコンテンツエリア */}
          <SplitPageLayout.Content>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              {activeTab === 'labels' ? (
                <LabelManagementPanel />
              ) : (
                <DataManagementPanel
                  onExportAll={onExportData}
                  onExportCurrent={onExportBoard}
                />
              )}
            </Box>
          </SplitPageLayout.Content>
        </SplitPageLayout>
      </Box>
    </UnifiedDialog>
  );
};

export default SettingsDialog;