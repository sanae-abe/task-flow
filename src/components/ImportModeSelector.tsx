import { Text, Button } from "@primer/react";
import { UploadIcon, FileIcon, PackageIcon } from "@primer/octicons-react";
import React, { useMemo } from "react";

import type { ImportMode, ImportModeConfig } from "../types";

interface ImportModeSelectorProps {
  selectedMode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  showModeIndicator?: boolean;
}

const IMPORT_MODES: ImportModeConfig[] = [
  {
    mode: "drag-drop",
    label: "ドラッグ&ドロップ",
    description: "ファイルをドラッグしてアップロード",
  },
  {
    mode: "file-select",
    label: "ファイル選択",
    description: "ボタンからファイルを選択",
  },
  {
    mode: "both",
    label: "両方",
    description: "ドラッグ&ドロップとファイル選択の両方",
  },
];

const getModeIcon = (mode: ImportMode): React.ReactElement => {
  switch (mode) {
    case "drag-drop":
      return <UploadIcon size={16} />;
    case "file-select":
      return <FileIcon size={16} />;
    case "both":
      return <PackageIcon size={16} />;
    default:
      // TypeScript exhaustiveness check - should never reach here
      mode satisfies never;
      return <PackageIcon size={16} />;
  }
};

const ImportModeSelector: React.FC<ImportModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  showModeIndicator = true,
}) => {
  const selectedConfig = useMemo(
    () => IMPORT_MODES.find((m) => m.mode === selectedMode),
    [selectedMode],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {showModeIndicator && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            backgroundColor: "var(--bgColor-muted)",
            borderRadius: "var(--borderRadius-medium)",
            border: "1px solid",
            borderColor: "var(--borderColor-default)",
          }}
        >
          {getModeIcon(selectedMode)}
          <div>
            <Text sx={{ fontWeight: "600", fontSize: 1 }}>
              現在のインポートモード
            </Text>
            <Text sx={{ fontSize: 0, color: "fg.muted" }}>
              {selectedConfig?.label}
            </Text>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Text sx={{ fontWeight: "600", fontSize: 1 }}>
          インポートモードを選択
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {IMPORT_MODES.map((modeConfig) => (
            <Button
              key={modeConfig.mode}
              variant={selectedMode === modeConfig.mode ? "primary" : "default"}
              leadingVisual={getModeIcon(modeConfig.mode)}
              onClick={() => onModeChange(modeConfig.mode)}
              aria-label={`インポートモードを${modeConfig.label}に変更`}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                textAlign: "left",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Text sx={{ fontWeight: "bold", fontSize: 1 }}>
                    {modeConfig.label}
                  </Text>
                  <Text sx={{ fontSize: 0, color: "fg.muted" }}>
                    {modeConfig.description}
                  </Text>
                </span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportModeSelector;
