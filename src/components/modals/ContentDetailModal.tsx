/**
 * @file ContentDetailModal.tsx
 * @description 콘텐츠 상세 정보 모달
 *
 * @checkpoint CP-6.1
 * @created 2025-12-23
 *
 * @features
 * - 콘텐츠 전체 정보 표시
 * - AI 요약 생성/표시
 * - 대척점 표시
 * - 편집/삭제 기능
 * - 학습 시작 버튼
 */

import { useState } from 'react';
import {
  ExternalLink,
  Play,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { Modal, Button, Badge } from '@/components/ui';
import { useContent, useTags, useAI } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string | null;
  onStartLearning?: (id: string) => void;
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
}

// ============================================
// Component
// ============================================

export function ContentDetailModal({
  isOpen,
  onClose,
  contentId,
  onStartLearning,
  onEdit,
  onDelete,
}: ContentDetailModalProps) {
  const { content, loading } = useContent(contentId);
  const { tags } = useTags();
  const { summarize, isLoading: aiLoading } = useAI();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleStartLearning = () => {
    if (content && onStartLearning) {
      onStartLearning(content.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (content && onEdit) {
      onEdit(content);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (content && onDelete) {
      await onDelete(content.id);
      onClose();
    }
  };

  const handleGenerateSummary = async () => {
    if (!content) return;
    const result = await summarize(content);
    if (result) {
      setAiSummary(result.summary);
    }
  };

  // ----------------------------------------
  // Helpers
  // ----------------------------------------

  const getStatusInfo = (status: Content['status']) => {
    switch (status) {
      case 'queued':
        return {
          label: '대기 중',
          icon: Clock,
          color: 'text-[var(--accent-cyan)]',
          bg: 'bg-[var(--accent-cyan)]/10',
        };
      case 'learning':
        return {
          label: '학습 중',
          icon: BookOpen,
          color: 'text-[#00ff88]',
          bg: 'bg-[#00ff88]/10',
        };
      case 'completed':
        return {
          label: '완료',
          icon: CheckCircle,
          color: 'text-[var(--accent-amber)]',
          bg: 'bg-[var(--accent-amber)]/10',
        };
    }
  };

  const getTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'article':
      case 'url':
        return LinkIcon;
      case 'note':
        return FileText;
      case 'thought':
        return Lightbulb;
      default:
        return FileText;
    }
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId || t.name === tagId);
    return tag?.name || tagId;
  };

  // ----------------------------------------
  // Render: Loading
  // ----------------------------------------

  if (loading || !content) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="콘텐츠 상세" size="lg">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-cyan)]" />
        </div>
      </Modal>
    );
  }

  const statusInfo = getStatusInfo(content.status);
  const TypeIcon = getTypeIcon(content.type);

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="콘텐츠 상세" size="lg">
      <div className="space-y-6">
        {/* 헤더: 제목 & 상태 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                'bg-[var(--bg-tertiary)]'
              )}
            >
              <TypeIcon className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] break-words">
                {content.title}
              </h3>
              {content.source && (
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  {content.source}
                </p>
              )}
            </div>
          </div>

          {/* 상태 배지 */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
                statusInfo.bg,
                statusInfo.color
              )}
            >
              <statusInfo.icon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </div>
            <span className="text-sm text-[var(--text-muted)]">
              {formatDate(content.createdAt)}
            </span>
            {content.completedAt && (
              <span className="text-sm text-[var(--text-muted)]">
                (완료: {formatDate(content.completedAt)})
              </span>
            )}
          </div>
        </div>

        {/* URL */}
        {content.url && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              URL
            </label>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80',
                'transition-colors group'
              )}
            >
              <span className="flex-1 truncate text-sm">{content.url}</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100" />
            </a>
          </div>
        )}

        {/* 본문/요약 */}
        {(content.body || content.summary) && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              {content.body ? '내용' : '요약'}
            </label>
            <div
              className={cn(
                'p-4 rounded-lg',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'text-sm text-[var(--text-primary)] leading-relaxed',
                'max-h-48 overflow-y-auto'
              )}
            >
              {content.body || content.summary}
            </div>
          </div>
        )}

        {/* AI 요약 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
              AI 요약
            </label>
            {!aiSummary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                className="text-xs"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    생성 중...
                  </>
                ) : (
                  '요약 생성'
                )}
              </Button>
            )}
          </div>
          {aiSummary ? (
            <div
              className={cn(
                'p-4 rounded-lg',
                'bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-magenta)]/5',
                'border border-[var(--accent-cyan)]/20',
                'text-sm text-[var(--text-primary)] leading-relaxed'
              )}
            >
              {aiSummary}
            </div>
          ) : (
            <div
              className={cn(
                'p-4 rounded-lg text-center',
                'bg-[var(--bg-secondary)] border border-dashed border-[var(--border-subtle)]',
                'text-sm text-[var(--text-muted)]'
              )}
            >
              AI 요약을 생성하려면 버튼을 클릭하세요
            </div>
          )}
        </div>

        {/* 태그 */}
        {content.tags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              태그
            </label>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tagId) => (
                <Badge key={tagId} variant="secondary">
                  #{getTagName(tagId)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 대척점 */}
        {content.counterpoint && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--accent-magenta)] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              대척점 (반대 관점)
            </label>
            <div
              className={cn(
                'p-4 rounded-lg',
                'bg-[var(--accent-magenta)]/5 border border-[var(--accent-magenta)]/20',
                'text-sm text-[var(--text-primary)] leading-relaxed'
              )}
            >
              {content.counterpoint}
            </div>
          </div>
        )}

        {/* 삭제 확인 */}
        {showDeleteConfirm && (
          <div
            className={cn(
              'p-4 rounded-lg',
              'bg-red-500/10 border border-red-500/20'
            )}
          >
            <p className="text-sm text-red-400 mb-3">
              이 콘텐츠를 삭제할까요? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                삭제
              </Button>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex gap-2">
            {onDelete && !showDeleteConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Pencil className="w-4 h-4 mr-1" />
                편집
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              닫기
            </Button>
            {content.status !== 'completed' && onStartLearning && (
              <Button onClick={handleStartLearning} className="gap-2">
                <Play className="w-4 h-4" />
                {content.status === 'learning' ? '학습 계속' : '학습 시작'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
