import React from "react";
import { SparklesFillIcon, XIcon } from "@primer/octicons-react";
import { Box, Button } from "@primer/react";

interface FirstTimeUserHintProps {
  onDismiss: () => void;
}

const FirstTimeUserHint: React.FC<FirstTimeUserHintProps> = ({ onDismiss }) => (
  <Box
    sx={{
      position: "relative",
      maxWidth: "400px",
      bg: "canvas.overlay",
      border: "1px solid",
      borderColor: "border.default",
      borderRadius: "6px",
      boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
      p: 3,
      "&::before": {
        content: '""',
        position: "absolute",
        top: "-8px",
        right: "100px",
        width: 0,
        height: 0,
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid",
        borderBottomColor: "border.default",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: "-7px",
        right: "100px",
        width: 0,
        height: 0,
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid",
        borderBottomColor: "canvas.overlay",
      },
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <div style={{ color: "var(---fgColor-accent)" }}>
        <SparklesFillIcon size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "14px" }}>
          TaskFlowアプリへようこそ！
        </div>
        <div style={{ fontSize: "12px", color: "var(--fgColor-muted)", lineHeight: 1.4 }}>
          「ボード設定」メニューから新しいボードを作成して、プロジェクトごとにタスクを管理しましょう
        </div>
      </div>
      <Button
        variant="invisible"
        size="small"
        onClick={onDismiss}
        leadingVisual={XIcon}
        aria-label="ヒントを閉じる"
        sx={{
          color: "fg.muted",
          p: 1,
          minWidth: "auto",
          "&:hover": {
            color: "fg.default",
            bg: "actionListItem.default.hoverBg",
          },
        }}
      />
    </div>
  </Box>
);

export default FirstTimeUserHint;
