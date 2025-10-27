import React, { memo } from "react";

interface ContentBoxProps {
  children: React.ReactNode;
  backgroundClass?: string;
  emptyText?: string;
  isEmpty?: boolean;
  className?: string;
}

const ContentBox = memo<ContentBoxProps>(
  ({
    children,
    backgroundClass = "bg-muted",
    emptyText,
    isEmpty = false,
    className = "",
  }) => (
    <div className={`p-3 rounded-md wrap-anywhere ${backgroundClass} ${className}`}>
      {isEmpty && emptyText ? (
        <span className="text-sm text-muted-foreground italic">
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
