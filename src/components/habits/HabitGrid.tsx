import { useState } from 'react';
import { Check, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
import { useHabits } from '@/hooks';
import { cn, getCompletionRate } from '@/lib/utils';
import { HabitSettingsModal } from './HabitSettingsModal';
import { CompletionCelebration } from './CompletionCelebration';

export function HabitGrid() {
  const { habits, toggleHabit, isHabitCompleted, getCompletedCount, totalHabits, loading } = useHabits();
  const [showSettings, setShowSettings] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; type: 'habit' | 'all' }>({ show: false, type: 'habit' });
  const [lastToggled, setLastToggled] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const completedCount = getCompletedCount();
  const rate = getCompletionRate(completedCount, totalHabits);
  const wasAllComplete = completedCount === totalHabits && totalHabits > 0;

  const handleToggle = async (habitId: string) => {
    setLastToggled(habitId);
    const nowCompleted = await toggleHabit(habitId);

    if (nowCompleted) {
      // Check if all habits are now complete
      const newCompletedCount = completedCount + 1;
      if (newCompletedCount === totalHabits) {
        setCelebration({ show: true, type: 'all' });
      } else {
        setCelebration({ show: true, type: 'habit' });
      }

      // Auto-hide celebration
      setTimeout(() => setCelebration({ show: false, type: 'habit' }), 1500);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>오늘의 습관</span>
            <span className="text-sm font-normal text-slate-500">
              {completedCount}/{totalHabits}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {rate}%
            </span>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={rate} className="mb-4" variant="gradient" />

          <div className="flex justify-center gap-3 flex-wrap">
            {habits.map((habit) => {
              const completed = isHabitCompleted(habit.id);
              const justToggled = lastToggled === habit.id;

              return (
                <button
                  key={habit.id}
                  onClick={() => handleToggle(habit.id)}
                  className={cn(
                    'relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
                    'border-2 active:scale-95',
                    completed
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600',
                    justToggled && completed && 'animate-bounce'
                  )}
                >
                  <span className="text-xl">{habit.icon}</span>
                  {completed && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow animate-in zoom-in duration-200">
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
                className={cn(
                  'w-14 text-center text-[10px] truncate transition-colors duration-300',
                  isHabitCompleted(habit.id)
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {habit.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <HabitSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <CompletionCelebration
        show={celebration.show}
        type={celebration.type}
        onComplete={() => setCelebration({ show: false, type: 'habit' })}
      />
    </>
  );
}
