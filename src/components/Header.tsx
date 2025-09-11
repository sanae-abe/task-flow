import React, { useState } from 'react';
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
    <header className="pulse-card pulse-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center pulse-board-title-edit">
          <h1 className="pulse-h3 pulse-board-title">
            📋 Kanban App
          </h1>
          
          <div className="flex items-center pulse-form-actions">
            {isEditingBoardName ? (
              <div className="flex items-center pulse-form-actions">
                <input
                  type="text"
                  value={editingBoardName}
                  onChange={(e) => setEditingBoardName(e.target.value)}
                  className="pulse-input pulse-input-wide"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveBoardName();
                    }
                    if (e.key === 'Escape') {
                      handleCancelEditBoardName();
                    }
                  }}
                />
                <button
                  onClick={handleSaveBoardName}
                  className="pulse-button pulse-button-primary pulse-button-small"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEditBoardName}
                  className="pulse-button pulse-button-secondary pulse-button-small"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center pulse-form-actions">
                <select
                  value={state.currentBoard?.id || ''}
                  onChange={(e) => setCurrentBoard(e.target.value)}
                  className="pulse-input pulse-select-wide"
                >
                  <option value="">ボードを選択</option>
                  {state.boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.title}
                    </option>
                  ))}
                </select>
                {state.currentBoard && (
                  <button
                    onClick={handleEditBoardName}
                    className="pulse-button pulse-button-secondary pulse-icon-button"
                    title="ボード名を編集"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center pulse-form-actions">
          {isCreatingBoard ? (
            <div className="flex items-center pulse-form-actions">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="新しいボード名"
                className="pulse-input pulse-input-wide"
                autoFocus
              />
              <button
                onClick={handleCreateBoard}
                className="pulse-button pulse-button-primary"
              >
                作成
              </button>
              <button
                onClick={handleCancelCreate}
                className="pulse-button pulse-button-secondary"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingBoard(true)}
              className="pulse-button pulse-button-primary"
            >
              + 新しいボード
            </button>
          )}
          
          <div className="pulse-micro">
            オフライン対応
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;