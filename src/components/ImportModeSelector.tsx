import { Box, Button, Text } from '@primer/react';
import { UploadIcon, FileIcon, PackageIcon } from '@primer/octicons-react';
import React from 'react';

import type { ImportMode, ImportModeConfig } from '../types';

interface ImportModeSelectorProps {
  selectedMode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  showModeIndicator?: boolean;
}

const IMPORT_MODES: ImportModeConfig[] = [
  {
    mode: 'drag-drop',
    label: 'ドラッグ&ドロップ',
    description: 'ファイルをドラッグしてアップロード'
  },
  {
    mode: 'file-select', 
    label: 'ファイル選択',
    description: 'ボタンからファイルを選択'
  },
  {
    mode: 'both',
    label: '両方',
    description: 'ドラッグ&ドロップとファイル選択の両方'
  }
];

const getModeIcon = (mode: ImportMode) => {
  switch (mode) {
    case 'drag-drop':
      return <UploadIcon size={16} />;
    case 'file-select':
      return <FileIcon size={16} />;
    case 'both':
      return <PackageIcon size={16} />;
    default:
      return <PackageIcon size={16} />;
  }
};

const ImportModeSelector: React.FC<ImportModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  showModeIndicator = true
}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {showModeIndicator && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            padding: 2,
            backgroundColor: 'canvas.subtle',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'border.default'
          }}
        >
          {getModeIcon(selectedMode)}
          <Box>
            <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>
              現在のインポートモード
            </Text>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              {IMPORT_MODES.find(m => m.mode === selectedMode)?.label}
            </Text>
          </Box>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>
          インポートモードを選択
        </Text>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {IMPORT_MODES.map((modeConfig) => (
            <Button
              key={modeConfig.mode}
              variant={selectedMode === modeConfig.mode ? 'primary' : 'default'}
              sx={{
                justifyContent: 'flex-start',
                padding: 2,
                height: 'auto'
              }}
              onClick={() => onModeChange(modeConfig.mode)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getModeIcon(modeConfig.mode)}
                <Box sx={{ textAlign: 'left' }}>
                  <Text sx={{ fontWeight: 'bold' }}>
                    {modeConfig.label}
                  </Text>
                  <Text sx={{ fontSize: 0, opacity: 0.8 }}>
                    {modeConfig.description}
                  </Text>
                </Box>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );

export default ImportModeSelector;