/**
 * @file FeedList.tsx
 * @description 콘텐츠 목록 컴포넌트 - 필터링/정렬된 콘텐츠 목록 표시
 *
 * @checkpoint CP-1.4
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @features
 * - FeedCard 목록 렌더링
 * - 필터 바 (상태별, 타입별)
 * - 정렬 옵션
 * - 검색 기능
 * - 빈 상태 처리
 */

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SortDesc,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Edit3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedCard, type FeedCardProps } from './FeedCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Content } from '@/types';
import type { ContentFilter, ContentSort } from '@/hooks/useContents';

// ============================================
// Types
// ============================================

export interface FeedListProps {
  contents: Content[];
  loading?: boolean;
  filter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
  sort: ContentSort;
  onSortChange: (sort: ContentSort) => void;
  onStartLearning?: (id: string) => void;
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  onContentClick?: (content: Content) => void;
  emptyMessage?: string;
}

// ============================================
// Constants
// ============================================

const STATUS_OPTIONS = [
  { value: 'all', label: '전체', icon: null },
  { value: 'queued', label: '대기', icon: Clock },
  { value: 'learning', label: '학습중', icon: BookOpen },
  { value: 'completed', label: '완료', icon: CheckCircle2 },
] as const;

const TYPE_OPTIONS = [
  { value: 'all', label: '전체', icon: null },
  { value: 'article', label: '아티클', icon: FileText },
  { value: 'url', label: 'URL', icon: LinkIcon },
  { value: 'note', label: '노트', icon: Edit3 },
  { value: 'thought', label: '생각', icon: MessageSquare },
] as const;

const SORT_OPTIONS = [
  { field: 'createdAt', direction: 'desc', label: '최신순' },
  { field: 'createdAt', direction: 'asc', label: '오래된순' },
  { field: 'title', direction: 'asc', label: '제목순' },
] as const;

// ============================================
// Component
// ============================================

export function FeedList({
  contents,
  loading = false,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  onStartLearning,
  onEdit,
  onDelete,
  onContentClick,
  emptyMessage = '콘텐츠가 없습니다',
}: FeedListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filter.search || '');

  // 검색 디바운스
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // 300ms 디바운스는 실제 앱에서 useDebounce 훅으로 처리 권장
    onFilterChange({ ...filter, search: value });
  };

  // 필터 클리어
  const clearFilters = () => {
    setSearchValue('');
    onFilterChange({ status: 'all', type: 'all', search: '' });
  };

  // 활성 필터 여부
  const hasActiveFilters = useMemo(() => {
    return (
      (filter.status && filter.status !== 'all') ||
      (filter.type && filter.type !== 'all') ||
      (filter.search && filter.search.trim() !== '')
    );
  }, [filter]);

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* 검색 & 필터 바 */}
      <div className="flex-shrink-0 space-y-3 mb-4">
        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="검색..."
            className={cn(
              'w-full pl-10 pr-10 py-2.5 rounded-xl',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--accent-cyan)]/50',
              'transition-colors'
            )}
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--bg-tertiary)]"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
              'border transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]'
                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            )}
          >
            <Filter className="w-4 h-4" />
            필터
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
            )}
          </button>

          {/* 정렬 */}
          <div className="relative group">
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'text-[var(--text-secondary)]',
                'hover:border-[var(--border-default)]',
                'transition-colors'
              )}
            >
              <SortDesc className="w-4 h-4" />
              {SORT_OPTIONS.find(
                (o) => o.field === sort.field && o.direction === sort.direction
              )?.label || '정렬'}
            </button>

            {/* 정렬 드롭다운 */}
            <div
              className={cn(
                'absolute left-0 top-full mt-1 z-50',
                'w-32 py-1 rounded-lg',
                'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
                'shadow-xl',
                'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                'transition-all duration-200'
              )}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={`${option.field}-${option.direction}`}
                  onClick={() =>
                    onSortChange({
                      field: option.field as ContentSort['field'],
                      direction: option.direction as ContentSort['direction'],
                    })
                  }
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm',
                    'hover:bg-[var(--bg-tertiary)]',
                    sort.field === option.field && sort.direction === option.direction
                      ? 'text-[var(--accent-cyan)]'
                      : 'text-[var(--text-secondary)]',
                    'transition-colors'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 필터 클리어 */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm',
                'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                'transition-colors'
              )}
            >
              <X className="w-4 h-4" />
              초기화
            </button>
          )}

          {/* 결과 수 */}
          <span className="ml-auto text-sm text-[var(--text-muted)]">
            {contents.length}개
          </span>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div
            className={cn(
              'p-4 rounded-xl space-y-4',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
            )}
          >
            {/* 상태 필터 */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                상태
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = filter.status === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        onFilterChange({
                          ...filter,
                          status: option.value as ContentFilter['status'],
                        })
                      }
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                        'border transition-colors',
                        isActive
                          ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]'
                          : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 타입 필터 */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                타입
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = filter.type === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() =>
                        onFilterChange({
                          ...filter,
                          type: option.value as ContentFilter['type'],
                        })
                      }
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                        'border transition-colors',
                        isActive
                          ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]'
                          : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 콘텐츠 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          // 로딩 스켈레톤
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-32 rounded-xl animate-pulse',
                  'bg-[var(--bg-secondary)]'
                )}
              />
            ))}
          </>
        ) : contents.length === 0 ? (
          // 빈 상태
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? '검색 결과가 없습니다' : '콘텐츠가 없습니다'}
            description={
              hasActiveFilters
                ? '다른 검색어나 필터를 시도해보세요'
                : '새로운 콘텐츠를 추가해보세요'
            }
          />
        ) : (
          // 콘텐츠 카드 목록
          contents.map((content) => (
            <FeedCard
              key={content.id}
              content={content}
              onStartLearning={onStartLearning}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onContentClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
