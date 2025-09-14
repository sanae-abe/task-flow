import { RecurrenceConfig, RecurrencePattern } from '../types';

/**
 * 繰り返しタスクの次回期限日を計算する
 */
export function calculateNextDueDate(
  currentDueDate: string,
  recurrence: RecurrenceConfig | undefined | null
): string | null {
  if (!recurrence || !recurrence.enabled) {
    return null;
  }

  const currentDate = new Date(currentDueDate);
  if (isNaN(currentDate.getTime())) {
    return null;
  }

  let nextDate = new Date(currentDate);

  switch (recurrence.pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + recurrence.interval);
      break;

    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // 指定された曜日の次の日を計算
        nextDate = getNextWeekdayOccurrence(currentDate, recurrence.daysOfWeek, recurrence.interval);
      } else {
        // 曜日指定がない場合は単純に週間隔で追加
        nextDate.setDate(nextDate.getDate() + (7 * recurrence.interval));
      }
      break;

    case 'monthly':
      if (recurrence.dayOfMonth) {
        // 指定された日付で次の月を計算
        nextDate.setMonth(nextDate.getMonth() + recurrence.interval);
        nextDate.setDate(recurrence.dayOfMonth);

        // 存在しない日付の場合は月末に調整
        if (nextDate.getDate() !== recurrence.dayOfMonth) {
          nextDate.setDate(0); // 前月の最終日
        }
      } else {
        // 日付指定がない場合は現在の日付で次の月
        nextDate.setMonth(nextDate.getMonth() + recurrence.interval);
      }
      break;

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + recurrence.interval);
      break;

    default:
      return null;
  }

  // 終了日チェック
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (nextDate > endDate) {
      return null;
    }
  }

  return nextDate.toISOString();
}

/**
 * 指定された曜日の次の発生日を計算（週次繰り返し用）
 */
function getNextWeekdayOccurrence(
  currentDate: Date,
  daysOfWeek: number[],
  intervalWeeks: number
): Date {
  const currentDayOfWeek = currentDate.getDay();
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

  // 今日以降の次の曜日を探す
  const nextDayOfWeek = sortedDays.find(day => day > currentDayOfWeek);

  const nextDate = new Date(currentDate);

  if (nextDayOfWeek !== undefined) {
    // 今週の後の曜日がある場合
    const daysToAdd = nextDayOfWeek - currentDayOfWeek;
    nextDate.setDate(nextDate.getDate() + daysToAdd);
  } else {
    // 今週にもう該当曜日がない場合、次の週の最初の曜日
    const daysToAdd = (7 * intervalWeeks) + ((sortedDays[0] || 0) - currentDayOfWeek);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
  }

  return nextDate;
}

/**
 * 繰り返しタスクが終了条件に達しているかチェック
 */
export function isRecurrenceComplete(
  recurrence: RecurrenceConfig | undefined | null,
  occurrenceCount: number,
  currentDate?: string
): boolean {
  if (!recurrence) {
    return true;
  }

  // 最大回数チェック
  if (recurrence.maxOccurrences && occurrenceCount >= recurrence.maxOccurrences) {
    return true;
  }

  // 終了日チェック
  if (recurrence.endDate && currentDate) {
    const endDate = new Date(recurrence.endDate);
    const current = new Date(currentDate);
    if (current > endDate) {
      return true;
    }
  }

  return false;
}

/**
 * 繰り返し設定のバリデーション
 */
export function validateRecurrenceConfig(recurrence: RecurrenceConfig | undefined | null): string[] {
  const errors: string[] = [];

  if (!recurrence || !recurrence.enabled) {
    return errors;
  }

  if (recurrence.interval <= 0) {
    errors.push('間隔は1以上の数値を指定してください');
  }

  if (recurrence.pattern === 'weekly' && recurrence.daysOfWeek) {
    if (recurrence.daysOfWeek.length === 0) {
      errors.push('週次繰り返しの場合は曜日を選択してください');
    }
    if (recurrence.daysOfWeek.some(day => day < 0 || day > 6)) {
      errors.push('曜日は0-6の範囲で指定してください');
    }
  }

  if (recurrence.pattern === 'monthly' && recurrence.dayOfMonth) {
    if (recurrence.dayOfMonth < 1 || recurrence.dayOfMonth > 31) {
      errors.push('日付は1-31の範囲で指定してください');
    }
  }

  if (recurrence.endDate && recurrence.maxOccurrences) {
    errors.push('終了日と最大回数の両方を指定することはできません');
  }

  return errors;
}

/**
 * 曜日名を取得
 */
export function getDayName(dayOfWeek: number): string {
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  return dayNames[dayOfWeek] || '';
}

/**
 * 繰り返しパターンの表示名を取得
 */
export function getRecurrencePatternLabel(pattern: RecurrencePattern): string {
  const labels: Record<RecurrencePattern, string> = {
    daily: '毎日',
    weekly: '毎週',
    monthly: '毎月',
    yearly: '毎年'
  };
  return labels[pattern];
}

/**
 * 繰り返し設定の説明文を生成
 */
export function getRecurrenceDescription(recurrence: RecurrenceConfig | undefined | null): string {
  if (!recurrence || !recurrence.enabled) {
    return '繰り返しなし';
  }

  let description = '';

  switch (recurrence.pattern) {
    case 'daily':
      if (recurrence.interval === 1) {
        description = '毎日繰り返す';
      } else {
        description = `${recurrence.interval} 日ごとに繰り返す`;
      }
      break;

    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const dayNames = recurrence.daysOfWeek.map(getDayName).join('、');
        if (recurrence.interval === 1) {
          description = `毎週 ${dayNames}曜日に繰り返す`;
        } else {
          description = `${recurrence.interval} 週ごとの ${dayNames}曜日に繰り返す`;
        }
      } else {
        if (recurrence.interval === 1) {
          description = '毎週繰り返す';
        } else {
          description = `${recurrence.interval} 週ごとに繰り返す`;
        }
      }
      break;

    case 'monthly':
      if (recurrence.weekOfMonth && recurrence.dayOfWeekInMonth !== undefined) {
        // 第N曜日の場合
        const dayName = getDayName(recurrence.dayOfWeekInMonth);
        const weekText = recurrence.weekOfMonth === -1 ? '最終' : `第 ${recurrence.weekOfMonth}`;
        if (recurrence.interval === 1) {
          description = `毎月の ${weekText} ${dayName}曜日に繰り返す`;
        } else {
          description = `${recurrence.interval} ヶ月ごとの ${weekText} ${dayName}曜日に繰り返す`;
        }
      } else if (recurrence.dayOfMonth) {
        // 日付指定の場合
        if (recurrence.interval === 1) {
          description = `毎月の ${recurrence.dayOfMonth} 日に繰り返す`;
        } else {
          description = `${recurrence.interval} ヶ月ごとの ${recurrence.dayOfMonth} 日に繰り返す`;
        }
      } else {
        // 指定なしの場合
        if (recurrence.interval === 1) {
          description = '毎月繰り返す';
        } else {
          description = `${recurrence.interval} ヶ月ごとに繰り返す`;
        }
      }
      break;

    case 'yearly':
      if (recurrence.interval === 1) {
        description = '1 年ごとに繰り返す';
      } else {
        description = `${recurrence.interval} 年ごとに繰り返す`;
      }
      break;

    default:
      description = '繰り返し設定エラー';
  }

  // 終了条件の追加
  if (recurrence.endDate) {
    description += ` (${recurrence.endDate}まで)`;
  } else if (recurrence.maxOccurrences) {
    description += ` (${recurrence.maxOccurrences}回まで)`;
  }

  return description;
}