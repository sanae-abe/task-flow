import React, { useState } from 'react';
import { Box, Text, Button, TextInput, ActionMenu, ActionList } from '@primer/react';
import { PencilIcon, PlusIcon, CheckIcon, XIcon, TrashIcon, KebabHorizontalIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';

const SubHeader: React.FC = () => {
  const { state, updateBoard, createColumn, deleteBoard } = useKanban();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!state.currentBoard) {
    return null;
  }

  const handleStartEditTitle = () => {
    if (state.currentBoard) {
      setEditTitle(state.currentBoard.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && state.currentBoard) {
      updateBoard(state.currentBoard.id, { title: editTitle.trim() });
      setIsEditingTitle(false);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleStartCreateColumn = () => {
    setIsCreatingColumn(true);
    setNewColumnTitle('');
  };

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle.trim());
      setIsCreatingColumn(false);
      setNewColumnTitle('');
    }
  };

  const handleCancelCreateColumn = () => {
    setIsCreatingColumn(false);
    setNewColumnTitle('');
  };

  const handleDeleteBoard = () => {
    if (state.currentBoard && state.boards.length > 1) {
      deleteBoard(state.currentBoard.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: 'title' | 'column') => {
    if (event.key === 'Enter') {
      if (action === 'title') {
        handleSaveTitle();
      } else {
        handleCreateColumn();
      }
    } else if (event.key === 'Escape') {
      if (action === 'title') {
        handleCancelEdit();
      } else {
        handleCancelCreateColumn();
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '67px',
        left: 0,
        right: 0,
        bg: 'canvas.default',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: 6,
        py: 3,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isEditingTitle ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextInput
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'title')}
              placeholder="ボード名を入力"
              autoFocus
              sx={{ fontSize: 3, fontWeight: 'bold' }}
            />
            <Button
              size="small"
              onClick={handleSaveTitle}
              disabled={!editTitle.trim()}
              sx={{ color: 'fg.onEmphasis !important', bg: 'btn.primary.bg !important' }}
            >
              <CheckIcon size={16} />
            </Button>
            <Button
              size="small"
              onClick={handleCancelEdit}
            >
              <XIcon size={16} />
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Text sx={{ fontSize: 3, fontWeight: 'bold', color: 'fg.default' }}>
              {state.currentBoard.title}
            </Text>
            <ActionMenu>
              <ActionMenu.Anchor>
                <Button
                  size="small"
                  variant="invisible"
                  sx={{ p: 1 }}
                >
                  <KebabHorizontalIcon size={16} />
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item onSelect={handleStartEditTitle}>
                    <ActionList.LeadingVisual>
                      <PencilIcon size={16} />
                    </ActionList.LeadingVisual>
                    ボード名を編集
                  </ActionList.Item>
                  {state.boards.length > 1 && (
                    <ActionList.Item
                      variant="danger"
                      onSelect={() => setShowDeleteConfirm(true)}
                    >
                      <ActionList.LeadingVisual>
                        <TrashIcon size={16} />
                      </ActionList.LeadingVisual>
                      ボードを削除
                    </ActionList.Item>
                  )}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        )}
      </Box>

      <Box>
        {isCreatingColumn ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextInput
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'column')}
              placeholder="カラム名を入力"
              autoFocus
              size="small"
            />
            <Button
              size="small"
              onClick={handleCreateColumn}
              disabled={!newColumnTitle.trim()}
              sx={{ color: 'fg.onEmphasis !important', bg: 'btn.primary.bg !important' }}
            >
              <CheckIcon size={16} />
            </Button>
            <Button
              size="small"
              onClick={handleCancelCreateColumn}
            >
              <XIcon size={16} />
            </Button>
          </Box>
        ) : (
          <Button
            size="small"
            variant="primary"
            onClick={handleStartCreateColumn}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'fg.onEmphasis !important'
            }}
          >
            <PlusIcon size={16} />
            カラムを追加
          </Button>
        )}
      </Box>

      {showDeleteConfirm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: 'primer.canvas.backdrop',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <Box
            sx={{
              bg: 'canvas.default',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              p: 4,
              maxWidth: '400px',
              width: '90%',
              boxShadow: 'shadow.large'
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Text sx={{ fontSize: 2, fontWeight: 'bold', mb: 2, display: 'block' }}>
              プロジェクトを削除
            </Text>
            <Text sx={{ color: 'fg.muted', mb: 3, display: 'block' }}>
              「{state.currentBoard?.title}」を削除しますか？この操作は元に戻せません。
            </Text>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                size="small"
                variant="danger"
                onClick={handleDeleteBoard}
              >
                削除
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SubHeader;