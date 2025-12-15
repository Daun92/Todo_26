import { Flame, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import { useHabits, useHabitHistory } from '@/hooks';
import { calculateStreak, getCompletionRate } from '@/lib/utils';

export function StreakCard() {
  const { getCompletedCount, totalHabits } = useHabits();
  const { history } = useHabitHistory(30);

  // Calculate streak from habit logs
  const streak = calculateStreak(
    history
      .filter((log) => {
        const completed = Object.values(log.habits).filter(Boolean).length;
        return completed > 0;
      })
      .map((log) => log.date)
  );

  const todayRate = getCompletionRate(getCompletedCount(), totalHabits);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-white/80">연속 기록</p>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
