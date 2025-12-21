import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'primary' &&
            'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
          variant === 'secondary' &&
            'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
          variant === 'ghost' &&
            'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
          variant === 'outline' &&
            'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
          size === 'md' && 'px-4 py-2 text-base rounded-lg',
          size === 'lg' && 'px-6 py-3 text-lg rounded-xl',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
