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
  const dateStr = date.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric'
  });
  const weekdayStr = date.toLocaleDateString('ja-JP', {
    weekday: 'short'
  });

  // 23:59:59の場合は時刻を表示しない
  const isEndOfDay = date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59;

  if (isEndOfDay) {
    return `${dateStr}（${weekdayStr}）`;
  }

  const timeStr = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateStr}（${weekdayStr}）${timeStr}`;
};

export const formatDueDateWithYear = (date: Date): string => {
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const weekdayStr = date.toLocaleDateString('ja-JP', {
    weekday: 'short'
  });

  // 23:59:59の場合は時刻を表示しない
  const isEndOfDay = date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59;

  if (isEndOfDay) {
    return `${dateStr}（${weekdayStr}）`;
  }

  const timeStr = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateStr}（${weekdayStr}）${timeStr}`;
};

export const formatDateTime = (date: string | Date): string => 
  new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const formatDate = (date: string | Date, format?: string): string => {
  const dateObj = new Date(date);

  if (format === 'MM/dd') {
    return dateObj.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit'
    });
  }

  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * DateオブジェクトをHTML datetime-local input用の文字列に変換
 * 秒は含まず、分単位までの精度で変換
 */
export const toDateTimeLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * HTML datetime-local input用の文字列をDateオブジェクトに変換
 */
export const fromDateTimeLocalString = (dateTimeString: string): Date | null => {
  if (!dateTimeString) {
    return null;
  }

  const date = new Date(dateTimeString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * 現在の日付時刻をdatetime-local形式で取得
 */
export const getCurrentDateTimeLocal = (): string =>
  toDateTimeLocalString(new Date());

