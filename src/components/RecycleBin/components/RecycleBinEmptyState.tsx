import React from "react";
import { Trash2 } from "lucide-react";
import { UI_TEXT } from "../../../constants/recycleBin";
import {
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateTitle,
  EmptyStateDescription,
} from "../RecycleBinView.styles";

/**
 * ゴミ箱が空の場合の表示コンポーネント
 */
export const RecycleBinEmptyState: React.FC = () => (
    <EmptyStateContainer>
      <Trash2 size={24} />
      <EmptyStateContent>
        <EmptyStateTitle>
          {UI_TEXT.VIEW.EMPTY_TITLE}
        </EmptyStateTitle>
        <EmptyStateDescription>
          {UI_TEXT.VIEW.EMPTY_DESCRIPTION}
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyStateContainer>
  );