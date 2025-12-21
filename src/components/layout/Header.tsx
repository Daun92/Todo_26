import { Settings, Moon, Sun, Sparkles } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { darkMode, toggleDarkMode, openModal } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Mosaic
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            aria-label={darkMode ? '라이트 모드' : '다크 모드'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => openModal('settings')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            aria-label="설정"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
