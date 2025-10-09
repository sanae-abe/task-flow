import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { KanbanBoard, Column, Priority } from '../types';
import { saveBoards, loadBoards } from '../utils/storage';
import { useNotify } from './NotificationContext';
import { logger } from '../utils/logger';

interface BoardState {
  boards: KanbanBoard[];
  currentBoard: KanbanBoard | null;
}

type BoardAction =
  | { type: 'LOAD_BOARDS'; payload: KanbanBoard[] }
  | { type: 'CREATE_BOARD'; payload: { title: string } }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'UPDATE_BOARD'; payload: { boardId: string; updates: Partial<KanbanBoard> } }
  | { type: 'DELETE_BOARD'; payload: { boardId: string } }
  | { type: 'CREATE_COLUMN'; payload: { boardId: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'IMPORT_BOARDS'; payload: { boards: KanbanBoard[]; replaceAll?: boolean } }
  | { type: 'REORDER_BOARDS'; payload: { boards: KanbanBoard[] } };

interface BoardContextType {
  state: BoardState;
  currentBoard: KanbanBoard | null;
  dispatch: React.Dispatch<BoardAction>;
  createBoard: (title: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  createColumn: (title: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  importBoards: (boards: KanbanBoard[], replaceAll?: boolean) => void;
  reorderBoards: (boards: KanbanBoard[]) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

// ヘルパー関数: ボードのupdatedAtを更新
const updateBoardTimestamp = (board: KanbanBoard): KanbanBoard => ({
  ...board,
  updatedAt: new Date().toISOString(),
});

// ヘルパー関数: LocalStorageのcurrent-board-idを安全に管理
const updateCurrentBoardId = (boardId: string | null) => {
  try {
    if (boardId) {
      localStorage.setItem('current-board-id', boardId);
    } else {
      localStorage.removeItem('current-board-id');
    }
  } catch (error) {
    logger.warn('Failed to update current board ID in localStorage:', error);
  }
};

const getCurrentBoardId = (): string | null => {
  try {
    return localStorage.getItem('current-board-id');
  } catch (error) {
    logger.warn('Failed to get current board ID from localStorage:', error);
    return null;
  }
};

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'LOAD_BOARDS': {
      const boards = action.payload;

      // 保存された現在のボードIDを取得
      const savedCurrentBoardId = getCurrentBoardId();
      const currentBoard = savedCurrentBoardId
        ? (boards.find(board => board.id === savedCurrentBoardId) || null)
        : (boards.length > 0 ? boards[0] : null);

      // 現在のボードIDが無効な場合は更新
      if (currentBoard && currentBoard.id !== savedCurrentBoardId) {
        updateCurrentBoardId(currentBoard.id);
      }

      return {
        ...state,
        boards,
        currentBoard: currentBoard as KanbanBoard | null,
      };
    }

    case 'CREATE_BOARD': {
      const newBoard: KanbanBoard = {
        id: uuidv4(),
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        columns: [
          { id: uuidv4(), title: 'To Do', tasks: [] },
          { id: uuidv4(), title: 'In Progress', tasks: [] },
          { id: uuidv4(), title: 'Done', tasks: [] },
        ],
        labels: [],
      };

      const newBoards = [...state.boards, newBoard];

      return {
        ...state,
        boards: newBoards,
        currentBoard: newBoard,
      };
    }

    case 'SET_CURRENT_BOARD': {
      const newCurrentBoard = state.boards.find(board => board.id === action.payload) || null;

      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        currentBoard: newCurrentBoard as KanbanBoard | null,
      };
    }

    case 'UPDATE_BOARD': {
      const boardToUpdate = state.boards.find(board => board.id === action.payload.boardId);
      if (!boardToUpdate) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...boardToUpdate,
        ...action.payload.updates,
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: state.currentBoard?.id === updatedBoard.id ? updatedBoard : state.currentBoard,
      };
    }

    case 'DELETE_BOARD': {
      const newBoards = state.boards.filter(board => board.id !== action.payload.boardId);

      let newCurrentBoard: KanbanBoard | null = state.currentBoard;
      if (state.currentBoard?.id === action.payload.boardId) {
        newCurrentBoard = (newBoards.length > 0 ? newBoards[0] : null) as KanbanBoard | null;
        updateCurrentBoardId(newCurrentBoard?.id ?? null);
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard as KanbanBoard | null,
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
      };

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: [...state.currentBoard.columns, newColumn],
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'DELETE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.filter(column => column.id !== action.payload.columnId),
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'UPDATE_COLUMN': {
      if (!state.currentBoard) {
        return state;
      }

      const updatedBoard = updateBoardTimestamp({
        ...state.currentBoard,
        columns: state.currentBoard.columns.map(column =>
          column.id === action.payload.columnId
            ? { ...column, ...action.payload.updates }
            : column
        ),
      });

      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
        currentBoard: updatedBoard,
      };
    }

    case 'IMPORT_BOARDS': {
      const { boards: importedBoards, replaceAll = false } = action.payload;

      // IDの重複をチェックして新しいIDを生成
      const existingBoardIds = new Set(state.boards.map(board => board.id));
      const boardsToImport = importedBoards.map(board => {
        if (existingBoardIds.has(board.id)) {
          return {
            ...board,
            id: uuidv4(),
            title: `${board.title} (インポート)`,
            updatedAt: new Date().toISOString(),
          };
        }
        return board;
      });

      const newBoards = replaceAll ? boardsToImport : [...state.boards, ...boardsToImport];
      const newCurrentBoard = newBoards.length > 0 ? newBoards[0] : null;

      if (newCurrentBoard) {
        updateCurrentBoardId(newCurrentBoard.id);
      }

      return {
        ...state,
        boards: newBoards,
        currentBoard: newCurrentBoard as KanbanBoard | null,
      };
    }

    case 'REORDER_BOARDS': {
      const { boards: reorderedBoards } = action.payload;
      
      return {
        ...state,
        boards: reorderedBoards,
      };
    }

    default:
      return state;
  }
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const notify = useNotify();

  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    currentBoard: null,
  });

  // 初期データの読み込み
  useEffect(() => {
    const loadInitialData = () => {
      try {
        const boards = loadBoards();
        
        // ボードが空の場合はデフォルトボードを作成
        if (boards.length === 0) {
          const today = new Date();

          // 昨日の17:00
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          yesterday.setHours(17, 0, 0, 0);

          // 今日の18:00
          const todayEvening = new Date(today);
          todayEvening.setHours(18, 0, 0, 0);

          // 明日の10:00
          const tomorrowMorning = new Date(today);
          tomorrowMorning.setDate(today.getDate() + 1);
          tomorrowMorning.setHours(10, 0, 0, 0);

          // 3日後の15:00
          const threeDaysLater = new Date(today);
          threeDaysLater.setDate(today.getDate() + 3);
          threeDaysLater.setHours(15, 0, 0, 0);

          // 来週の14:00
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          nextWeek.setHours(14, 0, 0, 0);

          // デモ用ラベル
          const labels = [
            { id: uuidv4(), name: '緊急', color: '#d1242f' },
            { id: uuidv4(), name: '機能改善', color: '#1a7f37' },
            { id: uuidv4(), name: 'バグ修正', color: '#656d76' },
            { id: uuidv4(), name: 'ドキュメント', color: '#0969da' }
          ];

          const defaultBoard: KanbanBoard = {
            id: uuidv4(),
            title: 'TaskFlow デモプロジェクト',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            labels,
            columns: [
              {
                id: uuidv4(),
                title: '📝 未着手',
                tasks: [
                  {
                    id: uuidv4(),
                    title: 'TaskFlow リッチテキスト機能の実装',
                    description: `<p>TaskFlowアプリにリッチテキスト編集機能を追加する。</p><p><strong>要件：</strong></p><ul><li>太字、斜体、下線のサポート</li><li>リンク挿入機能</li><li>コードブロック対応</li><li>HTML出力とMarkdown変換</li></ul><p><strong>技術調査：</strong></p><ul><li><a href="https://lexical.dev/" target="_blank" rel="noopener noreferrer">Lexical Editor</a> - Meta製の高性能エディタ</li><li><a href="https://quilljs.com/" target="_blank" rel="noopener noreferrer">React Quill</a> - 軽量なリッチテキストエディタ</li></ul><p><code style="background-color: #e8f5e8; color: #e01e5a; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.875em; border: 1px solid #d1d9e0;">npm install @lexical/react lexical</code></p><div style="margin: 0 0 8px; border: 1px solid #d0d7de !important; border-radius: 6px; padding: 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: #f6f8fa;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// エディタコンポーネントの基本実装
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

const RichTextEditor = () => {
  return (
    <LexicalComposer initialConfig={config}>
      <RichTextPlugin />
    </LexicalComposer>
  );
};</pre></div>`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    dueDate: yesterday.toISOString(), // 昨日の17:00(期限切れ)
                    priority: 'high' as Priority,
                    labels: [labels[1]!, labels[2]!], // 機能改善 + バグ修正
                    files: [],
                    subTasks: [
                      { id: uuidv4(), title: 'Lexical vs Quill 技術調査', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'プロトタイプ作成', completed: false, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'ユニットテスト作成', completed: false, createdAt: new Date().toISOString() }
                    ],
                    completedAt: null,
                  },
                  {
                    id: uuidv4(),
                    title: '週次レポートの作成',
                    description: `<p>チーム進捗と課題を整理した週次レポートの作成と共有。</p><p><strong>レポート内容：</strong></p><ul><li>完了タスクと進捗状況</li><li>発生した課題と解決策</li><li>来週の計画と目標</li></ul><p><strong>共有方法：</strong></p><div style="margin: 0 0 8px; border: 1px solid #d0d7de !important; border-radius: 6px; padding: 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: #f6f8fa;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// レポート自動生成スクリプト例
const generateWeeklyReport = () => {
  const completedTasks = getCompletedTasks(lastWeek);
  const upcomingTasks = getUpcomingTasks(nextWeek);

  return {
    period: getWeekRange(),
    completed: completedTasks,
    upcoming: upcomingTasks,
    issues: getIssues()
  };
};</pre></div>`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    dueDate: todayEvening.toISOString(), // 今日の18:00
                    priority: 'medium' as Priority,
                    labels: [labels[3]!], // ドキュメント
                    files: [],
                    subTasks: [
                      { id: uuidv4(), title: 'タスク完了状況の集計', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: '課題とブロッカーの整理', completed: false, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'レポート作成と共有', completed: false, createdAt: new Date().toISOString() }
                    ],
                    completedAt: null,
                    recurrence: {
                      enabled: true,
                      pattern: 'weekly',
                      interval: 1,
                      endDate: undefined
                    }
                  }
                ]
              },
              {
                id: uuidv4(),
                title: '🚀 進行中',
                tasks: [
                  {
                    id: uuidv4(),
                    title: 'UI/UXデザイン改善',
                    description: `<p>ユーザビリティテストの結果を基にインターフェースを改善。</p><p><strong>改善対象：</strong></p><ul><li>タスク作成フローの簡素化</li><li>ナビゲーションの直感性向上</li><li>レスポンシブデザインの最適化</li></ul><p><strong>参考：</strong></p><ul><li><a href="https://material.io/design" target="_blank" rel="noopener noreferrer">Material Design</a></li><li><a href="https://primer.style/" target="_blank" rel="noopener noreferrer">Primer Design System</a></li></ul>`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    dueDate: tomorrowMorning.toISOString(), // 明日の10:00
                    priority: 'medium' as Priority,
                    labels: [labels[1]!, labels[3]!], // 機能改善 + ドキュメント
                    files: [],
                    subTasks: [
                      { id: uuidv4(), title: 'ユーザビリティテスト分析', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'ワイヤーフレーム作成', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'プロトタイプ実装', completed: false, createdAt: new Date().toISOString() }
                    ],
                    completedAt: null,
                  },
                  {
                    id: uuidv4(),
                    title: 'API エンドポイント最適化',
                    description: `<p>データベースクエリの最適化とAPIレスポンス時間の改善。</p><p><strong>対象エンドポイント：</strong></p><ul><li>/api/tasks - タスク一覧取得</li><li>/api/boards - ボード情報取得</li><li>/api/search - 検索機能</li></ul><div style="margin: 0 0 8px; border: 1px solid #d0d7de !important; border-radius: 6px; padding: 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: #f6f8fa;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// クエリ最適化例
const optimizedQuery = await db.task.findMany({
  select: {
    id: true,
    title: true,
    description: true,
    dueDate: true,
    priority: true,
    labels: { select: { id: true, name: true, color: true } },
    _count: { select: { subTasks: true } }
  },
  where: filters,
  orderBy: { updatedAt: 'desc' }
});</pre></div>`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    dueDate: null, // 期限なし
                    priority: 'high' as Priority,
                    labels: [labels[1]!, labels[2]!], // 機能改善 + バグ修正
                    files: [],
                    subTasks: [],
                    completedAt: null,
                  }
                ]
              },
              {
                id: uuidv4(),
                title: '✅ 完了',
                tasks: [
                  {
                    id: uuidv4(),
                    title: 'ユーザー認証システムの実装',
                    description: `<p>JWT ベースの認証システムを実装完了。</p><p><strong>実装内容：</strong></p><ul><li>ログイン・ログアウト機能</li><li>トークンベース認証</li><li>パスワードハッシュ化</li></ul><p><strong>使用技術：</strong></p><ul><li><a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">JSON Web Tokens</a></li><li><a href="https://github.com/kelektiv/node.bcrypt.js" target="_blank" rel="noopener noreferrer">bcrypt</a> - パスワードハッシュ化</li></ul><div style="margin: 0 0 8px; border: 1px solid #d0d7de !important; border-radius: 6px; padding: 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: #f6f8fa;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// JWT 認証の実装例
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  const isValid = await bcrypt.compare(password, user.password);
  if (isValid) {
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  }
  throw new Error('Invalid credentials');
};</pre></div>`,
                    createdAt: new Date(today.getTime() - 86400000 * 5).toISOString(), // 5日前
                    updatedAt: new Date(today.getTime() - 86400000 * 2).toISOString(), // 2日前
                    dueDate: new Date(today.getTime() - 86400000 * 3).toISOString(),
                    priority: 'high' as Priority,
                    labels: [labels[0]!], // 緊急
                    files: [],
                    subTasks: [
                      { id: uuidv4(), title: 'JWT ライブラリ選定', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'ログイン画面作成', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: '認証ミドルウェア実装', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'セキュリティテスト', completed: true, createdAt: new Date().toISOString() }
                    ],
                    completedAt: new Date(today.getTime() - 86400000 * 2).toISOString()
                  },
                  {
                    id: uuidv4(),
                    title: 'Git ワークフロー標準化',
                    description: `<p>チーム開発効率化のためのGitワークフロー策定。</p><p><strong>策定内容：</strong></p><ul><li>ブランチ戦略（GitHub Flow）</li><li>コミットメッセージ規約</li><li>PR レビュー制度</li></ul><p><strong>参考：</strong></p><ul><li><a href="https://guides.github.com/introduction/flow/" target="_blank" rel="noopener noreferrer">GitHub Flow</a></li><li><a href="https://www.conventionalcommits.org/" target="_blank" rel="noopener noreferrer">Conventional Commits</a></li></ul>`,
                    createdAt: new Date(today.getTime() - 86400000 * 7).toISOString(), // 1週間前
                    updatedAt: new Date(today.getTime() - 86400000 * 1).toISOString(), // 1日前
                    dueDate: null, // 期限なし
                    priority: 'medium' as Priority,
                    labels: [labels[3]!],
                    files: [
                      {
                        id: uuidv4(),
                        name: 'git-workflow-guide.pdf',
                        size: 245760,
                        type: 'application/pdf',
                        data: '',
                        uploadedAt: new Date().toISOString()
                      }
                    ],
                    subTasks: [
                      { id: uuidv4(), title: 'ブランチ戦略ドキュメント作成', completed: true, createdAt: new Date().toISOString() },
                      { id: uuidv4(), title: 'PRテンプレート作成', completed: true, createdAt: new Date().toISOString() }
                    ],
                    completedAt: new Date(today.getTime() - 86400000 * 1).toISOString(),
                  }
                ]
              }
            ]
          };
          
          dispatch({ type: 'LOAD_BOARDS', payload: [defaultBoard] });
          dispatch({ type: 'SET_CURRENT_BOARD', payload: defaultBoard.id });
        } else {
          dispatch({ type: 'LOAD_BOARDS', payload: boards });
          // 最初のボードを現在のボードに設定
          if (boards.length > 0 && boards[0]) {
            dispatch({ type: 'SET_CURRENT_BOARD', payload: boards[0].id });
          }
        }
      } catch (error) {
        logger.error('Failed to load initial board data:', error);
        notify.error('ボードデータの読み込みに失敗しました');
      }
    };

    loadInitialData();
  }, [notify]);

  // データの永続化
  useEffect(() => {
    if (state.boards.length > 0) {
      try {
        saveBoards(state.boards, state.currentBoard?.id);
      } catch (error) {
        logger.error('Failed to save board data:', error);
        notify.error('ボードデータの保存に失敗しました');
      }
    }
  }, [state.boards, state.currentBoard, notify]);

  // メモ化されたアクション関数
  const createBoard = useCallback((title: string) => {
    dispatch({ type: 'CREATE_BOARD', payload: { title } });
    notify.success(`ボード「${title}」を作成しました`);
  }, [notify]);

  const setCurrentBoard = useCallback((boardId: string) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  }, []);

  const updateBoard = useCallback((boardId: string, updates: Partial<KanbanBoard>) => {
    dispatch({ type: 'UPDATE_BOARD', payload: { boardId, updates } });
    notify.success('ボードを更新しました');
  }, [notify]);

  const deleteBoard = useCallback((boardId: string) => {
    const boardToDelete = state.boards.find(board => board.id === boardId);
    if (boardToDelete) {
      dispatch({ type: 'DELETE_BOARD', payload: { boardId } });
      notify.success(`ボード「${boardToDelete.title}」を削除しました`);
    }
  }, [state.boards, notify]);

  const createColumn = useCallback((title: string) => {
    if (!state.currentBoard) {
      notify.error('ボードが選択されていません');
      return;
    }
    dispatch({ type: 'CREATE_COLUMN', payload: { boardId: state.currentBoard.id, title } });
    notify.success(`カラム「${title}」を作成しました`);
  }, [state.currentBoard, notify]);

  const deleteColumn = useCallback((columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
    notify.success('カラムを削除しました');
  }, [notify]);

  const updateColumn = useCallback((columnId: string, updates: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
    notify.success('カラムを更新しました');
  }, [notify]);

  const importBoards = useCallback((boards: KanbanBoard[], replaceAll = false) => {
    dispatch({ type: 'IMPORT_BOARDS', payload: { boards, replaceAll } });
    const message = replaceAll
      ? `${boards.length}個のボードをインポートしました（既存データを置換）`
      : `${boards.length}個のボードをインポートしました`;
    notify.success(message);
  }, [notify]);
  const reorderBoards = useCallback((boards: KanbanBoard[]) => {
    dispatch({ type: 'REORDER_BOARDS', payload: { boards } });
  }, []);

  const exportData = useCallback(() => ({
    boards: state.boards,
    currentBoardId: state.currentBoard?.id || null,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }), [state.boards, state.currentBoard]);

  const value = useMemo(() => ({
    state,
    currentBoard: state.currentBoard,
    dispatch,
    createBoard,
    setCurrentBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    deleteColumn,
    updateColumn,
    importBoards,
    reorderBoards,
    exportData
  }), [state, dispatch, createBoard, setCurrentBoard, updateBoard, deleteBoard, createColumn, deleteColumn, updateColumn, importBoards, reorderBoards, exportData]);

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export default BoardContext;