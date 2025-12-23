/**
 * @file Toast.tsx
 * @description 토스트 알림 컴포넌트
 *
 * @checkpoint CP-6.4
 * @created 2025-12-23
 */

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast, type Toast as ToastType } from '@/stores/useToast';

// ============================================
// Toast Item Component
// ============================================

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, type, title, description, duration = 5000 } = toast;

  // Auto dismiss
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-green-500/10 border-green-500/20',
      icon: 'text-green-400',
      text: 'text-green-400',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/20',
      icon: 'text-red-400',
      text: 'text-red-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: 'text-amber-400',
      text: 'text-amber-400',
    },
    info: {
      bg: 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/20',
      icon: 'text-[var(--accent-cyan)]',
      text: 'text-[var(--accent-cyan)]',
    },
  };

  const Icon = icons[type];
  const color = colors[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'bg-[var(--bg-primary)]',
        color.bg,
        'animate-in slide-in-from-right-full fade-in duration-300'
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', color.icon)} />
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', color.text)}>{title}</p>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-lg',
          'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          'hover:bg-[var(--bg-tertiary)]',
          'transition-colors'
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// Toast Container Component
// ============================================

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
