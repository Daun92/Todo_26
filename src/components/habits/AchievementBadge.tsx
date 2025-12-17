import { useMemo } from 'react';
import { Award, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useHabitHistory, useHabits } from '@/hooks';
import { calculateStreak } from '@/lib/utils';
import { achievements } from '@/lib/achievements';
import { cn } from '@/lib/utils';

export function AchievementBadge() {
  const { history } = useHabitHistory(365);
  const { totalHabits } = useHabits();

  const unlockedAchievements = useMemo(() => {
    const unlocked: string[] = [];

    // Calculate stats
    const datesWithActivity = history
      .filter((log) => Object.values(log.habits).filter(Boolean).length > 0)
      .map((log) => log.date);

    const currentStreak = calculateStreak(datesWithActivity);
    const totalCompletions = history.reduce(
      (sum, log) => sum + Object.values(log.habits).filter(Boolean).length,
      0
    );

    // Check perfect days
    const perfectDays = history.filter((log) => {
      const completed = Object.values(log.habits).filter(Boolean).length;
      return completed === totalHabits && totalHabits > 0;
    }).length;

    achievements.forEach((achievement) => {
      const { condition } = achievement;

      switch (condition.type) {
        case 'streak':
          if (currentStreak >= condition.value) {
            unlocked.push(achievement.id);
          }
          break;
        case 'total':
          if (condition.value === 1 && totalCompletions > 0) {
            unlocked.push(achievement.id);
          } else if (totalCompletions >= condition.value) {
            unlocked.push(achievement.id);
          }
          break;
        case 'rate':
          if (condition.period === 'day' && perfectDays > 0) {
            unlocked.push(achievement.id);
          }
          break;
      }
    });

    return unlocked;
  }, [history, totalHabits]);

  const displayAchievements = achievements.slice(0, 8); // Show first 8 achievements

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="w-4 h-4 text-amber-500" />
          배지
        </CardTitle>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {unlockedAchievements.length}/{achievements.length}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {displayAchievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={cn(
                  'relative flex flex-col items-center p-2 rounded-xl transition-all duration-300',
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                    : 'bg-slate-100 dark:bg-slate-800 opacity-50'
                )}
                title={`${achievement.name}: ${achievement.description}`}
              >
                <span className={cn('text-2xl', !isUnlocked && 'grayscale')}>
                  {achievement.icon}
                </span>
                <span
                  className={cn(
                    'text-[9px] mt-1 text-center leading-tight',
                    isUnlocked
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {achievement.name}
                </span>
                {!isUnlocked && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
