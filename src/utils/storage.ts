import type {
  KanbanBoard,
  Priority,
  Label,
  SubTask,
  FileAttachment,
} from "../types";
import { logger } from "./logger";
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = "kanban-boards";
const DEMO_BACKUP_KEY = "kanban-demo-backup";
const DEMO_BOARD_FLAG = "__DEMO_BOARD__";

interface StoredTask {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: Priority;
  files?: FileAttachment[];
  subTasks?: SubTask[];
  completedAt?: string | null;
  labels?: Label[];
}

interface StoredColumn {
  id: string;
  title: string;
  tasks: StoredTask[];
}

interface StoredBoard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns: StoredColumn[];
  labels?: Label[];
}

export const saveBoards = (
  boards: KanbanBoard[],
  currentBoardId?: string,
): void => {
  try {
    logger.debug("💾 Saving boards to localStorage:", boards.length, "boards");
    
    // デモボードが削除されていないかチェック
    const hasDemoBoard = boards.some((board) => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]);
    
    if (!hasDemoBoard) {
      // デモボードが削除されている場合、バックアップから復元を試行
      logger.warn("Demo board missing, attempting to restore from backup");
      try {
        const demoBackup = localStorage.getItem(DEMO_BACKUP_KEY);
        if (demoBackup) {
          const backupBoards = JSON.parse(demoBackup);
          if (Array.isArray(backupBoards) && backupBoards.length > 0) {
            // デモボードを先頭に追加（既存のボードは保持）
            const restoredBoards = [...backupBoards, ...boards];
            logger.info("📖 Demo board restored from backup");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredBoards));
            if (currentBoardId) {
              localStorage.setItem("current-board-id", currentBoardId);
            }
            return;
          }
        }
      } catch (backupError) {
        logger.warn("Failed to restore demo board from backup:", backupError);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    if (currentBoardId) {
      localStorage.setItem("current-board-id", currentBoardId);
    }
  } catch (error) {
    logger.warn("Failed to save boards to localStorage:", error);
  }
};;

export const loadBoards = (): KanbanBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    logger.debug(
      "📖 Loading boards from localStorage:",
      stored ? "found data" : "no data",
    );
    
    if (!stored) {
      // ローカルストレージにデータがない場合、デモデータを作成
      logger.debug("📖 Creating demo data for new user");
      return createDemoBoard();
    }

    const boards = JSON.parse(stored);
    if (!Array.isArray(boards)) {
      logger.warn("Invalid boards data in localStorage");
      return createDemoBoard();
    }
    logger.debug("📖 Loaded", boards.length, "boards from localStorage");

    return boards.map((board: StoredBoard) => ({
      ...board,
      labels: board.labels || [],
      createdAt:
        typeof board.createdAt === "string"
          ? board.createdAt
          : new Date(board.createdAt).toISOString(),
      updatedAt:
        typeof board.updatedAt === "string"
          ? board.updatedAt
          : new Date(board.updatedAt).toISOString(),
      columns: board.columns.map((column: StoredColumn) => ({
        ...column,
        tasks: column.tasks.map((task: StoredTask) => ({
          ...task,
          priority: task.priority,
          files: task.files || [],
          subTasks: task.subTasks || [],
          completedAt: task.completedAt || null,
          labels: task.labels || [],
          createdAt:
            typeof task.createdAt === "string"
              ? task.createdAt
              : new Date(task.createdAt).toISOString(),
          updatedAt:
            typeof task.updatedAt === "string"
              ? task.updatedAt
              : new Date(task.updatedAt).toISOString(),
          dueDate: task.dueDate
            ? typeof task.dueDate === "string"
              ? task.dueDate
              : new Date(task.dueDate).toISOString()
            : null,
        })),
      })),
    }));
  } catch (error) {
    logger.warn("Failed to load boards from localStorage:", error);
    return createDemoBoard();
  }
};;

/**
 * デモボードを作成する関数
 */
