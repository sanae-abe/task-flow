import { Box, Text } from '@primer/react';
import { memo } from 'react';

import type { Label } from '../types';

import LabelChip from './LabelChip';

interface LabelSuggestionsProps {
  suggestions: Label[];
  onSuggestionSelect: (label: Label) => void;
}

/**
 * ラベルサジェスト表示コンポーネント
 * 既存ラベルをクリック可能な形で表示
 */
const LabelSuggestions = memo<LabelSuggestionsProps>(({ suggestions, onSuggestionSelect }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Text as="div" sx={{ fontSize: 1, color: 'fg.muted', mb: 1 }}>
        既存のラベルから選択:
      </Text>
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          '& button': { 
            fontSize: '0px', 
            padding: '0 !important', 
            height: 'auto',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.1s ease'
            }
          }
        }}
      >
        {suggestions.map(label => (
          <LabelChip
            key={`suggestion-${label.id}`}
            label={label}
            onClick={() => onSuggestionSelect(label)}
            clickable
          />
        ))}
      </Box>
    </Box>
  );
});

LabelSuggestions.displayName = 'LabelSuggestions';

export default LabelSuggestions;