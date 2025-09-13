import React, { useState } from 'react';
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


  const handleWidthChange = (columnId: string, newWidth: string) => {
    updateColumnWidth(columnId, newWidth);
  };

  const isCustomColumn = (columnId: string) => columnId.startsWith('custom-');

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
          onClose={() => setIsSettingsOpen(false)}
          aria-labelledby="column-settings-title"
        >
        <Dialog.Header id="column-settings-title">
          カラム設定
        </Dialog.Header>
        <Box sx={{ p: 3 }}>
          <Text sx={{ mb: 3, color: 'fg.muted' }}>
            カラムの表示・非表示、幅の調整、削除を行えます。
          </Text>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {columns.map((column) => (
              <Box
                key={column.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
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

                <IconButton
                  aria-label={column.visible ? 'カラムを非表示' : 'カラムを表示'}
                  icon={column.visible ? EyeIcon : EyeClosedIcon}
                  variant="invisible"
                  size="small"
                  onClick={() => toggleColumnVisibility(column.id)}
                />

                <Box sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: 'semibold' }}>
                    {column.label}
                  </Text>
                  <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                    {column.type} • {column.id}
                  </Text>
                </Box>

                <FormControl>
                  <FormControl.Label visuallyHidden>幅</FormControl.Label>
                  <TextInput
                    value={column.width}
                    onChange={(e) => handleWidthChange(column.id, e.target.value)}
                    placeholder="幅"
                    size="small"
                    sx={{ width: '100px' }}
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
        </Box>
        </Dialog>
      )}
    </>
  );
};

export default TableColumnManager;