import React, { memo } from "react";

interface ContentBoxProps {
  children: React.ReactNode;
  background?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

const ContentBox = memo<ContentBoxProps>(
  ({
    children,
    background = "var(--muted)",
    emptyText,
    isEmpty = false,
  }) => (
    <div
      style={{
        background,
        borderRadius: "0.5rem",
      }}
      className="p-3"
    >
      {isEmpty && emptyText ? (
        <span className="text-sm text-gray-500 italic">
          {emptyText}
        </span>
      ) : (
        children
      )}
    </div>
  ),
);

ContentBox.displayName = "ContentBox";

export default ContentBox;
