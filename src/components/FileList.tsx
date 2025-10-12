import { FileIcon, ImageIcon, DownloadIcon } from "@primer/octicons-react";
import { Text, Button } from "@primer/react";
import React, { useMemo, useCallback } from "react";

import type { FileAttachment } from "../types";
import { useNotify } from "../contexts/NotificationContext";

import FilePreview from "./FilePreview";

interface FileListProps {
  attachments: FileAttachment[] | null | undefined;
  showDownload?: boolean;
  showPreview?: boolean;
  maxFiles?: number;
}

// ユーティリティ関数
const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 Bytes";
  }
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"] as const;
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );
  const formattedSize = (bytes / Math.pow(k, i))
    .toFixed(2)
    .replace(/\.?0+$/, "");

  return `${formattedSize} ${sizes[i]}`;
};

const getFileIcon = (type: string) => {
  const iconProps = { size: 14 } as const;
  return type.startsWith("image/") ? (
    <ImageIcon {...iconProps} />
  ) : (
    <FileIcon {...iconProps} />
  );
};

const downloadFile = (
  attachment: FileAttachment,
  notify: ReturnType<typeof useNotify>,
): void => {
  try {
    if (!attachment?.type || !attachment?.data || !attachment?.name) {
      throw new Error("ファイル情報が不完全です");
    }

    const { type, data, name } = attachment;
    const dataUrl = `data:${type};base64,${data}`;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify.success(`「${name}」をダウンロードしました`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("ファイルのダウンロードに失敗しました:", error);
    notify.error("ファイルのダウンロードに失敗しました");
  }
};

// スタイル定数
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px",
    backgroundColor: "var(--bgColor-muted)",
    borderRadius: "var(--borderRadius-medium)",
    fontSize: "12px",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  fileDetails: {
    minWidth: 0,
    flex: 1,
    gap: "8px",
    display: "flex",
    alignItems: "center",
  },
  fileName: {
    fontSize: 0,
    fontWeight: "600",
    wordBreak: "break-word",
  },
  fileSize: {
    fontSize: "10px",
    color: "var(--fgColor-muted)",
  },
  actionButtons: {
    display: "flex",
    gap: "4px",
  },
  downloadButton: {
    padding: "4px",
  },
  remainingText: {
    fontSize: "10px",
    color: "var(--fgColor-muted)",
    textAlign: "center",
    marginTop: "4px",
  },
} as const;

const FileList: React.FC<FileListProps> = ({
  attachments,
  showDownload = true,
  showPreview = true,
  maxFiles,
}) => {
  const notify = useNotify();

  const { displayAttachments, remainingCount } = useMemo(() => {
    if (!attachments?.length) {
      return { displayAttachments: [], remainingCount: 0 };
    }

    const display = maxFiles ? attachments.slice(0, maxFiles) : attachments;
    const remaining =
      maxFiles && attachments.length > maxFiles
        ? attachments.length - maxFiles
        : 0;

    return { displayAttachments: display, remainingCount: remaining };
  }, [attachments, maxFiles]);

  const handleDownload = useCallback(
    (attachment: FileAttachment) => {
      downloadFile(attachment, notify);
    },
    [notify],
  );

  if (!attachments?.length) {
    return null;
  }

  return (
    <div style={styles.container}>
      {displayAttachments.map((attachment) => (
        <FileListItem
          key={attachment.id}
          attachment={attachment}
          showPreview={showPreview}
          showDownload={showDownload}
          onDownload={handleDownload}
        />
      ))}

      {remainingCount > 0 && (
        <Text sx={styles.remainingText}>他{remainingCount}個のファイル</Text>
      )}
    </div>
  );
};

// ファイルアイテムコンポーネント
interface FileListItemProps {
  attachment: FileAttachment;
  showPreview: boolean;
  showDownload: boolean;
  onDownload: (attachment: FileAttachment) => void;
}

const FileListItem: React.FC<FileListItemProps> = React.memo(
  ({ attachment, showPreview, showDownload, onDownload }) => {
    const handleDownloadClick = useCallback(() => {
      onDownload(attachment);
    }, [attachment, onDownload]);

    return (
      <div style={styles.fileItem}>
        <div style={styles.fileInfo}>
          {getFileIcon(attachment.type)}
          <div style={styles.fileDetails}>
            <Text sx={styles.fileName}>{attachment.name}</Text>
            <Text sx={styles.fileSize}>{formatFileSize(attachment.size)}</Text>
          </div>
        </div>
        <div style={styles.actionButtons}>
          {showPreview && <FilePreview attachment={attachment} />}
          {showDownload && (
            <Button
              variant="invisible"
              size="small"
              onClick={handleDownloadClick}
              sx={styles.downloadButton}
              aria-label={`${attachment.name}をダウンロード`}
            >
              <DownloadIcon size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  },
);

FileListItem.displayName = "FileListItem";

export default FileList;
