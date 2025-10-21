import React from "react";
import { CheckIcon } from "@primer/octicons-react";
import { MESSAGES, UI_TEXT } from "../../../constants/recycleBin";
import { LoadingButton } from "../../shared/LoadingButton";
import { InlineMessage } from "../../shared";
import {
  SaveSection,
  SaveMessageContainer,
} from "../RecycleBinSettingsPanel.styles";

export interface SettingsSaveSectionProps {
  /** ローディング状態 */
  isLoading: boolean;
  /** バリデーションエラーがあるかどうか */
  hasValidationError: boolean;
  /** 表示するメッセージ */
  message: { text: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  /** 保存ハンドラ */
  onSave: () => Promise<void>;
}

/**
 * ゴミ箱設定の保存セクションコンポーネント
 * 保存ボタンとメッセージ表示を提供
 */
export const SettingsSaveSection: React.FC<SettingsSaveSectionProps> = ({
  isLoading,
  hasValidationError,
  message,
  onSave,
}) => (
    <SaveSection>
      <LoadingButton
        variant="primary"
        isLoading={isLoading}
        loadingText={MESSAGES.SAVE.IN_PROGRESS}
        onClick={onSave}
        disabled={hasValidationError}
        leadingVisual={!isLoading ? CheckIcon : undefined}
      >
        {UI_TEXT.PANEL.SAVE_BUTTON}
      </LoadingButton>
      <SaveMessageContainer>
        {message && (
          <InlineMessage
            variant={message.type === 'success' ? "success" : "critical"}
            message={message.text}
            size="small"
          />
        )}
      </SaveMessageContainer>
    </SaveSection>
  );