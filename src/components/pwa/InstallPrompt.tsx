/**
 * @file InstallPrompt.tsx
 * @description PWA 설치 프롬프트 배너
 */

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      // User declined, dismiss the prompt
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage to prevent showing again this session
    try {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50',
        'p-4 rounded-2xl',
        'bg-gradient-to-r from-[var(--accent-cyan)]/20 to-[var(--accent-magenta)]/20',
        'border border-[var(--accent-cyan)]/30',
        'backdrop-blur-xl',
        'animate-slide-up'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            'bg-[var(--accent-cyan)]/20'
          )}
        >
          <Download className="w-6 h-6 text-[var(--accent-cyan)]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)]">
            앱으로 설치하기
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            홈 화면에 추가하면 더 빠르게 접근할 수 있어요
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'bg-[var(--accent-cyan)] text-white',
                'hover:bg-[var(--accent-cyan)]/90',
                'transition-colors'
              )}
            >
              설치하기
            </button>
            <button
              onClick={handleDismiss}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium',
                'text-[var(--text-muted)]',
                'hover:text-[var(--text-secondary)]',
                'transition-colors'
              )}
            >
              나중에
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className={cn(
            'p-1.5 rounded-lg flex-shrink-0',
            'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            'hover:bg-[var(--bg-tertiary)]',
            'transition-colors'
          )}
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
