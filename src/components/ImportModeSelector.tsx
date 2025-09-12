import { Box, Text } from '@primer/react';
import { UploadIcon, FileIcon, PackageIcon } from '@primer/octicons-react';
import React, { useMemo, useCallback } from 'react';

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

const getModeIcon = (mode: ImportMode): React.ReactElement => {
  switch (mode) {
    case 'drag-drop':
      return <UploadIcon size={16} />;
    case 'file-select':
      return <FileIcon size={16} />;
    case 'both':
      return <PackageIcon size={16} />;
    default:
      // TypeScript exhaustiveness check - should never reach here
      mode satisfies never;
      return <PackageIcon size={16} />;
  }
};

const ImportModeSelector: React.FC<ImportModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  showModeIndicator = true
}) => {
  const selectedConfig = useMemo(
    () => IMPORT_MODES.find(m => m.mode === selectedMode),
    [selectedMode]
  );

  const handleModeChange = useCallback(
    (mode: ImportMode) => {
      onModeChange(mode);
    },
    [onModeChange]
  );

  return (
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
              {selectedConfig?.label}
            </Text>
          </Box>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>
          インポートモードを選択
        </Text>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {IMPORT_MODES.map((modeConfig) => (
            <button
              key={modeConfig.mode}
              style={{
                padding: '16px',
                border: selectedMode === modeConfig.mode ? '2px solid #0969da' : '1px solid #d1d9e0',
                borderRadius: '6px',
                background: selectedMode === modeConfig.mode ? '#f6f8fa' : 'white',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
              onClick={() => handleModeChange(modeConfig.mode)}
              aria-label={`インポートモードを${modeConfig.label}に変更`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getModeIcon(modeConfig.mode)}
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {modeConfig.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#656d76' }}>
                    {modeConfig.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Box>
    </Box>
  );
};

export default ImportModeSelector;