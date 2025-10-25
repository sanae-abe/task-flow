import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { useKanban } from "../contexts/KanbanContext";
import type {
  Task,
  Label,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from "../types";
import {
  toDateTimeLocalString,
  fromDateTimeLocalString,
} from "../utils/dateHelpers";

interface UseTaskEditProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

interface UseTaskEditReturn {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  dueTime: string;
  setDueTime: (value: string) => void;
  hasTime: boolean;
  setHasTime: (value: boolean) => void;
  completedAt: string;
  setCompletedAt: (value: string) => void;
  isCompleted: boolean;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  attachments: FileAttachment[];
  setAttachments: (attachments: FileAttachment[]) => void;
  columnId: string;
  setColumnId: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  recurrence: RecurrenceConfig | undefined;
  setRecurrence: (recurrence: RecurrenceConfig | undefined) => void;
  priority: Priority | undefined;
  setPriority: (priority: Priority | undefined) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSave: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  isValid: boolean;
}

export const useTaskEdit = ({
  task,
  isOpen,
  onSave,
  onDelete,
  onCancel,
}: UseTaskEditProps): UseTaskEditReturn => {
  const { state, moveTask } = useKanban();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [completedAt, setCompletedAt] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [columnId, setColumnId] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>(
    undefined,
  );
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 前の値を追跡するためのref
  const prevIsOpenRef = useRef(isOpen);
  const prevTaskIdRef = useRef(task?.id);
  // columns配列の変更を追跡するためのref
  const prevColumnsLengthRef = useRef(state.currentBoard?.columns.length || 0);

  useEffect(() => {
    const prevIsOpen = prevIsOpenRef.current;
    const prevTaskId = prevTaskIdRef.current;

    // 値が変更された場合のみ実行
    const isOpenChanged = prevIsOpen !== isOpen;
    const taskChanged = prevTaskId !== task?.id;

    if (isOpenChanged || taskChanged) {
      if (isOpen && task) {
        setTitle(task.title);
        setDescription(task.description ?? "");

        // 期限の処理
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const dateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD形式
          setDueDate(dateStr || "");

          // 時刻チェック（23:59:59以外の場合は時刻を設定）
          const is23_59_59 =
            dueDate.getHours() === 23 &&
            dueDate.getMinutes() === 59 &&
            dueDate.getSeconds() === 59;
          if (!is23_59_59) {
            setHasTime(true);
            const timeStr = `${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}`;
            setDueTime(timeStr);
          } else {
            setHasTime(false);
            setDueTime("");
          }
        } else {
          setDueDate("");
          setDueTime("");
          setHasTime(false);
        }

        // completedAtをdatetime-local形式（YYYY-MM-DDTHH:mm）にフォーマット
        const completedAtValue = task.completedAt
          ? toDateTimeLocalString(new Date(task.completedAt))
          : "";
        setCompletedAt(completedAtValue);

        setAttachments(task.files ?? []);

        // 繰り返し設定の初期化
        setRecurrence(task.recurrence);

        // 優先度の初期化
        setPriority(task.priority);
      } else if (!isOpen && prevIsOpen) {
        // ダイアログが閉じられた時にフォームをリセット（前回開いていた場合のみ）
        setTitle("");
        setDescription("");
        setDueDate("");
        setDueTime("");
        setHasTime(false);
        setCompletedAt("");
        setLabels([]);
        setAttachments([]);
        setRecurrence(undefined);
        setPriority(undefined);
        setColumnId("");
      }
    }

    // refを更新
    prevIsOpenRef.current = isOpen;
    prevTaskIdRef.current = task?.id;
  }, [isOpen, task]);

  // カラム情報の初期化（columns配列の長さが変わった場合のみ実行）
  useEffect(() => {
    if (isOpen && task && state.currentBoard?.columns) {
      const currentColumnsLength = state.currentBoard.columns.length;
      const prevColumnsLength = prevColumnsLengthRef.current;
      
      // カラム数が変更された場合、またはタスクが開かれた場合のみ実行
      if (currentColumnsLength !== prevColumnsLength || columnId === "") {
        const currentColumn = state.currentBoard.columns.find((column) =>
          column.tasks.some((t) => t.id === task.id),
        );
        setColumnId(currentColumn?.id ?? "");
        prevColumnsLengthRef.current = currentColumnsLength;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id, state.currentBoard?.columns?.length]);

  // ラベルの初期化は別のuseEffectで処理（一度だけ実行）
  useEffect(() => {
    if (isOpen && task) {
      setLabels(task.labels ?? []);
    }
  }, [isOpen, task]); // taskの変更時にラベルを更新

  // ステータス変更時の完了日時の自動更新
  useEffect(() => {
    if (state.currentBoard?.columns && columnId) {
      const targetColumn = state.currentBoard.columns.find(
        (col) => col.id === columnId,
      );
      const isLastColumn =
        targetColumn &&
        state.currentBoard.columns.indexOf(targetColumn) ===
          state.currentBoard.columns.length - 1;

      // 関数型更新を使って現在の値を取得し、必要な場合のみ更新
      setCompletedAt((currentCompletedAt) => {
        // 完了カラムに移動した場合で、現在完了日時が空の場合
        if (isLastColumn && !currentCompletedAt) {
          const now = new Date();
          now.setHours(23, 59, 59, 999);
          return toDateTimeLocalString(now);
        }
        // 完了カラム以外に移動した場合で、完了日時が設定されている場合
        else if (!isLastColumn && currentCompletedAt) {
          return "";
        }
        // 変更が不要な場合は現在の値をそのまま返す
        return currentCompletedAt;
      });
    }
  }, [columnId, state.currentBoard?.columns?.length]);

  // 期限が削除された場合、繰り返し設定を無効化
  useEffect(() => {
    if (!dueDate) {
      setRecurrence((currentRecurrence) => {
        if (currentRecurrence && currentRecurrence.enabled) {
          return {
            ...currentRecurrence,
            enabled: false,
          };
        }
        return currentRecurrence;
      });
    }
  }, [dueDate]);

  // 時刻設定がオフになった場合、時刻をクリア
  useEffect(() => {
    if (!hasTime) {
      setDueTime("");
    }
  }, [hasTime]);

  const handleSave = useCallback(() => {
    if (task && title.trim()) {
      let dueDateObj: Date | undefined = undefined;

      if (dueDate) {
        if (hasTime && dueTime) {
          // 日付と時刻を組み合わせ
          const dateTimeString = `${dueDate}T${dueTime}`;
          dueDateObj = new Date(dateTimeString);
        } else {
          // 日付のみの場合は23:59:59に設定
          dueDateObj = new Date(dueDate);
          dueDateObj.setHours(23, 59, 59, 999);
        }
      }

      let completedAtObj = completedAt
        ? fromDateTimeLocalString(completedAt) || undefined
        : undefined;

      // カラムの変更があった場合は移動処理を実行
      const currentColumn = state.currentBoard?.columns.find((column) =>
        column.tasks.some((t) => t.id === task.id),
      );

      if (currentColumn && columnId && currentColumn.id !== columnId) {
        // 最後のカラム（完了カラム）への移動かどうかを判定
        const targetColumn = state.currentBoard?.columns.find(
          (col) => col.id === columnId,
        );
        const isLastColumn =
          state.currentBoard?.columns &&
          targetColumn &&
          state.currentBoard.columns.indexOf(targetColumn) ===
            state.currentBoard.columns.length - 1;

        // 完了カラムに移動する場合は完了日時を23:59に設定
        if (isLastColumn && !task.completedAt) {
          completedAtObj = new Date();
          completedAtObj.setHours(23, 59, 59, 999);
        }
        // 完了カラムから他のカラムに移動する場合は完了日時をクリア
        else if (!isLastColumn && task.completedAt) {
          completedAtObj = undefined;
        }

        // タスクを移動
        moveTask(task.id, currentColumn.id, columnId, 0);
      }

      const updatedTask: Task = {
        ...task,
        title: title.trim(),
        description: description.trim() || "",
        dueDate: dueDateObj?.toISOString() || null,
        completedAt: completedAtObj?.toISOString() || null,
        priority,
        labels,
        files: attachments,
        recurrence: recurrence?.enabled && dueDateObj ? recurrence : undefined,
        updatedAt: new Date().toISOString(),
      };

      onSave(updatedTask);
    }
  }, [
    task,
    title,
    description,
    dueDate,
    dueTime,
    hasTime,
    completedAt,
    labels,
    attachments,
    recurrence,
    priority,
    columnId,
    state.currentBoard,
    moveTask,
    onSave,
  ]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (task) {
      onDelete(task.id);
    }
    setShowDeleteConfirm(false);
  }, [task, onDelete]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  const isValid = useMemo(() => title.trim().length > 0, [title]);

  // タスクが完了状態（一番右のカラム）にあるかどうかを判定
  const isCompleted = useMemo(() => {
    if (!task || !state.currentBoard?.columns.length) {
      return false;
    }

    const rightmostColumn =
      state.currentBoard.columns[state.currentBoard.columns.length - 1];
    if (!rightmostColumn) {
      return false;
    }

    return rightmostColumn.tasks.some((t) => t.id === task.id);
  }, [task, state.currentBoard]);

  // ステータス選択肢を生成（ゴミ箱に入っているカラムを除外）
  const statusOptions = useMemo(() => {
    if (!state.currentBoard?.columns.length) {
      return [];
    }

    return state.currentBoard.columns
      .filter((column) => column.deletionState !== 'deleted')
      .map((column) => ({
        value: column.id,
        label: column.title,
      }));
  }, [state.currentBoard]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    hasTime,
    setHasTime,
    completedAt,
    setCompletedAt,
    isCompleted,
    labels,
    setLabels,
    attachments,
    setAttachments,
    columnId,
    setColumnId,
    statusOptions,
    recurrence,
    setRecurrence,
    priority,
    setPriority,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    isValid,
  };
};;;
