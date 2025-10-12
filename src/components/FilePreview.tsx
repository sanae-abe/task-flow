import { EyeIcon, ImageIcon, XIcon } from "@primer/octicons-react";
import { Text, Button } from "@primer/react";
import React, { useState, memo, useCallback } from "react";

import type { FileAttachment } from "../types";
import { isImageFile, isTextFile, formatFileSize } from "../utils/fileUtils";

interface FilePreviewProps {
  attachment: FileAttachment;
  showPreviewButton?: boolean;
}

interface PreviewContentProps {
  attachment: FileAttachment;
  isImage: boolean;
  isText: boolean;
}

interface PreviewButtonProps {
  attachment: FileAttachment;
  isImage: boolean;
  onClick: () => void;
}

interface PreviewFooterProps {
  attachment: FileAttachment;
}

// プレビューボタンコンポーネント
const PreviewButton = memo<PreviewButtonProps>(
  ({ attachment, isImage, onClick }) => (
    <Button
      variant="invisible"
      size="small"
      onClick={onClick}
      sx={{ p: 1 }}
      aria-label={`${attachment.name}をプレビュー`}
    >
      {isImage ? <ImageIcon size={14} /> : <EyeIcon size={14} />}
    </Button>
  ),
);

// プレビューフッターコンポーネント
const PreviewFooter = memo<PreviewFooterProps>(({ attachment }) => (
  <div
    style={{
      padding: "12px",
      borderTop: "1px solid",
      borderColor: "var(--borderColor-default)",
      background: "var(--bgColor-muted)",
      display: "flex",
      gap: "12px",
    }}
  >
    <Text sx={{ fontSize: 0, color: "fg.muted" }}>
      ファイルサイズ: {formatFileSize(attachment.size)}
    </Text>
    <Text sx={{ fontSize: 0, color: "fg.muted" }}>
      アップロード日:{" "}
      {new Date(attachment.uploadedAt).toLocaleDateString("ja-JP")}
    </Text>
  </div>
));

const FilePreview: React.FC<FilePreviewProps> = ({
  attachment,
  showPreviewButton = true,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isImage = isImageFile(attachment.type);
  const isText = isTextFile(attachment.type, attachment.name);
  const canPreview = isImage || isText;

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  // プレビューコンテンツコンポーネント
  const PreviewContent = memo<PreviewContentProps>(
    ({ attachment, isImage, isText }) => {
      const getDataUrl = () =>
        `data:${attachment.type};base64,${attachment.data}`;

      const getTextContent = () => {
        try {
          return atob(attachment.data);
        } catch (error) {
          return "ファイルの内容を読み込めませんでした。";
        }
      };

      if (isImage) {
        return (
          <div
            style={{ textAlign: "center", maxHeight: "70vh", overflow: "auto" }}
          >
            <img
              src={getDataUrl()}
              alt={attachment.name}
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
                borderRadius: "6px",
              }}
            />
          </div>
        );
      }

      if (isText) {
        return (
          <div
            style={{
              maxHeight: "60vh",
              overflow: "auto",
              background: "var(--bgColor-muted)",
              padding: "12px",
              borderRadius: "4px",
              fontFamily: "mono",
            }}
          >
            <Text
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: 0,
                lineHeight: "1.5",
              }}
            >
              {getTextContent()}
            </Text>
          </div>
        );
      }

      return null;
    },
  );

  if (!canPreview && showPreviewButton) {
    return null;
  }

  return (
    <>
      {showPreviewButton && canPreview && (
        <PreviewButton
          attachment={attachment}
          isImage={isImage}
          onClick={handleOpenPreview}
        />
      )}

      {isPreviewOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--overlay-backdrop-bgColor)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleClosePreview}
        >
          <div
            style={{
              background: "var(--bgColor-default)",
              border: "1px solid",
              borderColor: "var(--borderColor-default)",
              borderRadius: "4px",
              boxShadow: "shadow.extra-large",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                borderBottom: "1px solid",
                borderColor: "var(--borderColor-default)",
              }}
            >
              <Text
                id="file-preview-title"
                sx={{ fontSize: 2, fontWeight: "700" }}
              >
                {attachment.name}
              </Text>
              <Button
                variant="invisible"
                onClick={handleClosePreview}
                sx={{ p: 1 }}
                aria-label="プレビューを閉じる"
              >
                <XIcon size={16} />
              </Button>
            </div>

            <div style={{ padding: "12px", flex: 1, overflow: "auto" }}>
              <PreviewContent
                attachment={attachment}
                isImage={isImage}
                isText={isText}
              />
            </div>

            <PreviewFooter attachment={attachment} />
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;
