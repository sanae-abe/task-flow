import { Eye, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="p-1"
      aria-label={`${attachment.name}をプレビュー`}
    >
      {isImage ? <Image size={14} /> : <Eye size={14} />}
    </Button>
  ),
);

// プレビューフッターコンポーネント
const PreviewFooter = memo<PreviewFooterProps>(({ attachment }) => (
  <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-3">
    <span className="text-xs text-gray-600">
      ファイルサイズ: {formatFileSize(attachment.size)}
    </span>
    <span className="text-xs text-gray-600">
      アップロード日:{" "}
      {new Date(attachment.uploadedAt).toLocaleDateString("ja-JP")}
    </span>
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
          <div className="text-center max-h-[70vh] overflow-auto">
            <img
              src={getDataUrl()}
              alt={attachment.name}
              className="max-w-full max-h-[60vh] object-contain rounded-md"
            />
          </div>
        );
      }

      if (isText) {
        return (
          <div className="max-h-[60vh] overflow-auto bg-gray-50 p-3 rounded-sm font-mono">
            <pre className="whitespace-pre-wrap text-xs leading-6 m-0">
              {getTextContent()}
            </pre>
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
          className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center"
          onClick={handleClosePreview}
        >
          <div
            className="bg-white border border-gray-200 rounded-md shadow-2xl max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h2
                id="file-preview-title"
                className="text-base font-bold"
              >
                {attachment.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePreview}
                className="p-1"
                aria-label="プレビューを閉じる"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="p-3 flex-1 overflow-auto">
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
