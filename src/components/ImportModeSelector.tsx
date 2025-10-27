import { Button } from "@/components/ui/button";
import { Upload, File, Package } from "lucide-react";
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
      return <Upload size={16} />;
    case "file-select":
      return <File size={16} />;
    case "both":
      return <Package size={16} />;
    default:
      // TypeScript exhaustiveness check - should never reach here
      mode satisfies never;
      return <Package size={16} />;
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
    <div className="flex flex-col gap-2">
      {showModeIndicator && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-border border-gray-200">
          {getModeIcon(selectedMode)}
          <div>
            <p className="font-semibold text-sm">現在のインポートモード</p>
            <p className="text-xs text-gray-600">{selectedConfig?.label}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="font-semibold text-sm">インポートモードを選択</p>
        <div className="flex flex-col gap-2">
          {IMPORT_MODES.map((modeConfig) => (
            <Button
              key={modeConfig.mode}
              variant={selectedMode === modeConfig.mode ? "default" : "outline"}
              onClick={() => onModeChange(modeConfig.mode)}
              aria-label={`インポートモードを${modeConfig.label}に変更`}
              className="w-full justify-start text-left p-3 flex flex-col items-start gap-1 h-auto"
            >
              <span className="flex items-center gap-2 w-full">
                {getModeIcon(modeConfig.mode)}
                <span className="flex flex-col items-start">
                  <span className="font-bold text-sm">{modeConfig.label}</span>
                  <span className="text-xs text-gray-600">
                    {modeConfig.description}
                  </span>
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
