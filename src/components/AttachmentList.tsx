import { XIcon } from "@primer/octicons-react";
import { Text, Button } from "@primer/react";
import React from "react";

import type { FileAttachment } from "../types";
import { formatFileSize, getFileIcon } from "../utils/fileUtils";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Text sx={{ fontSize: 1, fontWeight: "700" }}>
        添付ファイル ({attachments.length})
      </Text>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px",
            backgroundColor: "var(--bgColor-muted)",
            borderRadius: "var(--borderRadius-medium)",
            border: "1px solid",
            borderColor: "var(--borderColor-default)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {getFileIcon(attachment.type)}
            <div
              style={{
                minWidth: 0,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <Text
                sx={{
                  fontSize: 1,
                  fontWeight: "600",
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                }}
              >
                {attachment.name}
              </Text>
              <Text sx={{ fontSize: 0, color: "fg.muted" }}>
                {formatFileSize(attachment.size)}
              </Text>
            </div>
          </div>
          <Button
            variant="invisible"
            size="small"
            onClick={() => onRemoveAttachment(attachment.id)}
            sx={{
              p: 1,
              color: "danger.fg",
              "&:hover": {
                color: "danger.emphasis",
              },
            }}
            aria-label="ファイルを削除"
          >
            <XIcon size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
