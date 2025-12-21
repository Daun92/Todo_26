import { Settings, Mic } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { openModal } = useStore();

  return (
    <header className="sticky top-0 z-40 glass glass-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Neural Orb Mini */}
          <div
            className={cn(
              'w-8 h-8 rounded-full',
              'bg-gradient-to-br from-[var(--accent-cyan)] to-[#0099cc]',
              'animate-breathe'
            )}
            style={{
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
            }}
          />
          <span className="text-xl font-bold gradient-text">
            Mosaic
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Voice Shortcut */}
          <button
            className={cn(
              'p-2 rounded-xl btn-neural-ghost',
              'text-[var(--text-muted)] hover:text-[var(--accent-cyan)]'
            )}
            aria-label="음성 입력"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => openModal('settings')}
            className={cn(
              'p-2 rounded-xl btn-neural-ghost',
              'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            aria-label="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
