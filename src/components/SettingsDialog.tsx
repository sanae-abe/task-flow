import {
  DatabaseIcon,
  TagIcon,
  ColumnsIcon,
  TrashIcon,
  TasklistIcon
} from "@primer/octicons-react";
import { SplitPageLayout, NavList } from "@primer/react";
import React, { useState } from "react";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import { DialogFlashMessage, useDialogFlashMessage } from "./shared";
import { LabelManagementPanel } from "./LabelManagement";
import { DataManagementPanel } from "./DataManagement";
import { BoardSettingsPanel } from "./BoardSettings";
import { TemplateManagementPanel } from "./TemplateManagement";
import { RecycleBinSettingsPanel } from "./RecycleBin/RecycleBinSettingsPanel";
import UnifiedRecycleBinView from "./RecycleBin/UnifiedRecycleBinView";
import type { KanbanBoard } from "../types";

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
  const [activeTab, setActiveTab] = useState<
    "labels" | "data" | "board" | "templates" | "recycleBin"
  >("labels");

  // DialogFlashMessageフック使用
  const { message, handleMessage, clearMessage } = useDialogFlashMessage();

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title="設定"
      variant="modal"
      size="xl"
    >
      <div style={{ height: "500px" }}>
        <SplitPageLayout>
          {/* サイドバー（ナビゲーション） */}
          <SplitPageLayout.Pane
            position="start"
            width={{ min: "150px", max: "200px", default: "200px" }}
            padding="none"
            divider="none"
            sx={{ pr: "16px" }}
          >
            <NavList>
              <NavList.Item
                aria-current={activeTab === "board" ? "page" : undefined}
                onClick={() => setActiveTab("board")}
              >
                <NavList.LeadingVisual>
                  <ColumnsIcon />
                </NavList.LeadingVisual>
                カラム設定
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === "templates" ? "page" : undefined}
                onClick={() => setActiveTab("templates")}
              >
                <NavList.LeadingVisual>
                  <TasklistIcon size={16} />
                </NavList.LeadingVisual>
                テンプレート管理
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === "labels" ? "page" : undefined}
                onClick={() => setActiveTab("labels")}
              >
                <NavList.LeadingVisual>
                  <TagIcon />
                </NavList.LeadingVisual>
                ラベル管理
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === "recycleBin" ? "page" : undefined}
                onClick={() => setActiveTab("recycleBin")}
              >
                <NavList.LeadingVisual>
                  <TrashIcon />
                </NavList.LeadingVisual>
                ゴミ箱管理
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === "data" ? "page" : undefined}
                onClick={() => setActiveTab("data")}
              >
                <NavList.LeadingVisual>
                  <DatabaseIcon />
                </NavList.LeadingVisual>
                データ管理
              </NavList.Item>
            </NavList>
          </SplitPageLayout.Pane>

          {/* メインコンテンツエリア */}
          <SplitPageLayout.Content padding="none" sx={{ py: "8px", pr: "8px" }}>
            <div style={{ position: "relative", display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* メッセージ表示（全タブ共通） */}
              <DialogFlashMessage message={message} onDismiss={clearMessage} />

              {activeTab === "board" ? (
                <BoardSettingsPanel />
              ) : activeTab === "templates" ? (
                <TemplateManagementPanel onMessage={handleMessage} />
              ) : activeTab === "labels" ? (
                <LabelManagementPanel onMessage={handleMessage} />
              ) : activeTab === "recycleBin" ? (
                <div>
                  <RecycleBinSettingsPanel />

                  {/* 統合ゴミ箱セクション */}
                  <div
                    style={{
                      marginTop: "24px",
                      borderTop: "1px solid var(--borderColor-muted)",
                      paddingTop: "24px",
                    }}
                  >
                    <UnifiedRecycleBinView onMessage={handleMessage} />
                  </div>
                </div>
              ) : (
                <DataManagementPanel
                  onExportAll={onExportData}
                  onExportCurrent={onExportBoard}
                  onMessage={handleMessage}
                />
              )}
            </div>
          </SplitPageLayout.Content>
        </SplitPageLayout>
      </div>
    </UnifiedDialog>
  );
};

export default SettingsDialog;
