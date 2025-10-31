import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { memo } from 'react';

import type { Label } from '../../types';
import { LabelFormDialog } from '../LabelManagement';

import {
  EMPTY_LABELS_MESSAGE,
  SELECT_LABEL_TEXT,
  ADD_LABEL_TEXT,
} from './constants';
import { CurrentBoardLabelSection } from './CurrentBoardLabelSection';
import { OtherBoardLabelSection } from './OtherBoardLabelSection';
import { SelectedLabelsDisplay } from './SelectedLabelsDisplay';
import { useLabelManagement } from './useLabelManagement';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector = memo<LabelSelectorProps>(
  ({ selectedLabels, onLabelsChange }) => {
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
      <div className='flex flex-col gap-2'>
        {/* 選択されたラベルを表示 */}
        <SelectedLabelsDisplay
          selectedLabels={selectedLabels}
          onRemoveLabel={removeLabel}
        />

        {/* ラベル選択・追加のアクションメニュー */}
        <div className='flex gap-2'>
          {/* ラベル選択 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='hover:bg-gray-100'
                aria-label='ラベル選択メニューを開く'
              >
                <Tag size={16} className='mr-2' />
                {SELECT_LABEL_TEXT}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
                <DropdownMenuItem disabled>
                  {EMPTY_LABELS_MESSAGE}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ラベル追加 */}
          <Button
            variant='outline'
            onClick={handleAddDialogOpen}
            className='hover:bg-gray-100'
            aria-label='新しいラベルを作成'
          >
            <Plus size={16} className='mr-2' />
            {ADD_LABEL_TEXT}
          </Button>
        </div>

        {/* ラベル追加ダイアログ */}
        <LabelFormDialog
          mode='create'
          isOpen={isAddDialogOpen}
          onClose={handleAddDialogClose}
          onSave={handleLabelCreated}
        />
      </div>
    );
  },
  // カスタム比較関数で不要な再レンダリングを防ぐ
  (prevProps, nextProps) => {
    // selectedLabelsの長さと各ラベルのIDを比較
    if (prevProps.selectedLabels.length !== nextProps.selectedLabels.length) {
      return false;
    }

    // 各ラベルのIDを比較
    for (let i = 0; i < prevProps.selectedLabels.length; i++) {
      if (prevProps.selectedLabels[i]?.id !== nextProps.selectedLabels[i]?.id) {
        return false;
      }
    }

    // onLabelsChangeは関数なので、参照が変わっても実質同じ場合がある
    // ここでは常に再レンダリングを避けるために、selectedLabelsのみで判定
    return true;
  }
);

export default LabelSelector;
