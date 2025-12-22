/**
 * @file QuickMemoModal.tsx
 * @description 빠른 메모 작성 모달
 *
 * @checkpoint CP-2.7
 * @created 2025-12-21
 * @updated 2025-12-22
 *
 * @improvements
 * - useMemos 훅 사용
 * - TagSelector 컴포넌트 통합
 * - Neural 테마 스타일링
 * - 콘텐츠/세션 연결 지원
 */

import { useState, useEffect } from 'react';
import {
  StickyNote,
  Send,
  X,
  Link2,
  Sparkles,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { TagSelector } from '@/components/feed/TagSelector';
import { useMemos } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 연결할 콘텐츠 (선택) */
  content?: Content;
  /** 연결할 세션 ID (선택) */
  sessionId?: string;
  /** 성공 콜백 */
  onSuccess?: () => void;
}

// ============================================
// Component
// ============================================

export function QuickMemoModal({
  isOpen,
  onClose,
  content,
  sessionId,
  onSuccess,
}: QuickMemoModalProps) {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addMemo } = useMemos();

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // 모달이 닫힐 때 폼 리셋
  useEffect(() => {
    if (!isOpen) {
      setText('');
      setTags([]);
    }
  }, [isOpen]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addMemo({
        text: text.trim(),
        tags,
        contentId: content?.id,
        sessionId,
      });

      setText('');
      setTags([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter로 저장
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-[var(--accent-amber)]" />
          <span>빠른 메모</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 연결된 콘텐츠 표시 */}
        {content && (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/20'
            )}
          >
            <Link2 className="w-4 h-4 text-[var(--accent-cyan)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              연결됨:
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {content.title}
            </span>
          </div>
        )}

        {/* 세션 연결 표시 */}
        {sessionId && !content && (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-[var(--accent-green)]/5 border border-[var(--accent-green)]/20'
            )}
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-green)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              학습 세션 중 메모
            </span>
          </div>
        )}

        {/* 메모 입력 */}
        <div className="space-y-1.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="떠오르는 생각을 자유롭게 기록하세요..."
            rows={4}
            autoFocus
            className={cn(
              'w-full px-4 py-3 rounded-xl resize-none',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--accent-amber)]/50',
              'transition-colors'
            )}
          />
          <p className="text-xs text-[var(--text-muted)] text-right">
            ⌘ + Enter로 저장
          </p>
        </div>

        {/* 태그 선택 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            태그 <span className="text-[var(--text-muted)]">(선택)</span>
          </label>
          <TagSelector
            selectedTags={tags}
            onChange={setTags}
            placeholder="태그 검색 또는 추가..."
            maxTags={5}
          />
        </div>

        {/* AI 제안 (콘텐츠 연결 시) */}
        {content && (
          <div
            className={cn(
              'p-3 rounded-lg',
              'bg-gradient-to-r from-[var(--accent-cyan)]/5 to-[var(--accent-magenta)]/5',
              'border border-[var(--accent-cyan)]/10'
            )}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[var(--accent-cyan)]">
                  AI 제안
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  이 콘텐츠와 관련된 생각이나 질문을 메모해두면
                  나중에 AI 파트너와 더 깊은 대화를 나눌 수 있어요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
