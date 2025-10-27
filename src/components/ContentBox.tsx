import React, { memo } from "react";

interface ContentBoxProps {
  children: React.ReactNode;
  backgroundClass?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

const ContentBox = memo<ContentBoxProps>(
  ({
    children,
    backgroundClass = "bg-muted",
    emptyText,
    isEmpty = false,
  }) => (
    <div className={`p-3 rounded-md ${backgroundClass}`}>
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
