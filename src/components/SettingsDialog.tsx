import { DatabaseIcon, TagIcon, ProjectIcon } from "@primer/octicons-react";
import { SplitPageLayout, NavList } from "@primer/react";
import React, { useState } from "react";
import { FileText } from "react-feather";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import { LabelManagementPanel } from "./LabelManagement";
import { DataManagementPanel } from "./DataManagement";
import { BoardSettingsPanel } from "./BoardSettings";
import { TemplateManagementPanel } from "./TemplateManagement";
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
    "labels" | "data" | "board" | "templates"
  >("labels");

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
                  <ProjectIcon />
                </NavList.LeadingVisual>
                カラム設定
              </NavList.Item>
              <NavList.Item
                aria-current={activeTab === "templates" ? "page" : undefined}
                onClick={() => setActiveTab("templates")}
              >
                <NavList.LeadingVisual>
                  <FileText size={16} />
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
            <div style={{ height: "100%", overflow: "auto" }}>
              {activeTab === "board" ? (
                <BoardSettingsPanel />
              ) : activeTab === "templates" ? (
                <TemplateManagementPanel />
              ) : activeTab === "labels" ? (
                <LabelManagementPanel />
              ) : (
                <DataManagementPanel
                  onExportAll={onExportData}
                  onExportCurrent={onExportBoard}
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
