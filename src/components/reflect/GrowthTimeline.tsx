/**
 * @file GrowthTimeline.tsx
 * @description 성장 타임라인 컴포넌트
 *
 * @checkpoint CP-4.2
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  BookOpen,
  MessageSquare,
  StickyNote,
  Link2,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, EmptyState } from '@/components/ui';
import { useGrowthTimeline, type GrowthTimelineItem } from '@/hooks/useReflections';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface GrowthTimelineProps {
  limit?: number;
  compact?: boolean;
  showFilters?: boolean;
  className?: string;
}

type TimelineFilter = 'all' | 'content' | 'interview' | 'memo' | 'connection' | 'reflection';

// ============================================
// Helper Functions
// ============================================

function getTimelineIcon(type: GrowthTimelineItem['type']) {
  switch (type) {
    case 'content':
      return BookOpen;
    case 'interview':
      return MessageSquare;
    case 'memo':
      return StickyNote;
    case 'connection':
      return Link2;
    case 'reflection':
      return BarChart3;
    default:
      return Calendar;
  }
}

function getTimelineColor(type: GrowthTimelineItem['type']) {
  switch (type) {
    case 'content':
      return 'bg-indigo-500';
    case 'interview':
      return 'bg-green-500';
    case 'memo':
      return 'bg-amber-500';
    case 'connection':
      return 'bg-purple-500';
    case 'reflection':
      return 'bg-pink-500';
    default:
      return 'bg-slate-500';
  }
}

function getTimelineLabel(type: GrowthTimelineItem['type']) {
  switch (type) {
    case 'content':
      return '콘텐츠';
    case 'interview':
      return '인터뷰';
    case 'memo':
      return '메모';
    case 'connection':
      return '연결';
    case 'reflection':
      return '회고';
    default:
      return '';
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

function groupByDate(items: GrowthTimelineItem[]): Record<string, GrowthTimelineItem[]> {
  const groups: Record<string, GrowthTimelineItem[]> = {};

  items.forEach(item => {
    const dateKey = item.date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  return groups;
}

// ============================================
// Timeline Item Component
// ============================================

interface TimelineItemProps {
  item: GrowthTimelineItem;
  isLast: boolean;
  compact?: boolean;
}

function TimelineItem({ item, isLast, compact }: TimelineItemProps) {
  const Icon = getTimelineIcon(item.type);
  const color = getTimelineColor(item.type);

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
          color
        )}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-6', compact && 'pb-4')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-medium text-slate-900 dark:text-white',
              compact ? 'text-sm' : 'text-base'
            )}>
              {item.title}
            </p>
            {item.description && !compact && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {item.description}
              </p>
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
            {formatRelativeTime(item.date)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function GrowthTimeline({
  limit = 20,
  compact = false,
  showFilters = true,
  className,
}: GrowthTimelineProps) {
  const timeline = useGrowthTimeline(limit);
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredTimeline = filter === 'all'
    ? timeline
    : timeline.filter(item => item.type === filter);

  const displayedItems = expanded ? filteredTimeline : filteredTimeline.slice(0, compact ? 5 : 10);
  const hasMore = filteredTimeline.length > displayedItems.length;

  const filters: { value: TimelineFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'content', label: '콘텐츠' },
    { value: 'interview', label: '인터뷰' },
    { value: 'memo', label: '메모' },
    { value: 'connection', label: '연결' },
  ];

  if (timeline.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="아직 활동이 없어요"
            description="콘텐츠를 추가하고 학습을 시작하면 성장 기록이 쌓여요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      {showFilters && !compact && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className={compact ? 'py-4' : ''}>
          <div className="space-y-0">
            {displayedItems.map((item, index) => (
              <TimelineItem
                key={`${item.relatedId}-${index}`}
                item={item}
                isLast={index === displayedItems.length - 1}
                compact={compact}
              />
            ))}
          </div>

          {/* Show More/Less */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  더 보기 ({filteredTimeline.length - displayedItems.length}개)
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {!compact && (
        <div className="flex gap-2 flex-wrap">
          {filters.slice(1).map(f => {
            const count = timeline.filter(item => item.type === f.value).length;
            if (count === 0) return null;
            return (
              <Badge key={f.value} variant="secondary">
                {f.label} {count}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// Grouped Timeline Component
// ============================================

interface GroupedTimelineProps {
  className?: string;
}

export function GroupedTimeline({ className }: GroupedTimelineProps) {
  const timeline = useGrowthTimeline(50);
  const grouped = groupByDate(timeline);
  const dates = Object.keys(grouped);

  if (timeline.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="아직 활동이 없어요"
            description="학습 활동을 시작하면 여기에 기록돼요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {dates.map(date => (
        <div key={date}>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            {date}
          </h3>
          <Card>
            <CardContent>
              {grouped[date].map((item, index) => (
                <TimelineItem
                  key={`${item.relatedId}-${index}`}
                  item={item}
                  isLast={index === grouped[date].length - 1}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
