import { PenLine } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function QuickMemoButton() {
  const { setQuickMemoOpen } = useStore();

  return (
    <button
      onClick={() => setQuickMemoOpen(true)}
      className={cn(
        'fixed right-4 bottom-24 z-30',
        'w-14 h-14 rounded-full shadow-lg',
        'bg-gradient-to-br from-indigo-500 to-purple-600',
        'flex items-center justify-center',
        'hover:shadow-xl hover:scale-105 transition-all',
        'active:scale-95'
      )}
      aria-label="빠른 메모"
    >
      <PenLine className="w-6 h-6 text-white" />
    </button>
  );
}
