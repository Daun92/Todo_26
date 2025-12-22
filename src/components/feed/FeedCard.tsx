/**
 * @file FeedCard.tsx
 * @description 콘텐츠 카드 컴포넌트 - Feed에서 개별 콘텐츠를 표시
 *
 * @checkpoint CP-1.3
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @features
 * - 콘텐츠 제목, 소스, 태그 표시
 * - 상태 배지 (대기/학습중/완료)
 * - 대척점 표시 (있는 경우)
 * - 액션 버튼 (학습 시작, 삭제 등)
 */

import { useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit3,
  Play,
  Lightbulb,
  FileText,
  MessageSquare,
  Link as LinkIcon,
  Sparkles,
  Scale,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useAI } from '@/lib/ai-service';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

export interface FeedCardProps {
  content: Content;
  onStartLearning?: (id: string) => void;
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  onClick?: (content: Content) => void;
  onUpdateContent?: (id: string, updates: Partial<Content>) => void;
  showActions?: boolean;
  showAIActions?: boolean;
  compact?: boolean;
}

// ============================================
// Constants
// ============================================

/**
 * 콘텐츠 상태별 설정
 */
const STATUS_CONFIG = {
  queued: {
    label: '대기',
    icon: Clock,
    variant: 'default' as const,
    color: 'text-slate-500',
  },
  learning: {
    label: '학습중',
    icon: BookOpen,
    variant: 'primary' as const,
    color: 'text-indigo-500',
  },
  completed: {
    label: '완료',
    icon: CheckCircle2,
    variant: 'success' as const,
    color: 'text-green-500',
  },
};

/**
 * 콘텐츠 타입별 아이콘
 */
const TYPE_ICONS = {
  article: FileText,
  note: Edit3,
  url: LinkIcon,
  thought: MessageSquare,
};

// ============================================
// Component
// ============================================

