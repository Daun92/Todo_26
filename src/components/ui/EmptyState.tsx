import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
