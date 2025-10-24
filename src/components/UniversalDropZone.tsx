import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";

import type { ImportMode } from "../types";

interface UniversalDropZoneProps {
  isDragOver: boolean;
  isLoading?: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  multiple?: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importMode?: ImportMode;

  // カスタマイズ可能なプロパティ
  title?: string;
  dragTitle?: string;
  subtitle?: string;
  buttonText?: string;
  loadingText?: string;
  showButton?: boolean;
  minHeight?: string;
  ariaLabel?: string;
}

const UniversalDropZone: React.FC<UniversalDropZoneProps> = ({
  isDragOver,
  isLoading = false,
  maxFileSize,
  allowedTypes,
  multiple = true,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileInputChange,
  importMode = "both",

  // カスタマイズ可能なプロパティ
  title,
  dragTitle,
  subtitle,
  buttonText,
  loadingText,
  showButton = false,
  minHeight = "120px",
  ariaLabel,
}) => {
  const getDefaultTitle = () => {
    const fileTypeText = multiple ? "ファイル" : "ファイル";
    switch (importMode) {
      case "drag-drop":
        return `${fileTypeText}をここにドラッグ＆ドロップ`;
      case "file-select":
        return `クリックして${fileTypeText}を選択`;
      case "both":
        return `${fileTypeText}をここにドラッグ＆ドロップするか、クリックして選択`;
      default:
        return `${fileTypeText}をここにドラッグ＆ドロップするか、クリックして選択`;
    }
  };

  const getDisplayTitle = () => {
    if (isDragOver && dragTitle) {
      return dragTitle;
    }
    if (title) {
      return title;
    }
    return getDefaultTitle();
  };

  const getDefaultSubtitle = () => {
    const sizeText = `最大${Math.round(maxFileSize / 1024 / 1024)}MB`;
    if (allowedTypes.length > 0 && !allowedTypes.includes("*/*")) {
      const extensions = allowedTypes
        .map((type) =>
          type.startsWith(".") ? type : (type.split("/")[1] ?? type),
        )
        .join(", ");
      return `${sizeText} (${extensions})`;
    }
    return sizeText;
  };

  const shouldShowDropZone =
    importMode === "drag-drop" || importMode === "both";
  const shouldAllowClick =
    importMode === "file-select" || importMode === "both";

  const getAriaLabel = () => {
    if (ariaLabel) {
      return ariaLabel;
    }
    if (
      allowedTypes.includes("application/json") ||
      allowedTypes.includes(".json")
    ) {
      return "JSONファイルを選択";
    }
    return multiple ? "ファイルを選択" : "ファイルを選択";
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 text-center transition-all duration-200 rounded-md",
        shouldShowDropZone ? "border-2 border-dashed" : "border-2 border-solid",
        isLoading && "opacity-70 cursor-not-allowed",
        isDragOver && "border-blue-600 bg-blue-50",
        !isDragOver && !isLoading && "border-gray-300 bg-gray-50",
        isLoading && "border-gray-200 bg-gray-100",
        shouldAllowClick && !isLoading && "cursor-pointer"
      )}
      style={{ minHeight }}
      onDragOver={!isLoading && shouldShowDropZone ? onDragOver : undefined}
      onDragEnter={!isLoading && shouldShowDropZone ? onDragEnter : undefined}
      onDragLeave={!isLoading && shouldShowDropZone ? onDragLeave : undefined}
      onDrop={!isLoading && shouldShowDropZone ? onDrop : undefined}
      onClick={!isLoading && shouldAllowClick ? onClick : undefined}
      role="button"
      tabIndex={isLoading ? -1 : 0}
      aria-label={getAriaLabel()}
    >
      <div className={cn(isDragOver ? "text-blue-600" : "text-gray-500")}>
        <Upload size={24} />
      </div>
      <p
        className={cn(
          "block font-normal tracking-tight",
          isDragOver ? "text-blue-600" : "text-gray-900"
        )}
      >
        {getDisplayTitle()}
      </p>
      <p className="text-xs text-gray-600">
        {subtitle ?? getDefaultSubtitle()}
      </p>
      {showButton && !isDragOver && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={isLoading}
          size="sm"
          variant="default"
        >
          {isLoading
            ? (loadingText ?? "アップロード中...")
            : (buttonText ?? "ファイルを選択")}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(",")}
        onChange={onFileInputChange}
        style={{ display: "none" }}
        disabled={isLoading}
        aria-hidden="true"
      />
    </div>
  );
};

export default UniversalDropZone;