export function FeedCard({
  content,
  onStartLearning,
  onEdit,
  onDelete,
  onClick,
  onUpdateContent,
  showActions = true,
  showAIActions = true,
  compact = false,
}: FeedCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<'summary' | 'counterpoint' | null>(null);
  const { isConfigured, summarize, generateCounterpoint } = useAI();

  const statusConfig = STATUS_CONFIG[content.status];
  const StatusIcon = statusConfig.icon;
  const TypeIcon = TYPE_ICONS[content.type];

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleClick = () => {
    onClick?.(content);
  };

  const handleStartLearning = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartLearning?.(content.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(content);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.(content.id);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  // 외부 클릭 시 메뉴 닫기
  const handleBlur = () => {
    setTimeout(() => setMenuOpen(false), 150);
  };

  // AI 요약 생성
  const handleGenerateSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfigured || aiGenerating) return;
    setAiGenerating('summary');
    try {
      const result = await summarize(content);
      if (result) {
        onUpdateContent?.(content.id, { summary: result.summary });
      }
    } finally {
      setAiGenerating(null);
    }
  };

  // AI 대척점 생성
  const handleGenerateCounterpoint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfigured || aiGenerating) return;
    setAiGenerating('counterpoint');
    try {
      const result = await generateCounterpoint(content);
      if (result) {
        onUpdateContent?.(content.id, { counterpoint: result.counterpoint });
      }
    } finally {
      setAiGenerating(null);
    }
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  // 컴팩트 모드 (학습 대기열용)
  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          'group flex items-center gap-3 p-3 rounded-lg cursor-pointer',
          'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]',
          'border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/30',
          'transition-all duration-200'
        )}
      >
        {/* 타입 아이콘 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
          <TypeIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {content.title}
          </p>
          {content.source && (
            <p className="text-xs text-[var(--text-muted)] truncate">
              {content.source}
            </p>
          )}
        </div>

        {/* 학습 시작 버튼 */}
        {content.status === 'queued' && onStartLearning && (
          <button
            onClick={handleStartLearning}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100',
              'bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20',
              'text-[var(--accent-cyan)]',
              'transition-all duration-200'
            )}
          >
            <Play className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // 기본 카드 모드
  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative p-4 rounded-xl cursor-pointer',
        'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]',
        'border border-[var(--border-subtle)]',
        'hover:border-[var(--accent-cyan)]/30',
        'hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]',
        'transition-all duration-200'
      )}
    >
      {/* 상단: 타입 아이콘 + 상태 배지 + 메뉴 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* 타입 아이콘 */}
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
            <TypeIcon className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>

          {/* 상태 배지 */}
          <Badge variant={statusConfig.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* 액션 메뉴 */}
        {showActions && (
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              onBlur={handleBlur}
              className={cn(
                'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                'hover:bg-[var(--bg-tertiary)]',
                'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                'transition-all duration-200'
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* 드롭다운 메뉴 */}
            {menuOpen && (
              <div
                className={cn(
                  'absolute right-0 top-full mt-1 z-50',
                  'w-36 py-1 rounded-lg',
                  'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
                  'shadow-xl'
                )}
              >
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm',
                      'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                      'hover:bg-[var(--bg-tertiary)]',
                      'transition-colors'
                    )}
                  >
                    <Edit3 className="w-4 h-4" />
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm',
                      'text-red-400 hover:text-red-300',
                      'hover:bg-red-500/10',
                      'transition-colors'
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
      </div>

      {/* 제목 */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
        {content.title}
      </h3>

      {/* 소스/URL */}
      {(content.source || content.url) && (
        <div className="flex items-center gap-1 mb-3">
          {content.url ? (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                'text-[var(--text-muted)] hover:text-[var(--accent-cyan)]',
                'transition-colors'
              )}
            >
              <ExternalLink className="w-3 h-3" />
              {content.source || new URL(content.url).hostname}
            </a>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              {content.source}
            </span>
          )}
        </div>
      )}

      {/* 요약 (있는 경우) */}
      {content.summary && (
        <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
          {content.summary}
        </p>
      )}

      {/* 대척점 (있는 경우) */}
      {content.counterpoint && (
        <div
          className={cn(
            'flex items-start gap-2 p-2 rounded-lg mb-3',
            'bg-[var(--accent-magenta)]/10',
            'border border-[var(--accent-magenta)]/20'
          )}
        >
          <Lightbulb className="w-4 h-4 text-[var(--accent-magenta)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            <span className="font-medium text-[var(--accent-magenta)]">대척점:</span>{' '}
            {content.counterpoint}
          </p>
        </div>
      )}

      {/* 태그 */}
      {content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {content.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
              )}
            >
              #{tag}
            </span>
          ))}
          {content.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-[var(--text-muted)]">
              +{content.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 하단: 날짜 + AI 버튼 + 학습 시작 버튼 */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {formatDate(content.createdAt)}
          </span>

          {/* AI 액션 버튼 */}
          {showAIActions && isConfigured && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!content.summary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={!!aiGenerating}
                  className={cn(
                    'p-1 rounded transition-colors',
                    'text-indigo-500 hover:bg-indigo-500/10',
                    'disabled:opacity-50'
                  )}
                  title="AI 요약 생성"
                >
                  {aiGenerating === 'summary' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              {!content.counterpoint && (
                <button
                  onClick={handleGenerateCounterpoint}
                  disabled={!!aiGenerating}
                  className={cn(
                    'p-1 rounded transition-colors',
                    'text-purple-500 hover:bg-purple-500/10',
                    'disabled:opacity-50'
                  )}
                  title="AI 대척점 생성"
                >
                  {aiGenerating === 'counterpoint' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Scale className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 학습 시작 버튼 (대기 상태일 때만) */}
        {content.status === 'queued' && onStartLearning && (
          <button
            onClick={handleStartLearning}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20',
              'text-[var(--accent-cyan)]',
              'transition-colors'
            )}
          >
            <Play className="w-3.5 h-3.5" />
            학습 시작
          </button>
        )}

        {/* 학습중 표시 */}
        {content.status === 'learning' && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--accent-cyan)]">
            <BookOpen className="w-3.5 h-3.5" />
            학습중
          </span>
        )}

        {/* 완료 표시 */}
        {content.status === 'completed' && content.completedAt && (
          <span className="text-xs text-[var(--text-muted)]">
            완료: {formatDate(content.completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

/**
 * 날짜 포맷팅
 */
function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
