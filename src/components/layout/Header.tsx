import { Moon, Sun, Settings } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { formatDateKo } from '@/lib/utils';
import { Button } from '@/components/ui';

export function Header() {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Catalyze 26
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatDateKo(new Date())}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="rounded-full p-2"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
