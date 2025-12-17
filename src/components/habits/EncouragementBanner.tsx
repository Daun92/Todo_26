import { Sparkles } from 'lucide-react';
import { getEncouragement } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface EncouragementBannerProps {
  completedCount: number;
  totalCount: number;
}

export function EncouragementBanner({ completedCount, totalCount }: EncouragementBannerProps) {
  const message = getEncouragement(completedCount, totalCount);
  const isComplete = completedCount >= totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-2xl transition-all duration-300',
        isComplete
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800'
          : 'bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          isComplete
            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
            : 'bg-gradient-to-br from-primary-400 to-accent-500'
        )}
      >
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
        {message}
      </p>
    </div>
  );
}
