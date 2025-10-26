import { File, Image, Download } from "lucide-react";
import React, { useMemo, useCallback } from "react";

import type { FileAttachment } from "../types";
import { useSonnerNotify } from "../hooks/useSonnerNotify";

import FilePreview from "./FilePreview";
import { IconButton } from "./shared";

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
    <Image {...iconProps} />
  ) : (
    <File {...iconProps} />
  );
};

const downloadFile = (
  attachment: FileAttachment,
  notify: ReturnType<typeof useSonnerNotify>,
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
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error("ファイルのダウンロードに失敗しました:", _error);
    notify._error("ファイルのダウンロードに失敗しました");
  }
};


const FileList: React.FC<FileListProps> = ({
  attachments,
  showDownload = true,
  showPreview = true,
  maxFiles,
}) => {
  const notify = useSonnerNotify();

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
    <div className="flex flex-col gap-1">
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
        <p className="text-xs text-gray-600 text-center mt-1">
          他{remainingCount}個のファイル
        </p>
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
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getFileIcon(attachment.type)}
          <div className="min-w-0 flex-1 gap-2 flex items-center">
            <span className="text-xs font-semibold break-words">
              {attachment.name}
            </span>
            <span className="text-[10px] text-gray-600">
              {formatFileSize(attachment.size)}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {showPreview && <FilePreview attachment={attachment} />}
          {showDownload && (
            <IconButton
              icon={Download}
              size="icon"
              onClick={handleDownloadClick}
              className="p-1"
              ariaLabel={`${attachment.name}をダウンロード`}
            />
          )}
        </div>
      </div>
    );
  },
);

FileListItem.displayName = "FileListItem";

export default FileList;
