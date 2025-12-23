/**
 * @file SortableQueueItem.tsx
 * @description 드래그앤드롭 가능한 학습 큐 아이템
 *
 * @checkpoint CP-6.2
 * @created 2025-12-23
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedCard } from './FeedCard';
import type { Content } from '@/types';

interface SortableQueueItemProps {
  content: Content;
  onStartLearning: (id: string) => void;
  onContentClick?: (content: Content) => void;
  compact?: boolean;
}

export function SortableQueueItem({
  content,
  onStartLearning,
  onContentClick,
  compact = true,
}: SortableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg cursor-grab active:cursor-grabbing',
          'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          'hover:bg-[var(--bg-tertiary)]',
          'transition-colors touch-none'
        )}
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Content Card */}
      <div className="flex-1 min-w-0">
        <FeedCard
          content={content}
          compact={compact}
          onStartLearning={onStartLearning}
          onClick={onContentClick}
        />
      </div>
    </div>
  );
}
