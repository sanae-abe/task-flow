import type {
  KanbanBoard,
  Priority,
  Label,
  SubTask,
  FileAttachment,
} from '../types';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'kanban-boards';
const DEMO_BACKUP_KEY = 'kanban-demo-backup';
const DEMO_BOARD_FLAG = '__DEMO_BOARD__';

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
  currentBoardId?: string
): void => {
  try {
    logger.debug('💾 Saving boards to localStorage:', boards.length, 'boards');

    // デモボードが削除されていないかチェック
    const hasDemoBoard = boards.some(
      board => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]
    );

    if (!hasDemoBoard) {
      // デモボードが削除されている場合、バックアップから復元を試行
      logger.warn('Demo board missing, attempting to restore from backup');
      try {
        const demoBackup = localStorage.getItem(DEMO_BACKUP_KEY);
        if (demoBackup) {
          const backupBoards = JSON.parse(demoBackup);
          if (Array.isArray(backupBoards) && backupBoards.length > 0) {
            // デモボードを先頭に追加（既存のボードは保持）
            const restoredBoards = [...backupBoards, ...boards];
            logger.info('📖 Demo board restored from backup');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredBoards));
            if (currentBoardId) {
              localStorage.setItem('current-board-id', currentBoardId);
            }
            return;
          }
        }
      } catch (backupError) {
        logger.warn('Failed to restore demo board from backup:', backupError);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    if (currentBoardId) {
      localStorage.setItem('current-board-id', currentBoardId);
    }
  } catch (_error) {
    logger.warn('Failed to save boards to localStorage:', _error);
  }
};

