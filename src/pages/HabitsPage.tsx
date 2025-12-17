import { useHabits } from '@/hooks';
import {
  HabitGrid,
  StreakDisplay,
  WeeklyMiniHeatmap,
  ConditionTracker,
  AchievementBadge,
  EncouragementBanner,
} from '@/components/habits';

export function HabitsPage() {
  const { getCompletedCount, totalHabits } = useHabits();
  const completedCount = getCompletedCount();

  return (
    <div className="space-y-4">
      {/* Encouragement Banner */}
      <EncouragementBanner
        completedCount={completedCount}
        totalCount={totalHabits}
      />

      {/* Streak & Stats */}
      <StreakDisplay />

      {/* Main Habit Grid */}
      <HabitGrid />

      {/* Weekly Mini Heatmap */}
      <WeeklyMiniHeatmap />

      {/* Condition Tracker */}
      <ConditionTracker />

      {/* Achievement Badges */}
      <AchievementBadge />
    </div>
  );
}
