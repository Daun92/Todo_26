/**
 * @file MemoEditor.tsx
 * @description 메모 에디터 컴포넌트
 *
 * @checkpoint CP-2.4
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - 메모 작성/수정
 * - 태그 추가
 * - 콘텐츠/세션 연결
 * - 자동 저장
 *
 * @dependencies
 * - src/hooks/useMemos.ts
 * - src/components/feed/TagSelector.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StickyNote,
  Tag as TagIcon,
  Link2,
  Check,
  X,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { TagSelector } from '@/components/feed/TagSelector';
import { cn } from '@/lib/utils';
import type { Memo, Content } from '@/types';

// ============================================
// Types
// ============================================

interface MemoEditorProps {
  /** 수정할 메모 (없으면 새 메모) */
  memo?: Memo;
  /** 연결할 콘텐츠 */
  content?: Content;
  /** 연결할 세션 ID */
  sessionId?: string;
  /** 저장 핸들러 */
  onSave: (data: MemoSaveData) => Promise<void>;
  /** 삭제 핸들러 */
  onDelete?: (id: string) => Promise<void>;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 자동 저장 활성화 */
  autoSave?: boolean;
  /** 자동 저장 딜레이 (ms) */
  autoSaveDelay?: number;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 최소 높이 */
  minHeight?: number;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

export interface MemoSaveData {
  text: string;
  tags: string[];
  contentId?: string;
  sessionId?: string;
}

// ============================================
// Component
// ============================================

export function MemoEditor({
  memo,
  content,
  sessionId,
  onSave,
  onDelete,
  onCancel,
  autoSave = false,
  autoSaveDelay = 2000,
  placeholder = '떠오른 생각을 자유롭게 적어보세요...',
  minHeight = 100,
  compact = false,
  className,
}: MemoEditorProps) {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [text, setText] = useState(memo?.text || '');
  const [tags, setTags] = useState<string[]>(memo?.tags || []);
  const [showTags, setShowTags] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // 자동 저장
  useEffect(() => {
    if (!autoSave || !hasChanges) return;

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, autoSaveDelay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [text, tags, autoSave, hasChanges]);

  // 메모 변경 감지
  useEffect(() => {
    if (memo) {
      setText(memo.text);
      setTags(memo.tags);
      setHasChanges(false);
    }
  }, [memo]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleTextChange = (value: string) => {
    setText(value);
    setHasChanges(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        text: text.trim(),
        tags,
        contentId: content?.id || memo?.contentId,
        sessionId: sessionId || memo?.sessionId,
      });
      setHasChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSaving(false);
    }
  }, [text, tags, content, sessionId, memo, onSave]);

  const handleDelete = async () => {
    if (!memo || !onDelete) return;

    if (window.confirm('이 메모를 삭제할까요?')) {
      await onDelete(memo.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter로 저장
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    // Escape로 취소
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        'focus-within:border-[var(--accent-amber)]/50',
        'transition-colors',
        className
      )}
    >
      {/* 헤더 */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-[var(--accent-amber)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {memo ? '메모 수정' : '새 메모'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* 저장 상태 */}
            {autoSave && lastSaved && (
              <span className="text-xs text-[var(--text-muted)] mr-2">
                {formatLastSaved(lastSaved)}
              </span>
            )}

            {/* 태그 토글 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTags(!showTags)}
              className={cn(
                showTags ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'
              )}
            >
              <TagIcon className="w-4 h-4" />
            </Button>

            {/* 더보기 메뉴 */}
            {memo && onDelete && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-[var(--text-muted)]"
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
                    <button
                      onClick={handleDelete}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm',
                        'text-red-400 hover:bg-red-500/10'
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 연결된 콘텐츠 표시 */}
      {content && !compact && (
        <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link2 className="w-3.5 h-3.5" />
            <span>연결됨:</span>
            <span className="text-[var(--text-secondary)]">{content.title}</span>
          </div>
        </div>
      )}

      {/* 태그 입력 */}
      {showTags && (
        <div className="px-4 py-2 border-b border-[var(--border-subtle)]">
          <TagSelector
            selectedTags={tags}
            onChange={handleTagsChange}
            placeholder="태그 추가..."
            maxTags={5}
          />
        </div>
      )}

      {/* 텍스트 입력 */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 bg-transparent resize-none',
          'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'focus:outline-none'
        )}
        style={{ minHeight }}
      />

      {/* 푸터 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {/* 태그 미리보기 */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]'
                  )}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-[var(--text-muted)]">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 변경 사항 표시 */}
          {hasChanges && !autoSave && (
            <span className="text-xs text-[var(--accent-amber)]">
              저장되지 않은 변경사항
            </span>
          )}

          {/* 취소 버튼 */}
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
          )}

          {/* 저장 버튼 */}
          {!autoSave && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!text.trim() || isSaving}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Compact Memo Card
// ============================================

interface MemoCardProps {
  memo: Memo;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function MemoCard({ memo, onClick, onDelete, className }: MemoCardProps) {
  return (
    <div
      className={cn(
        'group p-3 rounded-xl cursor-pointer',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        'hover:border-[var(--accent-amber)]/30',
        'transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[var(--text-primary)] line-clamp-3">
          {memo.text}
        </p>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(memo.id);
            }}
            className={cn(
              'opacity-0 group-hover:opacity-100',
              'p-1 rounded text-[var(--text-muted)] hover:text-red-400',
              'transition-all'
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          {memo.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                'px-1.5 py-0.5 rounded text-xs',
                'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]/80'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="text-xs text-[var(--text-muted)]">
          {formatDate(memo.createdAt)}
        </span>
      </div>

      {/* 정리되지 않은 메모 표시 */}
      {!memo.organized && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--accent-amber)]">
            📋 정리 필요
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Utilities
// ============================================

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return '방금 저장됨';
  if (seconds < 60) return `${seconds}초 전 저장`;
  return `${Math.floor(seconds / 60)}분 전 저장`;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;

  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
