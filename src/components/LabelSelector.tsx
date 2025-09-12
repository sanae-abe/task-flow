import { PlusIcon } from '@primer/octicons-react';
import { Box, Button } from '@primer/react';
import { memo } from 'react';

import { useLabelSelector } from '../hooks/useLabelSelector';
import type { Label } from '../types';

import LabelChip from './LabelChip';
import LabelCreateForm from './LabelCreateForm';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector = memo<LabelSelectorProps>(({ selectedLabels, onLabelsChange }) => {
  const {
    isCreating,
    newLabelName,
    selectedColor,
    setNewLabelName,
    setSelectedColor,
    startCreating,
    cancelCreating,
    createNewLabel,
    removeLabel,
    handleKeyDown,
    isValid
  } = useLabelSelector({ selectedLabels, onLabelsChange });

  return (
    <Box>
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', '& button': { fontSize: '0px', padding: '0 !important', height: 'auto' } }}>
          {selectedLabels.map(label => (
            <LabelChip
              key={label.id}
              label={label}
              showRemove
              onRemove={removeLabel}
            />
          ))}
        </Box>
      )}

      {/* Create New Label */}
      {!isCreating ? (
        <div>
          <Button
            onClick={startCreating}
            variant="invisible"
            size="small"
            leadingVisual={PlusIcon}
            sx={{
              color: 'fg.muted !important',
              '&:hover': {
                color: 'fg.default !important',
                bg: 'neutral.subtle'
              }
            }}
          >
            ラベルを追加
          </Button>
        </div>
      ) : (
        <LabelCreateForm
          labelName={newLabelName}
          selectedColor={selectedColor}
          onLabelNameChange={setNewLabelName}
          onColorSelect={setSelectedColor}
          onSave={createNewLabel}
          onCancel={cancelCreating}
          onKeyDown={handleKeyDown}
          isValid={isValid}
        />
      )}
    </Box>
  );
});

export default LabelSelector;