import React, { useState, useCallback } from 'react';
import {
  Text,
  Box,
  IconButton,
  ActionMenu,
  ActionList,
  Button,
  FormControl,
  TextInput,
  Dialog
} from '@primer/react';
import {
  GearIcon,
  TrashIcon,
  GrabberIcon,
  EyeIcon,
  EyeClosedIcon
} from '@primer/octicons-react';

import { useTableColumns } from '../contexts/TableColumnsContext';


const TableColumnManager: React.FC = () => {
  const {
    columns,
    toggleColumnVisibility,
    updateColumnWidth,
    removeColumn,
    resetToDefaults
  } = useTableColumns();


  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  const handleWidthChange = useCallback((columnId: string, newWidth: string) => {
    updateColumnWidth(columnId, newWidth);
  }, [updateColumnWidth]);

  const isCustomColumn = useCallback((columnId: string) => columnId.startsWith('custom-'), []);

  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton
            aria-label="カラム設定"
            icon={GearIcon}
            variant="invisible"
            size="small"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Group title="表示カラム">
              {columns.map((column) => (
                <ActionList.Item
                  key={column.id}
                  onSelect={() => toggleColumnVisibility(column.id)}
                >
                  <ActionList.LeadingVisual>
                    {column.visible ? <EyeIcon /> : <EyeClosedIcon />}
                  </ActionList.LeadingVisual>
                  {column.label}
                </ActionList.Item>
              ))}
            </ActionList.Group>
            <ActionList.Divider />
            <ActionList.Item onSelect={() => setIsSettingsOpen(true)}>
              <ActionList.LeadingVisual>
                <GearIcon />
              </ActionList.LeadingVisual>
              詳細設定
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item onSelect={resetToDefaults} variant="danger">
              デフォルトに戻す
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>


      {/* 詳細設定ダイアログ */}
      {isSettingsOpen && (
        <Dialog
          title="カラム設定"
          onClose={() => setIsSettingsOpen(false)}
          aria-labelledby="column-settings-title"
        >
          <div style={{ marginBottom: '20px', color: 'fg.muted' }}>
            カラムの並び替え、幅の調整を行えます。幅はpx単位で入力してください。
          </div>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {columns.map((column) => (
              <Box
                key={column.id}
                sx={{
                  display: 'flex',
                  py: 1,
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 2,
                  bg: column.visible ? 'canvas.default' : 'canvas.subtle'
                }}
              >
                <IconButton
                  aria-label="並び替え"
                  icon={GrabberIcon}
                  variant="invisible"
                  size="small"
                  sx={{ cursor: 'grab' }}
                />

                <Box sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: 'semibold' }}>
                    {column.label}
                  </Text>
                </Box>

                <FormControl>
                  <FormControl.Label visuallyHidden>
                    {column.label}の幅を設定
                  </FormControl.Label>
                  <TextInput
                    value={column.width}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleWidthChange(column.id, e.target.value)
                    }
                    placeholder="幅 (例: 150px)"
                    size="small"
                    sx={{ width: '120px', mr: 1 }}
                    aria-describedby={`width-help-${column.id}`}
                  />
                </FormControl>

                {isCustomColumn(column.id) && (
                  <IconButton
                    aria-label="カラムを削除"
                    icon={TrashIcon}
                    variant="invisible"
                    size="small"
                    onClick={() => removeColumn(column.id)}
                    sx={{ color: 'danger.emphasis' }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setIsSettingsOpen(false)}
            >
              閉じる
            </Button>
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default TableColumnManager;