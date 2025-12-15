import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useHabitHistory } from '@/hooks';
import { cn, getHeatmapColor } from '@/lib/utils';
import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getDay,
  getWeek,
  isToday,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export function Heatmap() {
  const { history, loading } = useHabitHistory(365);

  const { days, maxValue, monthLabels } = useMemo(() => {
    const year = new Date().getFullYear();
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));

    const allDays = eachDayOfInterval({ start, end });

    // Create a map of date -> completed habits count
    const dateMap = new Map<string, number>();
    history.forEach((log) => {
      const count = Object.values(log.habits).filter(Boolean).length;
      dateMap.set(log.date, count);
    });

    const daysWithData = allDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        value: dateMap.get(dateStr) || 0,
        dayOfWeek: getDay(date),
        week: getWeek(date, { weekStartsOn: 1 }),
        isToday: isToday(date),
      };
    });

    const max = Math.max(...daysWithData.map((d) => d.value), 5);

    // Month labels
    const months: { label: string; week: number }[] = [];
    let currentMonth = -1;
    daysWithData.forEach((day) => {
      const month = parseISO(day.date).getMonth();
      if (month !== currentMonth && day.dayOfWeek === 1) {
        months.push({
          label: format(parseISO(day.date), 'MMM', { locale: ko }),
          week: day.week,
        });
        currentMonth = month;
      }
    });

    return { days: daysWithData, maxValue: max, monthLabels: months };
  }, [history]);

  // Group days by week
  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof days>();
    days.forEach((day) => {
      if (!weekMap.has(day.week)) {
        weekMap.set(day.week, []);
      }
      weekMap.get(day.week)!.push(day);
    });
    return Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [days]);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </Card>
    );
  }

  const totalDays = days.filter((d) => d.value > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>연간 활동</CardTitle>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {totalDays}일 활동
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="text-[10px] text-slate-400 dark:text-slate-500"
                style={{ marginLeft: i === 0 ? 0 : `${(month.week - (monthLabels[i - 1]?.week || 0) - 1) * 12}px`, width: '32px' }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {['', '월', '', '수', '', '금', ''].map((day, i) => (
                <div
                  key={i}
                  className="w-6 h-[10px] text-[9px] text-slate-400 dark:text-slate-500 text-right pr-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {weeks.map(([weekNum, weekDays]) => (
              <div key={weekNum} className="flex flex-col gap-0.5">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = weekDays.find((d) => d.dayOfWeek === dayOfWeek);
                  if (!day) {
                    return <div key={dayOfWeek} className="w-[10px] h-[10px]" />;
                  }
                  return (
                    <div
                      key={dayOfWeek}
                      className={cn(
                        'w-[10px] h-[10px] rounded-[2px] transition-colors',
                        getHeatmapColor(day.value, maxValue),
                        day.isToday && 'ring-1 ring-primary-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                      )}
                      title={`${day.date}: ${day.value}개 완료`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-[10px] h-[10px] rounded-[2px]',
                  getHeatmapColor(level, 4)
                )}
              />
            ))}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
