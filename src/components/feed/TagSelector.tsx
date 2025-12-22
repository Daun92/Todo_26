/**
 * @file TagSelector.tsx
 * @description 태그 선택 컴포넌트 - 검색 및 선택 UI
 *
 * @checkpoint CP-1.6
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @features
 * - 태그 검색 (자동완성)
 * - 새 태그 생성
 * - 선택된 태그 표시 및 제거
 * - 인기 태그 추천
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, Hash, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTags } from '@/hooks';
import type { Tag } from '@/types';

// ============================================
// Types
// ============================================

export interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  showPopular?: boolean;
  disabled?: boolean;
}

// ============================================
// Component
// ============================================

export function TagSelector({
  selectedTags,
  onChange,
  placeholder = '태그 검색 또는 추가...',
  maxTags = 10,
  showPopular = true,
  disabled = false,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { tags, searchTags, getPopularTags, addTag } = useTags();

  // ----------------------------------------
  // Computed
  // ----------------------------------------

  // 검색 결과
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) {
      // 인기 태그 (선택되지 않은 것만)
      return getPopularTags(8).filter((t) => !selectedTags.includes(t.name));
    }

    // 검색 결과 (선택되지 않은 것만)
    return searchTags(inputValue).filter((t) => !selectedTags.includes(t.name));
  }, [inputValue, selectedTags, searchTags, getPopularTags]);

  // 새 태그 생성 가능 여부
  const canCreateNew = useMemo(() => {
    if (!inputValue.trim()) return false;

    const normalized = inputValue.trim().toLowerCase();

    // 이미 존재하는 태그인지 확인
    const exists = tags.some((t) => t.name === normalized);
    if (exists) return false;

    // 이미 선택된 태그인지 확인
    if (selectedTags.includes(normalized)) return false;

    // 최대 개수 초과 확인
    if (selectedTags.length >= maxTags) return false;

    return true;
  }, [inputValue, tags, selectedTags, maxTags]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleSelectTag = async (tagName: string) => {
    if (selectedTags.length >= maxTags) return;
    if (selectedTags.includes(tagName)) return;

    onChange([...selectedTags, tagName]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleCreateTag = async () => {
    if (!canCreateNew) return;

    const normalized = inputValue.trim().toLowerCase();

    try {
      await addTag(normalized);
      await handleSelectTag(normalized);
    } catch (error) {
      console.error('태그 생성 실패:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (canCreateNew) {
        handleCreateTag();
      } else if (suggestions.length > 0) {
        handleSelectTag(suggestions[0].name);
      }
    }

    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div ref={containerRef} className="relative">
      {/* 입력 필드 + 선택된 태그 */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 rounded-xl',
          'bg-[var(--bg-secondary)] border',
          isOpen
            ? 'border-[var(--accent-cyan)]/50'
            : 'border-[var(--border-subtle)]',
          disabled && 'opacity-50 cursor-not-allowed',
          'transition-colors'
        )}
      >
        {/* 선택된 태그들 */}
        {selectedTags.map((tagName) => (
          <span
            key={tagName}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm',
              'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
            )}
          >
            <Hash className="w-3 h-3" />
            {tagName}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tagName);
                }}
                className="p-0.5 hover:bg-[var(--accent-cyan)]/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* 입력 필드 */}
        {selectedTags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-[100px] bg-transparent outline-none',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'text-sm'
            )}
          />
        )}
      </div>

      {/* 드롭다운 */}
      {isOpen && !disabled && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full mt-2 z-50',
            'max-h-64 overflow-y-auto rounded-xl',
            'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
            'shadow-xl'
          )}
        >
          {/* 새 태그 생성 */}
          {canCreateNew && (
            <button
              onClick={handleCreateTag}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2',
                'text-left text-sm text-[var(--accent-cyan)]',
                'hover:bg-[var(--bg-tertiary)]',
                'transition-colors'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>
                "<span className="font-medium">{inputValue.trim()}</span>" 태그 만들기
              </span>
            </button>
          )}

          {/* 구분선 */}
          {canCreateNew && suggestions.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] my-1" />
          )}

          {/* 추천 헤더 */}
          {showPopular && !inputValue && suggestions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)]">
              <TrendingUp className="w-3 h-3" />
              인기 태그
            </div>
          )}

          {/* 검색 결과 / 추천 태그 */}
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleSelectTag(tag.name)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2',
                'text-left text-sm text-[var(--text-secondary)]',
                'hover:bg-[var(--bg-tertiary)]',
                'transition-colors'
              )}
            >
              <span className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {tag.name}
              </span>
              {tag.count > 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  {tag.count}
                </span>
              )}
            </button>
          ))}

          {/* 결과 없음 */}
          {!canCreateNew && suggestions.length === 0 && inputValue && (
            <div className="px-3 py-4 text-center text-sm text-[var(--text-muted)]">
              검색 결과가 없습니다
            </div>
          )}

          {/* 태그 없음 */}
          {!inputValue && suggestions.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-[var(--text-muted)]">
              태그를 입력하세요
            </div>
          )}
        </div>
      )}

      {/* 최대 개수 안내 */}
      {selectedTags.length >= maxTags && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          최대 {maxTags}개까지 선택 가능합니다
        </p>
      )}
    </div>
  );
}
