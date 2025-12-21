/**
 * @file AddContentModal.tsx
 * @description 콘텐츠 추가 모달 - URL, 텍스트, 생각 추가
 *
 * @checkpoint CP-1.7
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @improvements
 * - TagSelector 컴포넌트 통합
 * - useContents 훅 사용
 * - Neural 테마 스타일링
 * - 대척점 필드 추가
 */

import { useState } from 'react';
import {
  Link,
  FileText,
  Lightbulb,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { TagSelector } from '@/components/feed/TagSelector';
import { useContents } from '@/hooks';
import { extractDomain } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (content: Content) => void;
}

type ContentType = 'url' | 'note' | 'thought';

// ============================================
// Component
// ============================================

export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddContentModalProps) {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [type, setType] = useState<ContentType>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [counterpoint, setCounterpoint] = useState('');
  const [showCounterpoint, setShowCounterpoint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addContent } = useContents();

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const resetForm = () => {
    setType('url');
    setTitle('');
    setUrl('');
    setBody('');
    setTags([]);
    setCounterpoint('');
    setShowCounterpoint(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (type === 'url') {
      if (!url.trim()) {
        setError('URL을 입력해주세요');
        return false;
      }
      // URL 형식 검증
      try {
        new URL(url.trim());
      } catch {
        setError('올바른 URL 형식이 아닙니다');
        return false;
      }
    }

    if ((type === 'note' || type === 'thought') && !body.trim()) {
      setError('내용을 입력해주세요');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const content = await addContent({
        type: type === 'thought' ? 'thought' : type === 'url' ? 'article' : 'note',
        title: title.trim() || (type === 'url' ? extractDomain(url) : '무제'),
        url: type === 'url' ? url.trim() : undefined,
        source: type === 'url' ? extractDomain(url) : undefined,
        body: body.trim() || undefined,
        tags,
        counterpoint: counterpoint.trim() || undefined,
      });

      onSuccess?.(content);
      handleClose();
    } catch (err) {
      console.error('Failed to add content:', err);
      setError('콘텐츠 추가에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="콘텐츠 추가">
      <div className="space-y-5">
        {/* 에러 메시지 */}
        {error && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg',
              'bg-red-500/10 border border-red-500/20',
              'text-red-400 text-sm'
            )}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 타입 선택 */}
        <div className="flex gap-2">
          <TypeButton
            icon={Link}
            label="URL"
            description="웹 아티클"
            active={type === 'url'}
            onClick={() => setType('url')}
          />
          <TypeButton
            icon={FileText}
            label="텍스트"
            description="직접 작성"
            active={type === 'note'}
            onClick={() => setType('note')}
          />
          <TypeButton
            icon={Lightbulb}
            label="생각"
            description="아이디어"
            active={type === 'thought'}
            onClick={() => setType('thought')}
          />
        </div>

        {/* URL 입력 */}
        {type === 'url' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              autoFocus
              className={cn(
                'w-full px-4 py-2.5 rounded-xl',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-[var(--accent-cyan)]/50',
                'transition-colors'
              )}
            />
          </div>
        )}

        {/* 제목 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            제목 {type !== 'url' && <span className="text-[var(--text-muted)]">(선택)</span>}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'url'
                ? 'URL에서 자동 추출됩니다'
                : type === 'thought'
                ? '생각의 제목'
                : '콘텐츠 제목'
            }
            autoFocus={type !== 'url'}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--accent-cyan)]/50',
              'transition-colors'
            )}
          />
        </div>

        {/* 본문 */}
        {(type === 'note' || type === 'thought') && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
              내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                type === 'thought'
                  ? '떠오른 생각을 자유롭게 적어주세요...'
                  : '내용을 입력하세요...'
              }
              rows={4}
              className={cn(
                'w-full px-4 py-3 rounded-xl resize-none',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-[var(--accent-cyan)]/50',
                'transition-colors'
              )}
            />
          </div>
        )}

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

        {/* 대척점 토글 */}
        <div>
          <button
            type="button"
            onClick={() => setShowCounterpoint(!showCounterpoint)}
            className={cn(
              'flex items-center gap-2 text-sm',
              showCounterpoint
                ? 'text-[var(--accent-magenta)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              'transition-colors'
            )}
          >
            <Lightbulb className="w-4 h-4" />
            {showCounterpoint ? '대척점 숨기기' : '대척점 추가 (반대 관점)'}
          </button>

          {showCounterpoint && (
            <div className="mt-2 space-y-1.5">
              <textarea
                value={counterpoint}
                onChange={(e) => setCounterpoint(e.target.value)}
                placeholder="이 콘텐츠와 반대되는 관점이나 주의할 점을 메모해두세요..."
                rows={2}
                className={cn(
                  'w-full px-4 py-3 rounded-xl resize-none',
                  'bg-[var(--accent-magenta)]/5 border border-[var(--accent-magenta)]/20',
                  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:border-[var(--accent-magenta)]/50',
                  'transition-colors'
                )}
              />
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? '추가 중...' : '추가'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Sub Components
// ============================================

interface TypeButtonProps {
  icon: typeof Link;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function TypeButton({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: TypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
        active
          ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/10'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5',
          active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'
        )}
      />
      <span
        className={cn(
          'text-sm font-medium',
          active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'
        )}
      >
        {label}
      </span>
      <span className="text-xs text-[var(--text-muted)]">{description}</span>
    </button>
  );
}
