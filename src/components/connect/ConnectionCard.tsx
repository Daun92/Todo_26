/**
 * @file ConnectionCard.tsx
 * @description 연결 카드 컴포넌트
 *
 * @checkpoint CP-3.3
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - 연결 정보 표시
 * - 연결 강도 시각화
 * - 수정/삭제 액션
 */

import { useState } from 'react';
import {
  Link2,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit2,
  BookOpen,
  StickyNote,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Connection } from '@/types';
import { CONNECTION_TYPES, type ConnectionType } from '@/hooks/useConnections';

// ============================================
// Types
// ============================================

interface ConnectionCardProps {
  /** 연결 데이터 */
  connection: Connection;
  /** 소스 레이블 */
  sourceLabel: string;
  /** 타겟 레이블 */
  targetLabel: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 수정 핸들러 */
  onEdit?: () => void;
  /** 삭제 핸들러 */
  onDelete?: () => void;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

// ============================================
// Component
// ============================================

export function ConnectionCard({
  connection,
  sourceLabel,
  targetLabel,
  onClick,
  onEdit,
  onDelete,
  compact = false,
  className,
}: ConnectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = CONNECTION_TYPES[connection.relationship as ConnectionType] || {
    label: connection.relationship,
    color: 'gray',
  };

  const TypeIcon = getTypeIcon(connection.sourceType);
  const TargetIcon = getTypeIcon(connection.targetType);

  // ----------------------------------------
  // Compact Render
  // ----------------------------------------
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-left w-full',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
          'hover:border-[var(--accent-cyan)]/30',
          'transition-colors',
          className
        )}
      >
        <TypeIcon className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-primary)] truncate flex-1">
          {sourceLabel}
        </span>
        <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-primary)] truncate flex-1">
          {targetLabel}
        </span>
        <StrengthIndicator strength={connection.strength} size="sm" />
      </button>
    );
  }

  // ----------------------------------------
  // Full Render
  // ----------------------------------------
  return (
    <div
      className={cn(
        'relative p-4 rounded-xl',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        'hover:border-[var(--accent-cyan)]/30',
        'transition-colors group',
        className
      )}
      onClick={onClick}
    >
      {/* Menu */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showMenu && (
            <div
              className={cn(
                'absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg z-10',
                'bg-[var(--bg-primary)] border border-[var(--border-subtle)]',
                'shadow-lg'
              )}
            >
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit();
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  )}
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete();
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'text-red-400 hover:bg-red-500/10'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Connection Visualization */}
      <div className="flex items-center gap-3">
        {/* Source */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'bg-[var(--accent-cyan)]/10'
              )}
            >
              <TypeIcon className="w-4 h-4 text-[var(--accent-cyan)]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {sourceLabel}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {getTypeLabel(connection.sourceType)}
              </p>
            </div>
          </div>
        </div>

        {/* Relationship */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              getRelationshipColor(typeConfig.color)
            )}
          >
            {typeConfig.label}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-0.5 bg-[var(--border-default)]" />
            <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
            <div className="w-8 h-0.5 bg-[var(--border-default)]" />
          </div>
          <StrengthIndicator strength={connection.strength} />
        </div>

        {/* Target */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-end">
            <div className="min-w-0 text-right">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {targetLabel}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {getTypeLabel(connection.targetType)}
              </p>
            </div>
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'bg-[var(--accent-amber)]/10'
              )}
            >
              <TargetIcon className="w-4 h-4 text-[var(--accent-amber)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-[var(--text-muted)] mt-3 text-right">
        {formatDate(connection.createdAt)}
      </p>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface StrengthIndicatorProps {
  strength: number;
  size?: 'sm' | 'md';
}

function StrengthIndicator({ strength, size = 'md' }: StrengthIndicatorProps) {
  const dots = size === 'sm' ? 5 : 10;
  const filledDots = Math.round((strength / 10) * dots);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full',
            size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5',
            i < filledDots
              ? 'bg-[var(--accent-cyan)]'
              : 'bg-[var(--border-default)]'
          )}
        />
      ))}
    </div>
  );
}

// ============================================
// Utilities
// ============================================

function getTypeIcon(type: Connection['sourceType']) {
  switch (type) {
    case 'content':
      return BookOpen;
    case 'memo':
      return StickyNote;
    case 'tag':
      return Tag;
    default:
      return Link2;
  }
}

function getTypeLabel(type: Connection['sourceType']): string {
  switch (type) {
    case 'content':
      return '콘텐츠';
    case 'memo':
      return '메모';
    case 'tag':
      return '태그';
    default:
      return type;
  }
}

function getRelationshipColor(color: string): string {
  const colorMap: Record<string, string> = {
    cyan: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]',
    magenta: 'bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)]',
    amber: 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]',
    green: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
    orange: 'bg-orange-500/10 text-orange-500',
    blue: 'bg-blue-500/10 text-blue-500',
    gray: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]',
  };
  return colorMap[color] || colorMap.gray;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
