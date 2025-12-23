/**
 * @file OfflineIndicator.tsx
 * @description 오프라인 상태 표시기
 */

import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, isUpdateAvailable, updateApp } = usePWA();

  // Show update available banner
  if (isUpdateAvailable) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[100]',
          'px-4 py-2',
          'bg-[var(--accent-green)]/90 backdrop-blur-sm',
          'flex items-center justify-center gap-2',
          'animate-slide-down'
        )}
      >
        <RefreshCw className="w-4 h-4 text-white animate-spin" />
        <span className="text-sm font-medium text-white">
          새 버전이 있습니다
        </span>
        <button
          onClick={updateApp}
          className={cn(
            'ml-2 px-3 py-1 rounded-full text-xs font-semibold',
            'bg-white/20 text-white',
            'hover:bg-white/30',
            'transition-colors'
          )}
        >
          업데이트
        </button>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[100]',
          'px-4 py-2',
          'bg-[var(--accent-amber)]/90 backdrop-blur-sm',
          'flex items-center justify-center gap-2',
          'animate-slide-down'
        )}
      >
        <WifiOff className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">
          오프라인 모드 - 일부 기능이 제한될 수 있어요
        </span>
      </div>
    );
  }

  return null;
}

/**
 * Compact offline indicator for use in headers
 */
export function OfflineIndicatorCompact() {
  const { isOnline } = usePWA();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
        isOnline
          ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
          : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">온라인</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>오프라인</span>
        </>
      )}
    </div>
  );
}
