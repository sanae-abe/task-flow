import { X } from "lucide-react";
import React from "react";

import type { FileAttachment } from "../types";
import { formatFileSize, getFileIcon } from "../utils/fileUtils";
import IconButton from "../components/shared/IconButton";

interface AttachmentListProps {
  attachments: FileAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemoveAttachment,
}) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold">
        添付ファイル ({attachments.length})
      </h3>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-border border-gray-200"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getFileIcon(attachment.type)}
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <span className="text-sm font-semibold break-words leading-tight">
                {attachment.name}
              </span>
              <span className="text-xs text-gray-600">
                {formatFileSize(attachment.size)}
              </span>
            </div>
          </div>
          <IconButton
            icon={X}
            size="icon"
            onClick={() => onRemoveAttachment(attachment.id)}
            ariaLabel="ファイルを削除"
            className="p-2"
          />
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
