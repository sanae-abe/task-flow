export interface DateHelpers {
  isOverdue: () => boolean;
  isDueToday: () => boolean;
  isDueTomorrow: () => boolean;
  formatDueDate: (date: Date) => string;
}

export interface DueDateBadgeProps extends DateHelpers {
  dueDate: Date;
}