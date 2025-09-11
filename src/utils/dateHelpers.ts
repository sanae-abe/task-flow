export interface DateStatus {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
}

export const getDateStatus = (dueDate: Date | undefined): DateStatus => {
  if (!dueDate) {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
    };
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dueDate);
  targetDate.setHours(0, 0, 0, 0);

  const isOverdue = targetDate < today;
  const isDueToday = targetDate.getTime() === today.getTime();
  const isDueTomorrow = targetDate.getTime() === tomorrow.getTime();

  return {
    isOverdue,
    isDueToday,
    isDueTomorrow,
  };
};

export const formatDueDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};