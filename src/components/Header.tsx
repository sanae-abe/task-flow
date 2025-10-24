import { PlusIcon, QuestionIcon, GearIcon } from "@primer/octicons-react";
import { Button } from "@/components/ui/button";
import React from "react";

import { useKanban } from "../contexts/KanbanContext";

import OfflineIndicator from "./OfflineIndicator";
import BoardSelector from "./BoardSelector";
import Logo from "./Logo";

// 定数定義
const HEADER_HEIGHT = "67px";
const MAX_CONTENT_WIDTH = "100%";
const DIVIDER_HEIGHT = "24px";

// スタイル定義オブジェクト
const headerStyles = {
  container: {
    padding: "0 24px",
    background: "var(--background)",
    borderBottom: "1px solid",
    borderColor: "var(--borderColor-default)",
    height: HEADER_HEIGHT,
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: MAX_CONTENT_WIDTH,
    marginInline: "auto",
    height: "100%",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
    minWidth: 0,
    paddingRight: "16px",
    width: "100%",
    height: "100%",
  },
  divider: {
    height: DIVIDER_HEIGHT,
    width: "1px",
    backgroundColor: "var(--color-gray-200)",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  createButton: {
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    border: "none",
    borderRadius: "var(--borderRadius-medium)",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "var(--button-outline-bgColor-active)",
    },
  },
};

// 区切り線コンポーネント
const VerticalDivider: React.FC = () => (
  <div
    style={headerStyles.divider}
    role="separator"
    aria-orientation="vertical"
  />
);

// 左側セクションコンポーネント
const LeftSection: React.FC = () => (
  <div style={headerStyles.leftSection}>
    <Logo size="large" />
    <VerticalDivider />
    <BoardSelector />
  </div>
);

// 右側セクションコンポーネント
interface RightSectionProps {
  onCreateClick: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

const RightSection: React.FC<RightSectionProps> = ({
  onCreateClick,
  onHelpClick,
  onSettingsClick,
}) => (
  <div style={headerStyles.rightSection}>
    <OfflineIndicator />
    <Button
      onClick={onCreateClick}
      variant="default"
      aria-label="タスク作成"
      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
    >
      <PlusIcon size={16} />
      タスク作成
    </Button>
    <Button
      onClick={onSettingsClick}
      variant="ghost"
      aria-label="設定を開く"
      className="ml-2 flex items-center gap-2"
    >
      <GearIcon size={16} />
      設定
    </Button>
    <Button
      onClick={onHelpClick}
      variant="ghost"
      aria-label="ヘルプを表示"
      className="flex items-center gap-2"
    >
      <QuestionIcon size={16} />
      ヘルプ
    </Button>
  </div>
);

interface HeaderProps {
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onSettingsClick }) => {
  const { openTaskForm } = useKanban();

  const handleStartCreateTask = () => {
    openTaskForm();
  };

  return (
    <header style={headerStyles.container} role="banner">
      <div style={headerStyles.content}>
        <LeftSection />
        <RightSection
          onCreateClick={handleStartCreateTask}
          onHelpClick={onHelpClick}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </header>
  );
};

export default Header;
