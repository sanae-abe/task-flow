import React, { useState } from 'react';
import { Box, Button, TextInput, Text } from '@primer/react';
import { XIcon, PlusIcon } from '@primer/octicons-react';
import type { Label } from '../types';
import { LABEL_COLORS, createLabel, getColorInfo } from '../utils/labels';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({ selectedLabels, onLabelsChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(LABEL_COLORS[0].value);

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      return;
    }

    const newLabel = createLabel(newLabelName, selectedColor);
    onLabelsChange([...selectedLabels, newLabel]);
    setNewLabelName('');
    setIsCreating(false);
  };

  const handleRemoveLabel = (labelId: string) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelId));
  };

  const renderLabelChip = (label: Label, showRemove = true) => {
    const colorInfo = getColorInfo(label.color);
    return (
      <Box
        key={label.id}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bg: colorInfo.bg,
          color: label.color,
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: 0,
          fontWeight: '500',
          border: '1px solid',
          borderColor: label.color,
          gap: 1
        }}
      >
        <Text sx={{ fontSize: 0, color: label.color }}>{label.name}</Text>
        {showRemove && (
          <Button
            onClick={() => handleRemoveLabel(label.id)}
            variant="invisible"
            size="small"
            sx={{
              minHeight: 'auto',
              p: 0,
              color: label.color,
              '&:hover': {
                bg: 'transparent',
                color: label.color
              }
            }}
          >
            <XIcon size={12} />
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedLabels.map(label => renderLabelChip(label))}
        </Box>
      )}

      {/* Create New Label */}
      {!isCreating ? (
        <Button
          onClick={() => setIsCreating(true)}
          variant="invisible"
          size="small"
          leadingVisual={PlusIcon}
          sx={{
            color: 'fg.muted',
            '&:hover': {
              color: 'fg.default'
            }
          }}
        >
          Add Label
        </Button>
      ) : (
        <Box sx={{ p: 3, bg: 'canvas.subtle', borderRadius: 2, border: '1px solid', borderColor: 'border.default' }}>
          <Box sx={{ mb: 2 }}>
            <Text sx={{ fontSize: 1, fontWeight: '500', mb: 1, display: 'block' }}>Label Name</Text>
            <TextInput
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Enter label name"
              sx={{ width: '100%' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateLabel();
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewLabelName('');
                }
              }}
            />
          </Box>

          {/* Color Selection */}
          <Box sx={{ mb: 3 }}>
            <Text sx={{ fontSize: 1, fontWeight: '500', mb: 2, display: 'block' }}>Color</Text>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {LABEL_COLORS.map((color) => (
                <Button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  sx={{
                    width: '32px',
                    height: '32px',
                    minHeight: '32px',
                    p: 0,
                    bg: color.bg,
                    border: '2px solid',
                    borderColor: selectedColor === color.value ? color.value : 'transparent',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      borderColor: color.value
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: '16px',
                      height: '16px',
                      bg: color.value,
                      borderRadius: '50%'
                    }}
                  />
                </Button>
              ))}
            </Box>
          </Box>

          {/* Preview */}
          {newLabelName.trim() && (
            <Box sx={{ mb: 3 }}>
              <Text sx={{ fontSize: 1, fontWeight: '500', mb: 1, display: 'block' }}>Preview</Text>
              {renderLabelChip(createLabel(newLabelName, selectedColor), false)}
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleCreateLabel}
              variant="primary"
              size="small"
              disabled={!newLabelName.trim()}
            >
              Create
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setNewLabelName('');
              }}
              size="small"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LabelSelector;