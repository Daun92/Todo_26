import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import { useHabits, useHabitHistory } from '@/hooks';
import { calculateStreak, getCompletionRate } from '@/lib/utils';

export function StreakDisplay() {
  const { getCompletedCount, totalHabits } = useHabits();
  const { history } = useHabitHistory(365);

  // Calculate current streak
  const currentStreak = calculateStreak(
    history
      .filter((log) => {
        const completed = Object.values(log.habits).filter(Boolean).length;
        return completed > 0;
      })
      .map((log) => log.date)
  );

  // Calculate best streak
  const bestStreak = history.reduce((best, _, index) => {
    let streak = 0;
    const sortedDates = history
      .filter((log) => Object.values(log.habits).filter(Boolean).length > 0)
      .map((log) => log.date)
      .sort();

    for (let i = index; i < sortedDates.length; i++) {
      if (i === index) {
        streak = 1;
        continue;
      }
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(best, streak);
  }, currentStreak);

  // Calculate monthly completion rate
  const thisMonthLogs = history.filter((log) => {
    const logDate = new Date(log.date);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  });

  const monthlyRate = thisMonthLogs.length > 0
    ? Math.round(
        (thisMonthLogs.filter((log) => Object.values(log.habits).filter(Boolean).length > 0).length /
          new Date().getDate()) *
          100
      )
    : 0;

  const todayRate = getCompletionRate(getCompletedCount(), totalHabits);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-white/80">연속 기록</p>
          </div>
        </div>
      </Card>

      {/* Today's Rate */}
      <Card className="bg-gradient-to-br from-primary-500 to-accent-500 text-white border-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{todayRate}%</p>
            <p className="text-xs text-white/80">오늘 달성률</p>
          </div>
        </div>
      </Card>

      {/* Best Streak */}
      <Card className="col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">최고 기록</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{bestStreak}일</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">이번 달</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{monthlyRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
