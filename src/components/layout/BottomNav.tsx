import { MessageCircle, Compass, GitBranch, TrendingUp } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { TabType } from '@/types';

interface NavItem {
  id: TabType;
  label: string;
  icon: typeof MessageCircle;
}

const navItems: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'feed', label: 'Feed', icon: Compass },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass glass-border pb-safe">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-[var(--accent-cyan)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'bg-[rgba(0,212,255,0.1)] shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                'text-xs font-medium',
                isActive && 'text-glow-cyan'
              )}>
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div
                  className="absolute -bottom-0.5 w-8 h-0.5 rounded-full bg-[var(--accent-cyan)]"
                  style={{ boxShadow: 'var(--glow-cyan)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
