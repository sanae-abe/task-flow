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
    background = "var(--color-neutral-100)",
    emptyText,
    isEmpty = false,
  }) => (
    <div
      style={{
        padding: "12px",
        background,
        borderRadius: "var(--borderRadius-medium)",
      }}
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
