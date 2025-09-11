import React, { useState } from 'react';
import { Button, TextInput, Select, Box, Heading, Label } from '@primer/react';
import { ProjectIcon, PencilIcon } from '@primer/octicons-react';
import { useKanban } from '../contexts/KanbanContext';

const Header: React.FC = () => {
  const { state, createBoard, setCurrentBoard, updateBoard } = useKanban();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editingBoardName, setEditingBoardName] = useState('');
  
  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreatingBoard(false);
    }
  };
  
  const handleCancelCreate = () => {
    setNewBoardTitle('');
    setIsCreatingBoard(false);
  };

  const handleEditBoardName = () => {
    if (!state.currentBoard) {
      return;
    }
    setEditingBoardName(state.currentBoard.title);
    setIsEditingBoardName(true);
  };

  const handleSaveBoardName = () => {
    if (!state.currentBoard || !editingBoardName.trim()) {
      return;
    }
    updateBoard(state.currentBoard.id, { title: editingBoardName.trim() });
    setIsEditingBoardName(false);
    setEditingBoardName('');
  };

  const handleCancelEditBoardName = () => {
    setIsEditingBoardName(false);
    setEditingBoardName('');
  };
  
  return (
    <Box
      sx={{
        px: 4,
        py: 3,
        bg: 'canvas.default',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid',
        borderColor: 'border.default'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <ProjectIcon size={20} />
            </Box>
            <Heading sx={{ fontSize: 3, margin: 0, color: 'fg.default', fontWeight: '600' }}>
              Projects
            </Heading>
          </Box>
          
          <Box sx={{ height: '24px', width: '1px', backgroundColor: 'border.muted' }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isEditingBoardName ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextInput
                  value={editingBoardName}
                  onChange={(e) => setEditingBoardName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveBoardName();
                    }
                    if (e.key === 'Escape') {
                      handleCancelEditBoardName();
                    }
                  }}
                  sx={{ 
                    minWidth: '200px',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 2,
                    fontWeight: '500',
                    '&:focus': {
                      backgroundColor: 'canvas.subtle',
                      border: '1px solid',
                      borderColor: 'accent.emphasis'
                    }
                  }}
                />
                <Button onClick={handleSaveBoardName} size="small" variant="primary">
                  保存
                </Button>
                <Button onClick={handleCancelEditBoardName} size="small">
                  キャンセル
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select 
                  value={state.currentBoard?.id || ''} 
                  onChange={(e) => setCurrentBoard(e.target.value)}
                  sx={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 2,
                    fontWeight: '500',
                    '&:focus': {
                      backgroundColor: 'canvas.subtle',
                      border: '1px solid',
                      borderColor: 'accent.emphasis'
                    }
                  }}
                >
                  <Select.Option value="">ボードを選択</Select.Option>
                  {state.boards.map((board) => (
                    <Select.Option key={board.id} value={board.id}>
                      {board.title}
                    </Select.Option>
                  ))}
                </Select>
                {state.currentBoard && (
                  <Button
                    onClick={handleEditBoardName}
                    variant="invisible"
                    size="small"
                    leadingVisual={PencilIcon}
                    aria-label="ボード名を編集"
                    sx={{ 
                      color: 'fg.muted',
                      '&:hover': { color: 'accent.fg' }
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {isCreatingBoard ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextInput
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="新しいボード名"
                autoFocus
                sx={{ minWidth: '200px' }}
              />
              <Button onClick={handleCreateBoard} variant="primary">
                作成
              </Button>
              <Button onClick={handleCancelCreate}>
                キャンセル
              </Button>
            </Box>
          ) : (
            <Button 
              onClick={() => setIsCreatingBoard(true)}
              variant="primary"
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                fontWeight: '500',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e084fc 0%, #e8506a 100%)'
                }
              }}
            >
              + 新しいボード
            </Button>
          )}
          
          <Label 
            variant="secondary" 
            size="small"
            sx={{
              backgroundColor: 'success.subtle',
              color: 'success.fg',
              border: '1px solid',
              borderColor: 'success.muted',
              fontWeight: '500'
            }}
          >
            オフライン対応
          </Label>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;