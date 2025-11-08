import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Label } from '../types';
import { LabelFormDialog } from './LabelManagement';

import { CurrentBoardLabelSection } from './LabelSelector/CurrentBoardLabelSection';
import { OtherBoardLabelSection } from './LabelSelector/OtherBoardLabelSection';
import { SelectedLabelsDisplay } from './LabelSelector/SelectedLabelsDisplay';
import { useLabelManagement } from './LabelSelector/useLabelManagement';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector = memo<LabelSelectorProps>(
  ({ selectedLabels, onLabelsChange }) => {
    const { t } = useTranslation();
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
      <div className='mt-2'>
        {/* 選択されたラベルを表示 */}
        <SelectedLabelsDisplay
          selectedLabels={selectedLabels}
          onRemoveLabel={removeLabel}
        />

        {/* ラベル選択・追加のアクションメニュー */}
        <div className='flex gap-2 items-center'>
          {/* ラベル選択 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='hover:text-foreground hover:bg-gray-100'
                aria-label={t('label.openLabelMenu')}
              >
                <Tag size={16} className='mr-2' />
                {t('label.selectLabel')}
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
                <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                  {t('label.noLabels')}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ラベル追加 */}
          <Button
            variant='outline'
            onClick={handleAddDialogOpen}
            className='hover:text-foreground hover:bg-gray-100'
            aria-label={t('label.createLabel')}
          >
            <Plus size={16} className='mr-2' />
            {t('label.addNewLabel')}
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
  }
);

export default LabelSelector;
