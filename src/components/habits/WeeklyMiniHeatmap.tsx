import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useHabitHistory, useHabits } from '@/hooks';
import { cn } from '@/lib/utils';
import { format, subDays, isToday, isFuture } from 'date-fns';
import { ko } from 'date-fns/locale';

export function WeeklyMiniHeatmap() {
  const { history } = useHabitHistory(7);
  const { totalHabits } = useHabits();

  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = history.find(h => h.date === dateStr);
      const completed = log ? Object.values(log.habits).filter(Boolean).length : 0;
      const rate = totalHabits > 0 ? completed / totalHabits : 0;

      days.push({
        date: dateStr,
        dayName: format(date, 'EEE', { locale: ko }),
        dayNum: format(date, 'd'),
        completed,
        rate,
        isToday: isToday(date),
        isFuture: isFuture(date),
      });
    }

    return days;
  }, [history, totalHabits]);

  const getColor = (rate: number, isToday: boolean) => {
    if (rate === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (rate < 0.5) return 'bg-emerald-200 dark:bg-emerald-900/50';
    if (rate < 0.8) return 'bg-emerald-400 dark:bg-emerald-700';
    if (rate < 1) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">이번 주</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-1">
          {weekDays.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {day.dayName}
              </span>
              <div
                className={cn(
                  'w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-300',
                  getColor(day.rate, day.isToday),
                  day.isToday && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
                  day.rate === 1 && 'shadow-md'
                )}
              >
                {day.rate === 1 ? (
                  <span className="text-white text-xs">✓</span>
                ) : day.completed > 0 ? (
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-medium">
                    {day.completed}
                  </span>
                ) : null}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  day.isToday
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {day.dayNum}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
