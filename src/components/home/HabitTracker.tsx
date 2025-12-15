import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
import { useHabits } from '@/hooks';
import { cn, getCompletionRate } from '@/lib/utils';

export function HabitTracker() {
  const { habits, toggleHabit, isHabitCompleted, getCompletedCount, totalHabits, loading } = useHabits();

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const completedCount = getCompletedCount();
  const rate = getCompletionRate(completedCount, totalHabits);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>오늘의 습관</span>
          <span className="text-sm font-normal text-slate-500">
            {completedCount}/{totalHabits}
          </span>
        </CardTitle>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          {rate}%
        </span>
      </CardHeader>
      <CardContent>
        <Progress value={rate} className="mb-4" variant="gradient" />

        <div className="flex justify-center gap-3 flex-wrap">
          {habits.map((habit) => {
            const completed = isHabitCompleted(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
                  'border-2',
                  completed
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                )}
              >
                <span className="text-xl">{habit.icon}</span>
                {completed && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          {habits.map((habit) => (
            <span
              key={habit.id}
              className="w-14 text-center text-[10px] text-slate-500 dark:text-slate-400 truncate"
            >
              {habit.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
