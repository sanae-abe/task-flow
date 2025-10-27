import type { Task } from "../types";

import type { DateHelpers } from "./date";

export interface TaskDisplayProps extends DateHelpers {
  task: Task;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onComplete?: (e: React.MouseEvent) => void;
  isRightmostColumn?: boolean;
  useInvertedIcon?: boolean; // 色反転アイコンを使用するかどうか
}
