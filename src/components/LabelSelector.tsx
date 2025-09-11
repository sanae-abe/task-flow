import React, { useState } from 'react';
import { Box, Button, TextInput, Text } from '@primer/react';
import { XIcon, PlusIcon } from '@primer/octicons-react';
import type { Label } from '../types';
import { LABEL_COLORS, createLabel } from '../utils/labels';
import { getLabelColors } from '../utils/labelHelpers';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({ selectedLabels, onLabelsChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(LABEL_COLORS[0].variant);

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
    const colors = getLabelColors(label.color);
    
    return (
      <Box
        key={label.id}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          bg: colors.bg,
          color: colors.color,
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: 0,
          fontWeight: '500',
          gap: 1
        }}
      >
        <Text sx={{ fontSize: 0, color: colors.color }}>{label.name}</Text>
        {showRemove && (
          <Button
            onClick={() => handleRemoveLabel(label.id)}
            variant="invisible"
            size="small"
            sx={{
              minHeight: 'auto',
              p: 0,
              color: colors.color,
              '&:hover': {
                bg: 'rgba(255, 255, 255, 0.2)',
                color: colors.color
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
            color: 'fg.muted !important',
            '&:hover': {
              color: 'fg.default !important',
              bg: 'neutral.subtle'
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
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewLabelName('');
                }
              }}
            />
          </Box>

          {/* Color Selection */}
          <Box sx={{ mb: 3 }}>
            <Text sx={{ fontSize: 1, fontWeight: '500', mb: 2, display: 'block' }}>Color</Text>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, min-content)', gap: 1, justifyContent: 'start' }}>
              {LABEL_COLORS.map((color) => {
                const colors = getLabelColors(color.variant);

                return (
                  <Button
                    key={color.variant}
                    onClick={() => setSelectedColor(color.variant)}
                    sx={{
                      width: '32px',
                      height: '32px',
                      minHeight: '32px',
                      p: 0,
                      bg: colors.bg,
                      border: '2px solid',
                      borderColor: selectedColor === color.variant ? 'accent.emphasis' : 'transparent',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  >
                    <Text sx={{ fontSize: 0, color: colors.color, textAlign: 'center', fontWeight: 'semibold' }}>
                      {color.name.charAt(0)}
                    </Text>
                  </Button>
                );
              })}
            </Box>
          </Box>


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