import { PlusIcon, TagIcon } from "@primer/octicons-react";
import { Button, Box, ActionMenu, ActionList } from "@primer/react";
import { memo } from "react";

import type { Label } from "../../types";
import { LabelFormDialog } from "../LabelManagement";

import {
  EMPTY_LABELS_MESSAGE,
  SELECT_LABEL_TEXT,
  ADD_LABEL_TEXT,
  LABEL_SELECTOR_STYLES,
} from "./constants";
import { CurrentBoardLabelSection } from "./CurrentBoardLabelSection";
import { OtherBoardLabelSection } from "./OtherBoardLabelSection";
import { SelectedLabelsDisplay } from "./SelectedLabelsDisplay";
import { useLabelManagement } from "./useLabelManagement";

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector = memo<LabelSelectorProps>(
  ({ selectedLabels, onLabelsChange }) => {
    console.log('🔄 LabelSelector: Component rendering with props:', {
      selectedLabels: selectedLabels.length,
      onLabelsChange: !!onLabelsChange
    });
    const {
      allLabels,
      currentBoardLabels,
      otherBoardLabels,
      selectedLabelIds,
      isAddDialogOpen,
      handleAddDialogClose,
      handleAddDialogOpen,
      toggleLabel,
      removeLabel,
      handleLabelCreated,
      handleCopyAndSelectLabel,
    } = useLabelManagement({ selectedLabels, onLabelsChange });

    return (
      <Box sx={LABEL_SELECTOR_STYLES.container}>
        {/* 選択されたラベルを表示 */}
        <SelectedLabelsDisplay
          selectedLabels={selectedLabels}
          onRemoveLabel={removeLabel}
        />

        {/* ラベル選択・追加のアクションメニュー */}
        <Box sx={LABEL_SELECTOR_STYLES.menuContainer}>
          {/* ラベル選択 */}
          <ActionMenu>
            <ActionMenu.Button
              leadingVisual={TagIcon}
              sx={LABEL_SELECTOR_STYLES.buttonHover}
              aria-label="ラベル選択メニューを開く"
            >
              {SELECT_LABEL_TEXT}
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                {/* 現在のボードのラベル */}
                <CurrentBoardLabelSection
                  labels={currentBoardLabels}
                  selectedLabelIds={selectedLabelIds}
                  onToggleLabel={toggleLabel}
                />

                {/* 他のボードのラベル */}
                <OtherBoardLabelSection
                  labels={otherBoardLabels}
                  onCopyAndSelectLabel={handleCopyAndSelectLabel}
                />

                {allLabels.length === 0 && (
                  <ActionList.Item disabled>
                    {EMPTY_LABELS_MESSAGE}
                  </ActionList.Item>
                )}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>

          {/* ラベル追加 */}
          <Button
            leadingVisual={PlusIcon}
            onClick={handleAddDialogOpen}
            sx={LABEL_SELECTOR_STYLES.buttonHover}
            aria-label="新しいラベルを作成"
          >
            {ADD_LABEL_TEXT}
          </Button>
        </Box>

        {/* ラベル追加ダイアログ */}
        <LabelFormDialog
          mode="create"
          isOpen={isAddDialogOpen}
          onClose={handleAddDialogClose}
          onSave={handleLabelCreated}
        />
      </Box>
    );
  },
  // カスタム比較関数で不要な再レンダリングを防ぐ
  (prevProps, nextProps) => {
    // selectedLabelsの長さと各ラベルのIDを比較
    if (prevProps.selectedLabels.length !== nextProps.selectedLabels.length) {
      console.log('🔄 LabelSelector memo: selectedLabels length changed');
      return false;
    }

    // 各ラベルのIDを比較
    for (let i = 0; i < prevProps.selectedLabels.length; i++) {
      if (prevProps.selectedLabels[i]?.id !== nextProps.selectedLabels[i]?.id) {
        console.log('🔄 LabelSelector memo: selectedLabels content changed');
        return false;
      }
    }

    // onLabelsChangeは関数なので、参照が変わっても実質同じ場合がある
    // ここでは常に再レンダリングを避けるために、selectedLabelsのみで判定
    console.log('🔄 LabelSelector memo: Props unchanged, skipping render');
    return true;
  }
);

export default LabelSelector;