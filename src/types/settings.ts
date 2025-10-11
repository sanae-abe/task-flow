// 設定関連の型定義
export interface DefaultColumnConfig {
  id: string;
  name: string;
}

export interface AppSettings {
  defaultColumns: DefaultColumnConfig[];
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  defaultColumns: [
    { id: "todo", name: "To Do" },
    { id: "inprogress", name: "In Progress" },
    { id: "done", name: "Done" },
  ],
};