export const loadBoards = (): KanbanBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    logger.debug(
      '📖 Loading boards from localStorage:',
      stored ? 'found data' : 'no data'
    );

    if (!stored) {
      // ローカルストレージにデータがない場合、デモデータを作成
      logger.debug('📖 Creating demo data for new user');
      return createDemoBoard();
    }

    const boards = JSON.parse(stored);
    if (!Array.isArray(boards)) {
      logger.warn('Invalid boards data in localStorage');
      return createDemoBoard();
    }
    logger.debug('📖 Loaded', boards.length, 'boards from localStorage');

    return boards.map((board: StoredBoard) => ({
      ...board,
      labels: board.labels || [],
      createdAt:
        typeof board.createdAt === 'string'
          ? board.createdAt
          : new Date(board.createdAt).toISOString(),
      updatedAt:
        typeof board.updatedAt === 'string'
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
            typeof task.createdAt === 'string'
              ? task.createdAt
              : new Date(task.createdAt).toISOString(),
          updatedAt:
            typeof task.updatedAt === 'string'
              ? task.updatedAt
              : new Date(task.updatedAt).toISOString(),
          dueDate: task.dueDate
            ? typeof task.dueDate === 'string'
              ? task.dueDate
              : new Date(task.dueDate).toISOString()
            : null,
        })),
      })),
    }));
  } catch (_error) {
    logger.warn('Failed to load boards from localStorage:', _error);
    return createDemoBoard();
  }
};

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

  const nextWeek = new Date(today.getTime() + 86400000 * 7);
  nextWeek.setHours(23, 59, 0, 0); // 来週の23:59

  // デモ用ラベル
  const labels: Label[] = [
    { id: uuidv4(), name: 'セキュリティ', color: '#d1242f' },
    { id: uuidv4(), name: '機能追加', color: '#1a7f37' },
    { id: uuidv4(), name: 'バグ修正', color: '#656d76' },
    { id: uuidv4(), name: 'ドキュメント', color: '#0969da' },
    { id: uuidv4(), name: 'パフォーマンス', color: '#8250df' },
  ];

  const demoBoard: KanbanBoard = {
    id: uuidv4(),
    title: 'TaskFlow デモプロジェクト',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    labels,
    deletionState: 'active',
    deletedAt: null,
    // @ts-ignore デモデータ識別フラグ
    [DEMO_BOARD_FLAG]: true,
    columns: [
      {
        id: uuidv4(),
        title: '📝 未着手',
        deletionState: 'active',
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'リッチテキストエディタのシンタックスハイライト対応',
            description: `<p>コードブロックにシンタックスハイライト機能を追加してコードの可読性を向上させる。</p><p><strong>実装要件:</strong></p><ul><li>Prism.jsを使用したシンタックスハイライト</li><li>主要言語のサポート（JavaScript, TypeScript, HTML, CSS, Python等）</li><li>言語選択ドロップダウンの実装</li><li>カスタムテーマのサポート</li></ul><p><strong>技術調査:</strong></p><ul><li><a href="https://prismjs.com/" target="_blank" rel="noopener noreferrer">Prism.js</a> - 軽量で拡張性の高いシンタックスハイライター</li><li><a href="https://highlightjs.org/" target="_blank" rel="noopener noreferrer">Highlight.js</a> - 多言語対応のハイライター</li></ul><p><code style="background-color: var(--muted); color: #e01e5a; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.875em; border: 1px solid #d0d7de;">npm install prismjs @types/prismjs</code></p><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none;" contenteditable="true" spellcheck="false">// Prism.js 基本実装例<br>import Prism from 'prismjs';<br>import 'prismjs/themes/prism-tomorrow.css';<br><br>const highlightCode = (code: string, language: string) => {<br>  return Prism.highlight(<br>    code,<br>    Prism.languages[language],<br>    language<br>  );<br>};</pre>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: yesterday.toISOString(), // 昨日の17:00(期限切れ)
            priority: 'critical' as Priority,
            labels: [labels[1], labels[2], labels[4]].filter(
              (label): label is Label => Boolean(label)
            ), // 機能追加 + バグ修正 + パフォーマンス
            files: [],
            subTasks: [
              {
                id: uuidv4(),
                title: 'Prism.js vs Highlight.js 比較調査',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: '言語セレクターUIの設計',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'シンタックスハイライトの実装',
                completed: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'テーマカスタマイズ機能',
                completed: false,
                createdAt: new Date().toISOString(),
              },
            ],
            completedAt: null,
          },
          {
            id: uuidv4(),
            title: '週次プロジェクトレビューの実施',
            description: `<p>チーム全体で進捗状況を確認し、次週の計画を立てる定例会議。</p><p><strong>アジェンダ:</strong></p><ul><li>先週の完了タスクレビュー</li><li>進行中タスクの状況確認</li><li>ブロッカーと課題の共有</li><li>来週のスプリント計画</li><li>技術的な知見の共有</li></ul><p><strong>準備事項:</strong></p><ul><li>タスク完了率の集計</li><li>各メンバーの進捗レポート</li><li>課題・改善点のリスト化</li></ul>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: todayEvening.toISOString(), // 今日の18:00
            priority: 'high' as Priority,
            labels: [labels[3]].filter((label): label is Label =>
              Boolean(label)
            ), // ドキュメント
            files: [],
            subTasks: [
              {
                id: uuidv4(),
                title: 'タスク完了率の集計',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: '課題リストの作成',
                completed: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: '会議資料の準備',
                completed: false,
                createdAt: new Date().toISOString(),
              },
            ],
            completedAt: null,
            recurrence: {
              enabled: true,
              pattern: 'weekly',
              interval: 1,
              endDate: undefined,
            },
          },
          {
            id: uuidv4(),
            title: 'データベーススキーマ最適化の検討',
            description: `<p>大量データ処理のパフォーマンス向上のため、データベーススキーマの見直しと最適化を行う。</p><p><strong>検討項目:</strong></p><ul><li>インデックス戦略の見直し</li><li>正規化レベルの最適化</li><li>クエリパフォーマンスの改善</li><li>パーティショニングの導入検討</li></ul><p><strong>参考資料:</strong></p><ul><li><a href="https://www.postgresql.org/docs/current/performance-tips.html" target="_blank" rel="noopener noreferrer">PostgreSQL Performance Tips</a></li><li><a href="https://use-the-index-luke.com/" target="_blank" rel="noopener noreferrer">Use The Index, Luke!</a></li></ul>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: null, // 期限なし
            priority: 'medium' as Priority,
            labels: [labels[4]].filter((label): label is Label =>
              Boolean(label)
            ), // パフォーマンス
            files: [
              {
                id: uuidv4(),
                name: 'db-schema-analysis.xlsx',
                size: 128000,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                data: '',
                uploadedAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                name: 'query-performance-report.pdf',
                size: 512000,
                type: 'application/pdf',
                data: '',
                uploadedAt: new Date().toISOString(),
              },
            ],
            subTasks: [],
            completedAt: null,
          },
        ],
      },
      {
        id: uuidv4(),
        title: '🚀 進行中',
        deletionState: 'active',
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'モバイルレスポンシブ対応の改善',
            description: `<p>スマートフォン・タブレットでの使いやすさを向上させるため、レスポンシブデザインを改善。</p><p><strong>対応内容:</strong></p><ul><li>タッチ操作の最適化</li><li>画面サイズに応じたレイアウト調整</li><li>カンバンビューのスワイプ操作対応</li><li>ダイアログ・モーダルのモバイル最適化</li></ul><p><strong>デザインシステム参考:</strong></p><ul><li><a href="https://m3.material.io/" target="_blank" rel="noopener noreferrer">Material Design 3</a></li><li><a href="https://tailwindcss.com/docs/responsive-design" target="_blank" rel="noopener noreferrer">Tailwind Responsive Design</a></li></ul><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// レスポンシブブレークポイント例<br>const breakpoints = {<br>  sm: '640px',  // スマートフォン<br>  md: '768px',  // タブレット<br>  lg: '1024px', // デスクトップ<br>  xl: '1280px'  // 大画面<br>};</pre>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: tomorrowMorning.toISOString(), // 明日の10:00
            priority: 'high' as Priority,
            labels: [labels[1]].filter((label): label is Label =>
              Boolean(label)
            ), // 機能追加
            files: [],
            subTasks: [
              {
                id: uuidv4(),
                title: 'タッチ操作のテスト',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'レイアウト調整実装',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'カンバンビュー最適化',
                completed: false,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: '実機テスト・調整',
                completed: false,
                createdAt: new Date().toISOString(),
              },
            ],
            completedAt: null,
          },
          {
            id: uuidv4(),
            title: 'E2Eテストカバレッジの向上',
            description: `<p>主要な機能フローに対してE2Eテストを追加し、リグレッション防止を強化。</p><p><strong>テスト対象:</strong></p><ul><li>タスク作成・編集・削除フロー</li><li>カンバン操作（ドラッグ&ドロップ）</li><li>フィルタリング・ソート機能</li><li>データインポート・エクスポート</li></ul><p><strong>使用ツール:</strong></p><ul><li><a href="https://playwright.dev/" target="_blank" rel="noopener noreferrer">Playwright</a> - クロスブラウザE2Eテスト</li><li><a href="https://testing-library.com/" target="_blank" rel="noopener noreferrer">Testing Library</a> - ユーザー視点のテスト</li></ul><div style="margin: 0 0 8px; border-radius: 6px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: var(--muted);"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// Playwright E2Eテスト例<br>test('タスク作成フロー', async ({ page }) => {<br>  await page.goto('/');<br>  await page.click('[data-testid="create-task-btn"]');<br>  await page.fill('[name="title"]', '新規タスク');<br>  await page.click('[data-testid="save-btn"]');<br>  await expect(page.locator('text=新規タスク')).toBeVisible();<br>});</pre></div>`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: nextWeek.toISOString(), // 来週の23:59
            priority: 'medium' as Priority,
            labels: [labels[1]].filter((label): label is Label =>
              Boolean(label)
            ), // 機能追加
            files: [],
            subTasks: [],
            completedAt: null,
          },
        ],
      },
      {
        id: uuidv4(),
        title: '✅ 完了',
        deletionState: 'active',
        deletedAt: null,
        tasks: [
          {
            id: uuidv4(),
            title: 'OAuth認証システムの統合',
            description: `<p>Google・GitHub OAuth 2.0認証を統合し、ソーシャルログイン機能を実装。</p><p><strong>実装内容:</strong></p><ul><li>Google OAuth 2.0クライアント設定</li><li>GitHub OAuth Appの作成と設定</li><li>認証フロー実装（Authorization Code Flow）</li><li>セキュアなトークン管理</li><li>ユーザープロフィール情報の取得・保存</li></ul><p><strong>使用技術:</strong></p><ul><li><a href="https://developers.google.com/identity/protocols/oauth2" target="_blank" rel="noopener noreferrer">Google OAuth 2.0</a></li><li><a href="https://docs.github.com/en/apps/oauth-apps" target="_blank" rel="noopener noreferrer">GitHub OAuth Apps</a></li></ul><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">// OAuth認証フロー実装例<br>const handleOAuthCallback = async (code: string, provider: string) => {<br>  const tokenResponse = await exchangeCodeForToken(code, provider);<br>  const userInfo = await fetchUserProfile(tokenResponse.access_token);<br>  const session = await createUserSession(userInfo);<br>  return session;<br>};</pre>`,
            createdAt: new Date(today.getTime() - 86400000 * 5).toISOString(), // 5日前
            updatedAt: new Date(today.getTime() - 86400000 * 2).toISOString(), // 2日前
            dueDate: new Date(today.getTime() - 86400000 * 3).toISOString(),
            priority: 'critical' as Priority,
            labels: [labels[0], labels[1]].filter((label): label is Label =>
              Boolean(label)
            ), // セキュリティ + 機能追加
            files: [],
            subTasks: [
              {
                id: uuidv4(),
                title: 'Google OAuth設定',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'GitHub OAuth設定',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: '認証フロー実装',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'セキュリティ監査',
                completed: true,
                createdAt: new Date().toISOString(),
              },
            ],
            completedAt: new Date(today.getTime() - 86400000 * 2).toISOString(),
          },
          {
            id: uuidv4(),
            title: 'CI/CDパイプライン構築',
            description: `<p>GitHub Actionsを使用した自動テスト・ビルド・デプロイパイプラインの構築完了。</p><p><strong>パイプライン構成:</strong></p><ul><li>プルリクエスト時の自動テスト実行</li><li>コード品質チェック（ESLint, TypeScript）</li><li>ビルド成果物の検証</li><li>mainブランチへのマージ時自動デプロイ</li><li>Slack通知の統合</li></ul><p><strong>参考:</strong></p><ul><li><a href="https://docs.github.com/en/actions" target="_blank" rel="noopener noreferrer">GitHub Actions Documentation</a></li><li><a href="https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions" target="_blank" rel="noopener noreferrer">Deploying with GitHub Actions</a></li></ul>`,
            createdAt: new Date(today.getTime() - 86400000 * 10).toISOString(), // 10日前
            updatedAt: new Date(today.getTime() - 86400000 * 3).toISOString(), // 3日前
            dueDate: null, // 期限なし
            priority: 'high' as Priority,
            labels: [labels[3]].filter((label): label is Label =>
              Boolean(label)
            ), // ドキュメント
            files: [
              {
                id: uuidv4(),
                name: 'ci-cd-setup-guide.md',
                size: 45000,
                type: 'text/markdown',
                data: '',
                uploadedAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                name: 'github-actions-workflow.yml',
                size: 8000,
                type: 'text/yaml',
                data: '',
                uploadedAt: new Date().toISOString(),
              },
            ],
            subTasks: [
              {
                id: uuidv4(),
                title: 'テストワークフロー作成',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'デプロイワークフロー作成',
                completed: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: uuidv4(),
                title: 'Slack通知設定',
                completed: true,
                createdAt: new Date().toISOString(),
              },
            ],
            completedAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
          },
        ],
      },
    ],
  };

  // デモデータをバックアップストレージに保存
  try {
    localStorage.setItem(DEMO_BACKUP_KEY, JSON.stringify([demoBoard]));
    logger.info('📖 Demo board backup saved successfully');
  } catch (_error) {
    logger.warn('Failed to save demo board backup:', _error);
  }

  logger.info('📖 Demo board created successfully');
  return [demoBoard];
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('current-board-id');
  } catch (_error) {
    logger.warn('Failed to clear localStorage:', _error);
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

    return boards.some(
      board => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]
    );
  } catch (_error) {
    logger.warn('Failed to check demo board existence:', _error);
    return false;
  }
};

/**
 * デモデータを強制的に復元する関数
 */
export const restoreDemoBoard = (): KanbanBoard[] => {
  try {
    logger.info('📖 Force restoring demo board');

    // 既存のボードを取得
    const existingBoards = loadBoards();

    // デモボードが既に存在する場合はそのまま返す
    if (
      existingBoards.some(
        board => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]
      )
    ) {
      logger.info('📖 Demo board already exists, no restoration needed');
      return existingBoards;
    }

    // 新しいデモボードを作成
    const demoBoard = createDemoBoard();

    // 既存のボードと結合（デモボードを先頭に配置）
    const allBoards = [...demoBoard, ...existingBoards];

    // 保存
    saveBoards(allBoards);

    logger.info('📖 Demo board restored successfully');
    return allBoards;
  } catch (_error) {
    logger._error('Failed to restore demo board:', _error);
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
  const hasDemo = boards.some(
    board => (board as unknown as Record<string, unknown>)[DEMO_BOARD_FLAG]
  );

  if (!hasDemo) {
    logger.warn('📖 Demo board protection triggered - restoring demo board');
    return restoreDemoBoard();
  }

  return boards;
};
