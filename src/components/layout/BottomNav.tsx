import { Home, CheckSquare, Sparkles, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/useStore';

const navItems = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'habits', label: '습관', icon: CheckSquare },
  { id: 'memory', label: '기억', icon: Sparkles },
  { id: 'goals', label: '목표', icon: Target },
  { id: 'insights', label: '분석', icon: BarChart3 },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-primary-100 dark:bg-primary-900/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isActive && 'scale-110'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-0.5 font-medium transition-all duration-200',
                    isActive && 'text-primary-600 dark:text-primary-400'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