const createDemoBoard = (): KanbanBoard[] => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  yesterday.setHours(17, 0, 0, 0); // 昨日の17:00

  const todayEvening = new Date(today);
  todayEvening.setHours(18, 0, 0, 0); // 今日の18:00

  const tomorrowMorning = new Date(today.getTime() + 86400000);
  tomorrowMorning.setHours(10, 0, 0, 0); // 明日の10:00

  // デモ用ラベル
  const labels: Label[] = [
    { id: uuidv4(), name: 'セキュリティ', color: '#d1242f' },
    { id: uuidv4(), name: '機能改善', color: '#1a7f37' },
    { id: uuidv4(), name: 'バグ修正', color: '#656d76' },
    { id: uuidv4(), name: 'ドキュメント', color: '#0969da' }
  ];

  const demoBoard: KanbanBoard = {
    id: uuidv4(),
    title: 'TaskFlow デモプロジェクト',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    labels,
    deletionState: "active",
    deletedAt: null,
    // @ts-ignore デモデータ識別フラグ
    [DEMO_BOARD_FLAG]: true,
    columns: [
      {
        id: uuidv4(),
        title: '📝 未着手',
        deletionState: "active",
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'TaskFlow リッチテキスト機能の実装',
            description: `<p>TaskFlowアプリにリッチテキスト編集機能を追加する。</p><p><strong>要件：</strong></p><ul><li>太字、斜体、下線のサポート</li><li>リンク挿入機能</li><li>コードブロック対応</li><li>HTML出力とMarkdown変換</li></ul><p><strong>技術調査：</strong></p><ul><li><a href="https://lexical.dev/" target="_blank" rel="noopener noreferrer">Lexical Editor</a> - Meta製の高性能エディタ</li><li><a href="https://quilljs.com/" target="_blank" rel="noopener noreferrer">React Quill</a> - 軽量なリッチテキストエディタ</li></ul><p><code style="background-color: rgb(245 245 245); color: #e01e5a; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.875em; border: 1px solid #d0d7de;">npm install @lexical/react lexical</code></p><div style="margin: 0 0 8px; border-radius: 6px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: rgb(245 245 245);"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none;" contenteditable="true" spellcheck="false">// エディタコンポーネントの基本実装<br>import { LexicalComposer } from '@lexical/react/LexicalComposer';<br>import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';<br><br>const RichTextEditor = () =&gt; {<br>  return (<br>    &lt;LexicalComposer initialConfig={config}&gt;<br>      &lt;RichTextPlugin /&gt;<br>    &lt;/LexicalComposer&gt;<br>  );<br>};</pre></div>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: yesterday.toISOString(), // 昨日の17:00(期限切れ)
            priority: 'high' as Priority,
            labels: [labels[1], labels[2]].filter((label): label is Label => Boolean(label)), // 機能改善 + バグ修正
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
            description: `<p>チーム進捗と課題を整理した週次レポートの作成と共有。</p><p><strong>レポート内容：</strong></p><ul><li>完了タスクと進捗状況</li><li>発生した課題と解決策</li><li>来週の計画と目標</li></ul><p><strong>共有方法：</strong></p><div style="margin: 0 0 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: rgb(245 245 245);"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// レポート自動生成スクリプト例
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
            labels: [labels[3]].filter((label): label is Label => Boolean(label)), // ドキュメント
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
        deletionState: "active",
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'UI/UXデザイン改善',
            description: `<p>ユーザビリティテストの結果を基にインターフェースを改善。</p><p><strong>改善対象：</strong></p><ul><li>タスク作成フローの簡素化</li><li>ナビゲーションの直感性向上</li><li>レスポンシブデザインの最適化</li></ul><p><strong>参考：</strong></p><ul><li><a href="https://material.io/design" target="_blank" rel="noopener noreferrer">Material Design</a></li><li><a href="https://primer.style/" target="_blank" rel="noopener noreferrer">Primer Design System</a></li></ul>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: tomorrowMorning.toISOString(), // 明日の10:00
            priority: 'medium' as Priority,
            labels: [labels[1], labels[3]].filter((label): label is Label => Boolean(label)), // 機能改善 + ドキュメント
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
            description: `<p>データベースクエリの最適化とAPIレスポンス時間の改善。</p><p><strong>対象エンドポイント：</strong></p><ul><li>/api/tasks - タスク一覧取得</li><li>/api/boards - ボード情報取得</li><li>/api/search - 検索機能</li></ul><div style="margin: 0 0 8px; border-radius: 6px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: rgb(245 245 245);"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// クエリ最適化例
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
            labels: [labels[1], labels[2]].filter((label): label is Label => Boolean(label)), // 機能改善 + バグ修正
            files: [],
            subTasks: [],
            completedAt: null,
          }
        ]
      },
      {
        id: uuidv4(),
        title: '✅ 完了',
        deletionState: "active",
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'ユーザー認証システムの実装',
            description: `<p>JWT ベースの認証システムを実装完了。</p><p><strong>実装内容：</strong></p><ul><li>ログイン・ログアウト機能</li><li>トークンベース認証</li><li>パスワードハッシュ化</li></ul><p><strong>使用技術：</strong></p><ul><li><a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">JSON Web Tokens</a></li><li><a href="https://github.com/kelektiv/node.bcrypt.js" target="_blank" rel="noopener noreferrer">bcrypt</a> - パスワードハッシュ化</li></ul><div style="margin: 0 0 8px; border-radius: 6px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: rgb(245 245 245);"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// JWT 認証の実装例
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
            labels: [labels[0]].filter((label): label is Label => Boolean(label)), // セキュリティ
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
            labels: [labels[3]].filter((label): label is Label => Boolean(label)),
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

  // デモデータをバックアップストレージに保存
  try {
    localStorage.setItem(DEMO_BACKUP_KEY, JSON.stringify([demoBoard]));
    logger.info("📖 Demo board backup saved successfully");
  } catch (error) {
    logger.warn("Failed to save demo board backup:", error);
  }

  logger.info("📖 Demo board created successfully");
  return [demoBoard];
};;

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("current-board-id");
  } catch (error) {
    logger.warn("Failed to clear localStorage:", error);
  }
};

/**
 * デモデータの存在を確認する関数
 */
export const hasDemoBoard = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const boards = JSON.parse(stored);
    if (!Array.isArray(boards)) {
      return false;
    }

    return boards.some((board) => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]);
  } catch (error) {
    logger.warn("Failed to check demo board existence:", error);
    return false;
  }
};

/**
 * デモデータを強制的に復元する関数
 */
export const restoreDemoBoard = (): KanbanBoard[] => {
  try {
    logger.info("📖 Force restoring demo board");
    
    // 既存のボードを取得
    const existingBoards = loadBoards();
    
    // デモボードが既に存在する場合はそのまま返す
    if (existingBoards.some((board) => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG])) {
      logger.info("📖 Demo board already exists, no restoration needed");
      return existingBoards;
    }
    
    // 新しいデモボードを作成
    const demoBoard = createDemoBoard();
    
    // 既存のボードと結合（デモボードを先頭に配置）
    const allBoards = [...demoBoard, ...existingBoards];
    
    // 保存
    saveBoards(allBoards);
    
    logger.info("📖 Demo board restored successfully");
    return allBoards;
  } catch (error) {
    logger.error("Failed to restore demo board:", error);
    // エラーの場合は既存のボードまたは新しいデモボードを返す
    try {
      const existingBoards = loadBoards();
      return existingBoards.length > 0 ? existingBoards : createDemoBoard();
    } catch {
      return createDemoBoard();
    }
  }
};

/**
 * デモデータが削除されることを防ぐ保護機能
 */
export const protectDemoBoard = (boards: KanbanBoard[]): KanbanBoard[] => {
  const hasDemo = boards.some((board) => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]);

  if (!hasDemo) {
    logger.warn("📖 Demo board protection triggered - restoring demo board");
    return restoreDemoBoard();
  }

  return boards;
};
