import React, { useState } from 'react';
import { Button, TextInput, Select, Header as PrimerHeader, Heading, Label } from '@primer/react';
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
    <PrimerHeader>
      <PrimerHeader.Item full>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ProjectIcon size={16} />
            <Heading sx={{ fontSize: 3, margin: 0 }}>Kanban App</Heading>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditingBoardName ? (
              <>
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
                  sx={{ width: '200px' }}
                />
                <Button onClick={handleSaveBoardName} size="small">
                  保存
                </Button>
                <Button onClick={handleCancelEditBoardName} size="small">
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <Select value={state.currentBoard?.id || ''} onChange={(e) => setCurrentBoard(e.target.value)}>
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
                  />
                )}
              </>
            )}
          </div>
        </div>
      </PrimerHeader.Item>
      
      <PrimerHeader.Item>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCreatingBoard ? (
            <>
              <TextInput
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="新しいボード名"
                autoFocus
                sx={{ width: '200px' }}
              />
              <Button onClick={handleCreateBoard}>
                作成
              </Button>
              <Button onClick={handleCancelCreate}>
                キャンセル
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsCreatingBoard(true)}>
              + 新しいボード
            </Button>
          )}
          
          <Label variant="secondary" size="small">
            オフライン対応
          </Label>
        </div>
      </PrimerHeader.Item>
    </PrimerHeader>
  );
};

export default Header;