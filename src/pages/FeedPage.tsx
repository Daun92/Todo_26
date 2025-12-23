/**
 * @file FeedPage.tsx
 * @description Feed 페이지 - 콘텐츠 발견 및 관리
 *
 * @checkpoint CP-1.8
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @features
 * - 학습 대기열 표시
 * - 콘텐츠 목록 (필터/정렬)
 * - 빠른 추가 버튼
 * - AI 파트너 제안 카드
 */

import { useEffect } from 'react';
import {
  Plus,
  Compass,
  Link,
  FileText,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { LearningQueue, FeedList } from '@/components/feed';
import { useContents, initializePresetTags } from '@/hooks';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

// ============================================
// Component
// ============================================

export function FeedPage() {
  const { openModal, setActiveTab, setCurrentContentId } = useStore();

  // 콘텐츠 훅
  const {
    contents,
    queue,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    startLearning,
    deleteContent,
    stats,
  } = useContents();

  // 초기화: 기본 태그 설정
  useEffect(() => {
    initializePresetTags();
  }, []);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleStartLearning = async (id: string) => {
    await startLearning(id);
    setCurrentContentId(id);
    setActiveTab('chat'); // Learn 탭으로 이동 (현재는 chat)
  };

  const handleContentClick = (content: { id: string }) => {
    setCurrentContentId(content.id);
    openModal('contentDetail', { contentId: content.id });
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 콘텐츠를 삭제할까요?')) {
      await deleteContent(id);
    }
  };

  const handleEdit = (content: { id: string }) => {
    openModal('editContent', { content });
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className="flex flex-col h-full py-4 space-y-6">
      {/* 헤더 */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Feed
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            오늘 뭘 배워볼까요?
          </p>
        </div>
        <Button onClick={() => openModal('addContent')} className="gap-2">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      {/* 빠른 추가 버튼 */}
      <div className="flex-shrink-0 grid grid-cols-3 gap-3">
        <QuickAction
          icon={Link}
          label="URL 추가"
          onClick={() => openModal('addContent', { type: 'url' })}
          color="cyan"
        />
        <QuickAction
          icon={FileText}
          label="텍스트"
          onClick={() => openModal('addContent', { type: 'note' })}
          color="green"
        />
        <QuickAction
          icon={Lightbulb}
          label="생각"
          onClick={() => openModal('addContent', { type: 'thought' })}
          color="amber"
        />
      </div>

      {/* 학습 대기열 */}
      {(queue.length > 0 || loading) && (
        <div className="flex-shrink-0">
          <LearningQueue
            queue={queue}
            loading={loading}
            onStartLearning={handleStartLearning}
            onContentClick={handleContentClick}
            compact
            maxItems={5}
          />
        </div>
      )}

      {/* 통계 바 (콘텐츠가 있을 때만) */}
      {stats.total > 0 && (
        <div className="flex-shrink-0 flex items-center gap-4 text-sm">
          <StatBadge label="전체" count={stats.total} />
          <StatBadge label="대기" count={stats.queued} color="cyan" />
          <StatBadge label="학습중" count={stats.learning} color="green" />
          <StatBadge label="완료" count={stats.completed} color="amber" />
        </div>
      )}

      {/* 콘텐츠 목록 */}
      <div className="flex-1 min-h-0">
        {contents.length === 0 && !loading && filter.status === 'all' ? (
          // 완전 빈 상태
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <EmptyFeedState onAddContent={() => openModal('addContent')} />

            {/* AI 파트너 제안 */}
            <AIPartnerCard />
          </div>
        ) : (
          // 콘텐츠 목록
          <FeedList
            contents={contents}
            loading={loading}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
            onStartLearning={handleStartLearning}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onContentClick={handleContentClick}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface QuickActionProps {
  icon: typeof Link;
  label: string;
  onClick: () => void;
  color?: 'cyan' | 'green' | 'amber' | 'magenta';
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  color = 'cyan',
}: QuickActionProps) {
  const colorMap = {
    cyan: 'hover:border-[var(--accent-cyan)]/30 hover:bg-[var(--accent-cyan)]/5',
    green: 'hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5',
    amber: 'hover:border-[var(--accent-amber)]/30 hover:bg-[var(--accent-amber)]/5',
    magenta: 'hover:border-[var(--accent-magenta)]/30 hover:bg-[var(--accent-magenta)]/5',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        colorMap[color],
        'transition-all duration-200'
      )}
    >
      <Icon className="w-5 h-5 text-[var(--text-muted)]" />
      <span className="text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
    </button>
  );
}

interface StatBadgeProps {
  label: string;
  count: number;
  color?: 'default' | 'cyan' | 'green' | 'amber';
}

function StatBadge({ label, count, color = 'default' }: StatBadgeProps) {
  const colorMap = {
    default: 'text-[var(--text-muted)]',
    cyan: 'text-[var(--accent-cyan)]',
    green: 'text-[#00ff88]',
    amber: 'text-[var(--accent-amber)]',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={cn('font-semibold', colorMap[color])}>{count}</span>
    </div>
  );
}

interface EmptyFeedStateProps {
  onAddContent: () => void;
}

function EmptyFeedState({ onAddContent }: EmptyFeedStateProps) {
  return (
    <div className="text-center space-y-4">
      <div
        className={cn(
          'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center',
          'bg-[var(--accent-cyan)]/10'
        )}
      >
        <Compass className="w-8 h-8 text-[var(--accent-cyan)]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          아직 콘텐츠가 없어요
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          학습할 콘텐츠를 추가하거나 AI 추천을 받아보세요
        </p>
      </div>
      <Button onClick={onAddContent} className="gap-2">
        <Plus className="w-4 h-4" />
        첫 콘텐츠 추가하기
      </Button>
    </div>
  );
}

function AIPartnerCard() {
  const { openModal } = useStore();

  return (
    <div
      className={cn(
        'w-full max-w-md p-4 rounded-xl',
        'bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-magenta)]/10',
        'border border-[var(--accent-cyan)]/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'bg-[var(--accent-cyan)]/20'
          )}
        >
          <Sparkles className="w-5 h-5 text-[var(--accent-cyan)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            AI 파트너 제안
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            관심사를 알려주시면 맞춤 학습 자료를 추천해드릴게요.
          </p>
          <button
            onClick={() => openModal('setupInterests')}
            className={cn(
              'mt-3 text-sm font-medium',
              'text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80',
              'transition-colors'
            )}
          >
            관심사 설정하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
