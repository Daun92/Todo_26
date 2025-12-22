/**
 * @file LearningQueue.tsx
 * @description 학습 대기열 컴포넌트 - 학습할 콘텐츠 큐 표시
 *
 * @checkpoint CP-1.5
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @features
 * - 대기열 콘텐츠 목록
 * - 빠른 학습 시작 버튼
 * - 수평 스크롤 (컴팩트 모드)
 * - 드래그앤드롭 순서 변경 (TODO: 향후 구현)
 */

import { useMemo } from 'react';
import { Play, ChevronRight, Clock, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedCard } from './FeedCard';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

export interface LearningQueueProps {
  queue: Content[];
  loading?: boolean;
  onStartLearning: (id: string) => void;
  onContentClick?: (content: Content) => void;
  compact?: boolean;
  maxItems?: number;
  showHeader?: boolean;
}

// ============================================
// Component
// ============================================

export function LearningQueue({
  queue,
  loading = false,
  onStartLearning,
  onContentClick,
  compact = true,
  maxItems = 5,
  showHeader = true,
}: LearningQueueProps) {
  // 표시할 항목
  const displayItems = useMemo(() => {
    return queue.slice(0, maxItems);
  }, [queue, maxItems]);

  const remainingCount = queue.length - maxItems;

  // ----------------------------------------
  // Render: Empty State
  // ----------------------------------------

  if (!loading && queue.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-6 rounded-xl',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
        )}
      >
        <div className="text-center">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">대기열이 비어있습니다</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            콘텐츠를 추가해보세요
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Render: Loading State
  // ----------------------------------------

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl p-4',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
        )}
      >
        {showHeader && (
          <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse mb-3" />
        )}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-16 bg-[var(--bg-tertiary)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Render: Compact Mode (Horizontal Scroll)
  // ----------------------------------------

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-xl p-4',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
        )}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                학습 대기열
              </h3>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                )}
              >
                {queue.length}
              </span>
            </div>

            {/* 다음 학습 시작 버튼 */}
            {queue.length > 0 && (
              <button
                onClick={() => onStartLearning(queue[0].id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                  'bg-[var(--accent-cyan)] text-[var(--bg-primary)]',
                  'hover:bg-[var(--accent-cyan)]/90',
                  'transition-colors'
                )}
              >
                <Play className="w-3.5 h-3.5" />
                시작
              </button>
            )}
          </div>
        )}

        {/* Horizontal Scroll List */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {displayItems.map((content) => (
            <div key={content.id} className="flex-shrink-0 w-52">
              <FeedCard
                content={content}
                compact
                onStartLearning={onStartLearning}
                onClick={onContentClick}
              />
            </div>
          ))}

          {/* 더보기 */}
          {remainingCount > 0 && (
            <div
              className={cn(
                'flex-shrink-0 w-24 flex flex-col items-center justify-center',
                'rounded-lg border border-dashed border-[var(--border-subtle)]',
                'text-[var(--text-muted)]'
              )}
            >
              <span className="text-lg font-semibold">+{remainingCount}</span>
              <span className="text-xs">더보기</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Render: Full Mode (Vertical List)
  // ----------------------------------------

  return (
    <div className="space-y-3">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              학습 대기열
            </h3>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
              )}
            >
              {queue.length}개
            </span>
          </div>

          {/* 다음 학습 시작 버튼 */}
          {queue.length > 0 && (
            <button
              onClick={() => onStartLearning(queue[0].id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                'bg-[var(--accent-cyan)] text-[var(--bg-primary)]',
                'hover:bg-[var(--accent-cyan)]/90',
                'transition-colors'
              )}
            >
              <Play className="w-4 h-4" />
              다음 학습 시작
            </button>
          )}
        </div>
      )}

      {/* Vertical List */}
      <div className="space-y-2">
        {displayItems.map((content, index) => (
          <div key={content.id} className="flex items-center gap-3">
            {/* 순서 번호 */}
            <div
              className={cn(
                'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
                'text-xs font-medium'
              )}
            >
              {index + 1}
            </div>

            {/* 카드 */}
            <div className="flex-1">
              <FeedCard
                content={content}
                compact
                onStartLearning={onStartLearning}
                onClick={onContentClick}
              />
            </div>
          </div>
        ))}

        {/* 더보기 */}
        {remainingCount > 0 && (
          <button
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-lg',
              'border border-dashed border-[var(--border-subtle)]',
              'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              'hover:border-[var(--border-default)]',
              'transition-colors'
            )}
          >
            <span>나머지 {remainingCount}개 더보기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
