import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        // Variants
        variant === 'default' &&
          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        variant === 'primary' &&
          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
        variant === 'secondary' &&
          'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        variant === 'success' &&
          'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        variant === 'warning' &&
          'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
