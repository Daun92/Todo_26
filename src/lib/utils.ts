import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr: string = 'yyyy.MM.dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ko });
}

export function formatDateKo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'M월 d일 (EEEE)', { locale: ko });
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getWeekRange(date: Date = new Date()): { start: string; end: string } {
  return {
    start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function getMonthRange(date: Date = new Date()): { start: string; end: string } {
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function isTodayDate(date: string): boolean {
  return isToday(parseISO(date));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort().reverse();
  const today = getToday();

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const diff = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0 || diff === 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  return streak;
}

export function getCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getLevelColor(level: number): string {
  if (level <= 2) return 'bg-red-500';
  if (level <= 4) return 'bg-orange-500';
  if (level <= 6) return 'bg-yellow-500';
  if (level <= 8) return 'bg-green-500';
  return 'bg-emerald-500';
}

export function getHeatmapColor(value: number, max: number): string {
  if (value === 0) return 'bg-slate-200 dark:bg-slate-800';
  const intensity = Math.ceil((value / max) * 4);
  const colors = [
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-300 dark:bg-emerald-700',
    'bg-emerald-400 dark:bg-emerald-600',
    'bg-emerald-500 dark:bg-emerald-500',
  ];
  return colors[Math.min(intensity - 1, 3)];
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
