import { Text } from "@primer/react";
import React, { memo } from "react";

interface ContentBoxProps {
  children: React.ReactNode;
  background?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

const ContentBox = memo<ContentBoxProps>(
  ({ children, background = "var(--bgColor-muted)", emptyText, isEmpty = false }) => (
    <div
      style={{
        padding: "12px",
        background,
        borderRadius: "var(--borderRadius-medium)",
      }}
    >
      {isEmpty && emptyText ? (
        <Text sx={{ fontSize: 1, color: "fg.muted", fontStyle: "italic" }}>
          {emptyText}
        </Text>
      ) : (
        children
      )}
    </div>
  ),
);

ContentBox.displayName = "ContentBox";

export default ContentBox;
