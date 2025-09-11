import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { KanbanBoard, Column, Task, Label, SubTask } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';

interface KanbanState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
}

type KanbanAction =
  | { type: 'LOAD_BOARDS'; payload: KanbanBoard[] }
  | { type: 'CREATE_BOARD'; payload: { title: string } }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<KanbanBoard> } }
  | { type: 'DELETE_BOARD'; payload: { boardId: string } }
  | { type: 'CREATE_COLUMN'; payload: { boardId: string; title: string } }
  | { type: 'CREATE_TASK'; payload: { columnId: string; title: string; description: string; dueDate?: Date; labels?: Label[] } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: string; targetColumnId: string; targetIndex: number } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: string; columnId: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'CLEAR_COMPLETED_TASKS' }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; title: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subTaskId: string } }
  | { type: 'DELETE_SUBTASK'; payload: { taskId: string; subTaskId: string } };

interface KanbanContextType {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  createColumn: (title: string) => void;
  createTask: (columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[]) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  clearCompletedTasks: () => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  switch (action.type) {
    case 'LOAD_BOARDS': {
      const boards = action.payload;
      let currentBoard: KanbanBoard | null = null;
      
      if (boards.length > 0) {
        const savedCurrentBoardId = localStorage.getItem('current-board-id');
        if (savedCurrentBoardId) {
          currentBoard = boards.find(board => board.id === savedCurrentBoardId) || boards[0] || null;
        } else {
          currentBoard = boards[0] || null;
        }
      }
      
      return {
        ...state,
        boards,
        currentBoard,
      };
    }
    
    case 'CREATE_BOARD': {
      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title: action.payload.title,
        columns: [
          {
            id: uuidv4(),
            title: 'To Do',
            tasks: [],
            color: '#f6f8fa'
          },
          {
            id: uuidv4(),
            title: 'In Progress',
            tasks: [],
            color: '#fef3c7'
          },
          {
            id: uuidv4(),
            title: 'Complete',
            tasks: [],
            color: '#d1fae5'
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localStorage.setItem('current-board-id', newBoard.id);
      return {
        ...state,
        boards: [...state.boards, newBoard],
        currentBoard: newBoard,
      };
    }
    
    case 'SET_CURRENT_BOARD': {
      const newCurrentBoard = state.boards.find(board => board.id === action.payload) || null;
      if (newCurrentBoard) {
        localStorage.setItem('current-board-id', newCurrentBoard.id);
      }
      return {
        ...state,
        currentBoard: newCurrentBoard,
      };
    }
    
    case 'UPDATE_BOARD': {
      const updatedBoard = state.boards.find(board => board.id === action.payload.boardId);
      if (!updatedBoard) {
        return state;
      }
      
      const newBoard = {
        ...updatedBoard,
        ...action.payload.updates,
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === action.payload.boardId ? newBoard : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.boardId ? newBoard : state.currentBoard,
      };
    }
    
    case 'DELETE_BOARD': {
      const newBoards = state.boards.filter(board => board.id !== action.payload.boardId);
      let newCurrentBoard = state.currentBoard;
      
      if (state.currentBoard?.id === action.payload.boardId) {
        if (newBoards.length > 0) {
          const firstBoard = newBoards[0];
          if (firstBoard) {
            newCurrentBoard = firstBoard;
            localStorage.setItem('current-board-id', firstBoard.id);
          } else {
            newCurrentBoard = null;
            localStorage.removeItem('current-board-id');
          }
        } else {
          newCurrentBoard = null;
          localStorage.removeItem('current-board-id');
        }
      }
      
      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard,
      };
    }
    
    case 'CREATE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }
      
      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload.title,
        tasks: [],
        color: '#f6f8fa',
      };
      
      const updatedBoard = {
        ...state.currentBoard,
        columns: [...state.currentBoard.columns, newColumn],
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }
    
    case 'CREATE_TASK': {
      if (!state.currentBoard) {
        return state;
      }
      
      const newTask: Task = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description,
        dueDate: action.payload.dueDate,
        labels: action.payload.labels,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, tasks: [...column.tasks, newTask] }
            : column
        ),
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }
    
    case 'MOVE_TASK': {
      if (!state.currentBoard) {
        return state;
      }
      
      const { taskId, sourceColumnId, targetColumnId, targetIndex } = action.payload;
      
      let taskToMove: Task | undefined;
      
      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => {
          if (column.id === sourceColumnId) {
            taskToMove = column.tasks.find(task => task.id === taskId);
            return {
              ...column,
              tasks: column.tasks.filter(task => task.id !== taskId),
            };
          }
          return column;
        }).map(column => {
          if (column.id === targetColumnId && taskToMove) {
            const newTasks = [...column.tasks];
            newTasks.splice(targetIndex, 0, { ...taskToMove, updatedAt: new Date() });
            return {
              ...column,
              tasks: newTasks,
            };
          }
          return column;
        }),
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'UPDATE_TASK': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, ...action.payload.updates, updatedAt: new Date() }
              : task
          ),
        })),
        updatedAt: new Date(),
      };

      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'DELETE_TASK': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, tasks: column.tasks.filter(task => task.id !== action.payload.taskId) }
            : column
        ),
        updatedAt: new Date(),
      };

      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'DELETE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.filter(column => column.id !== action.payload.columnId),
        updatedAt: new Date(),
      };

      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'UPDATE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, ...action.payload.updates }
            : column
        ),
        updatedAt: new Date(),
      };

      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }
    
    case 'CLEAR_COMPLETED_TASKS': {
      if (!state.currentBoard) {
        return state;
      }

      // 右端のカラム（完了カラム）のIDを取得
      const rightmostColumnId = state.currentBoard.columns[state.currentBoard.columns.length - 1]?.id;
      
      if (!rightmostColumnId) {
        return state;
      }

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === rightmostColumnId
            ? { ...column, tasks: [] }
            : column
        ),
        updatedAt: new Date(),
      };

      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === state.currentBoard?.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'ADD_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, title } = action.payload;
      const newSubTask: SubTask = {
        id: uuidv4(),
        title,
        completed: false,
        createdAt: new Date()
      };

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [...(task.subTasks || []), newSubTask],
                  updatedAt: new Date()
                }
              : task
          )
        })),
        updatedAt: new Date()
      };

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard
      };
    }

    case 'TOGGLE_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, subTaskId } = action.payload;

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks?.map(subTask =>
                    subTask.id === subTaskId
                      ? { ...subTask, completed: !subTask.completed }
                      : subTask
                  ),
                  updatedAt: new Date()
                }
              : task
          )
        })),
        updatedAt: new Date()
      };

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard
      };
    }

    case 'DELETE_SUBTASK': {
      if (!state.currentBoard) {
        return state;
      }

      const { taskId, subTaskId } = action.payload;

      const updatedBoard = {
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks?.filter(subTask => subTask.id !== subTaskId),
                  updatedAt: new Date()
                }
              : task
          )
        })),
        updatedAt: new Date()
      };

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard
      };
    }
    
    default:
      return state;
  }
};

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, {
    boards: [],
    currentBoard: null,
  });
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      return;
    }
    
    const boards = loadBoards();
    
    if (boards.length === 0) {
      const defaultBoard: KanbanBoard = {
        id: uuidv4(),
        title: 'マイプロジェクト',
        columns: [
          {
            id: uuidv4(),
            title: 'To Do',
            tasks: [
              {
                id: uuidv4(),
                title: 'プロジェクトの企画',
                description: 'プロジェクトの目標と要件を明確にする',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#f6f8fa'
          },
          {
            id: uuidv4(),
            title: 'In Progress',
            tasks: [
              {
                id: uuidv4(),
                title: 'UIデザインの作成',
                description: 'ユーザーインターフェースのデザインを作成中',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#fef3c7'
          },
          {
            id: uuidv4(),
            title: 'Done',
            tasks: [
              {
                id: uuidv4(),
                title: '技術調査',
                description: '使用するフレームワークや技術の調査完了',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            color: '#d1fae5'
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const initialBoards = [defaultBoard];
      localStorage.setItem('current-board-id', defaultBoard.id);
      saveBoards(initialBoards, defaultBoard.id);
      dispatch({ type: 'LOAD_BOARDS', payload: initialBoards });
    } else {
      dispatch({ type: 'LOAD_BOARDS', payload: boards });
    }
    
    setIsInitialized(true);
  }, [isInitialized]);
  
  useEffect(() => {
    if (isInitialized && state.boards.length > 0) {
      saveBoards(state.boards, state.currentBoard?.id);
    }
  }, [state.boards, state.currentBoard, isInitialized]);
  
  const createBoard = (title: string) => {
    dispatch({ type: 'CREATE_BOARD', payload: { title } });
  };
  
  const setCurrentBoard = (boardId: string) => {
    localStorage.setItem('current-board-id', boardId);
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  };

  const updateBoard = (boardId: string, updates: Partial<KanbanBoard>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
  };

  const deleteBoard = (boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
  };
  
  const createColumn = (title: string) => {
    if (!state.currentBoard) {
      return;
    }
    dispatch({ type: 'CREATE_COLUMN', payload: { boardId: state.currentBoard.id, title } });
  };
  
  const createTask = (columnId: string, title: string, description: string, dueDate?: Date, labels?: Label[]) => {
    dispatch({ type: 'CREATE_TASK', payload: { columnId, title, description, dueDate, labels } });
  };
  
  const moveTask = (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, sourceColumnId, targetColumnId, targetIndex } });
  };
  
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  };
  
  const deleteTask = (taskId: string, columnId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { taskId, columnId } });
  };
  
  const deleteColumn = (columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
  };
  
  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
  };

  const clearCompletedTasks = () => {
    dispatch({ type: 'CLEAR_COMPLETED_TASKS' });
  };

  const addSubTask = (taskId: string, title: string) => {
    dispatch({ type: 'ADD_SUBTASK', payload: { taskId, title } });
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subTaskId } });
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subTaskId } });
  };
  
  return (
    <KanbanContext.Provider
      value={{
        state,
        dispatch,
        createBoard,
        setCurrentBoard,
        updateBoard,
        deleteBoard,
        createColumn,
        createTask,
        moveTask,
        updateTask,
        deleteTask,
        deleteColumn,
        updateColumn,
        clearCompletedTasks,
        addSubTask,
        toggleSubTask,
        deleteSubTask,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = (): KanbanContextType => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};