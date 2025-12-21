import { Compass, BookOpen, GitBranch, BarChart3 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { TabType } from '@/types';

interface NavItem {
  id: TabType;
  label: string;
  icon: typeof Compass;
}

const navItems: NavItem[] = [
  { id: 'feed', label: 'Feed', icon: Compass },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'connect', label: 'Connect', icon: GitBranch },
  { id: 'reflect', label: 'Reflect', icon: BarChart3 },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive && 'bg-indigo-100 dark:bg-indigo-900/50'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
