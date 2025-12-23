/**
 * @file Skeleton.tsx
 * @description 로딩 스켈레톤 컴포넌트
 *
 * @checkpoint CP-6.3
 * @created 2025-12-23
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-tertiary)]',
        animation === 'pulse' && 'animate-pulse',
        animation === 'shimmer' && 'animate-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        variant === 'text' && 'rounded h-4',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// ============================================
// Preset Skeletons
// ============================================

export function FeedCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-start gap-3">
        <Skeleton variant="rectangular" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton variant="rectangular" className="w-16 h-6" />
        <Skeleton variant="rectangular" className="w-16 h-6" />
      </div>
    </div>
  );
}

export function FeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function QueueSkeleton() {
  return (
    <div className="rounded-xl p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="rectangular" className="w-16 h-8" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-48">
            <Skeleton variant="rectangular" className="h-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GraphSkeleton() {
  return (
    <div className="w-full h-64 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center">
      <div className="relative">
        <Skeleton variant="circular" className="w-16 h-16" />
        <Skeleton variant="circular" className="w-12 h-12 absolute -top-4 -right-8" />
        <Skeleton variant="circular" className="w-10 h-10 absolute -bottom-2 -left-10" />
        <Skeleton variant="circular" className="w-8 h-8 absolute top-2 -left-12" />
        <Skeleton variant="circular" className="w-14 h-14 absolute -bottom-6 right-4" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <Skeleton variant="text" className="w-16 h-3 mb-2" />
          <Skeleton variant="text" className="w-12 h-6" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24 h-8" />
        <Skeleton variant="rectangular" className="w-20 h-10" />
      </div>
      <QueueSkeleton />
      <FeedListSkeleton count={3} />
    </div>
  );
}
