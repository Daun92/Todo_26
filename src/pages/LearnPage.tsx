/**
 * @file LearnPage.tsx
 * @description Learn 페이지 - 학습 및 메모
 *
 * @checkpoint CP-2.8
 * @created 2025-12-21
 * @updated 2025-12-22
 *
 * @features
 * - 학습 모드 선택 (인터뷰/메모)
 * - 진행 중인 학습 세션 표시
 * - 인터뷰 세션 UI
 * - 최근 메모 목록
 * - 메모 정리 제안
 */

import { useState, useEffect } from 'react';
import {
  BookOpen,
  MessageCircle,
  StickyNote,
  FolderOpen,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import {
  InterviewSession,
  MemoCard,
  LearningProgress,
  LearningSessionSummary,
} from '@/components/learn';
import {
  useInterview,
  useMemos,
  useRecentInterviews,
  useContents,
} from '@/hooks';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

// ============================================
// Component
// ============================================

export function LearnPage() {
  const { openModal, currentContentId, setCurrentContentId } = useStore();

  // ----------------------------------------
  // Hooks
  // ----------------------------------------

  const {
    session,
    state: interviewState,
    exchanges,
    insights,
    currentContent,
    startSession,
    endSession,
    cancelSession,
    addAnswer,
    addInsight,
    addQuestion,
  } = useInterview();

  const { memos, unorganizedMemos, deleteMemo } = useMemos();
  const { sessions: recentSessions } = useRecentInterviews(3);
  const { contents } = useContents({ status: 'queued' });

  // ----------------------------------------
  // Local State
  // ----------------------------------------

  const [showSummary, setShowSummary] = useState(false);
  const [completedSession, setCompletedSession] = useState<typeof session>(null);

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // 콘텐츠 ID가 설정되면 자동으로 세션 시작
  useEffect(() => {
    if (currentContentId && !session) {
      handleStartLearning(currentContentId);
    }
  }, [currentContentId]);

  // 세션 완료 시 요약 표시
  useEffect(() => {
    if (interviewState === 'completed' && session) {
      setCompletedSession(session);
      setShowSummary(true);
    }
  }, [interviewState]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleStartLearning = async (contentId: string) => {
    try {
      await startSession({ contentId });
      // AI 첫 질문 시뮬레이션 (실제로는 Gemini API 연동)
      setTimeout(() => {
        addQuestion('안녕하세요! 이 콘텐츠에서 가장 인상 깊었던 부분은 무엇인가요?');
      }, 1000);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    setCurrentContentId(null);
  };

  const handleCancelSession = () => {
    cancelSession();
    setCurrentContentId(null);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCompletedSession(null);
  };

  const handleSelectContent = (content: Content) => {
    setCurrentContentId(content.id);
    handleStartLearning(content.id);
  };

  // ----------------------------------------
  // Render - 학습 세션 진행 중
  // ----------------------------------------

  if (session && (interviewState === 'active' || interviewState === 'thinking')) {
    return (
      <div className="flex flex-col h-full py-4">
        {/* 진행 상황 (컴팩트) */}
        <div className="flex-shrink-0 mb-4">
          <LearningProgress
            session={session}
            content={currentContent}
            exchangeCount={exchanges.length}
            insightCount={insights.length}
            startTime={session.createdAt}
            compact
          />
        </div>

        {/* 인터뷰 세션 */}
        <div className="flex-1 min-h-0">
          <InterviewSession
            session={session}
            state={interviewState}
            exchanges={exchanges}
            insights={insights}
            content={currentContent}
            onAddAnswer={addAnswer}
            onAddInsight={addInsight}
            onEndSession={handleEndSession}
            onCancelSession={handleCancelSession}
            isThinking={interviewState === 'thinking'}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Render - 학습 완료 요약
  // ----------------------------------------

  if (showSummary && completedSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4">
        <LearningSessionSummary
          session={completedSession}
          content={currentContent}
          onClose={handleCloseSummary}
          className="max-w-md w-full"
        />
      </div>
    );
  }

  // ----------------------------------------
  // Render - 기본 상태
  // ----------------------------------------

  return (
    <div className="space-y-6 py-4">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Learn</h1>
        <p className="text-sm text-[var(--text-muted)]">
          배움을 내 것으로 만들어요
        </p>
      </div>

      {/* 학습 모드 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <ModeCard
          icon={MessageCircle}
          title="인터뷰 모드"
          description="AI와 대화하며 학습"
          color="green"
          onClick={() => {
            if (contents.length > 0) {
              openModal('selectContent', { contents });
            } else {
              openModal('addContent');
            }
          }}
        />
        <ModeCard
          icon={StickyNote}
          title="메모 모드"
          description="자유롭게 생각 기록"
          color="amber"
          onClick={() => openModal('quickMemo')}
        />
      </div>

      {/* 대기 중인 콘텐츠 (있으면 표시) */}
      {contents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              학습 대기 중
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {contents.length}개
            </span>
          </div>
          <div className="space-y-2">
            {contents.slice(0, 3).map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={() => handleSelectContent(content)}
              />
            ))}
            {contents.length > 3 && (
              <button
                onClick={() => openModal('selectContent', { contents })}
                className={cn(
                  'w-full py-2 text-sm font-medium text-center',
                  'text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80',
                  'transition-colors'
                )}
              >
                +{contents.length - 3}개 더보기
              </button>
            )}
          </div>
        </section>
      )}

      {/* 빈 상태 */}
      {contents.length === 0 && (
        <div
          className={cn(
            'p-6 rounded-xl text-center',
            'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
          )}
        >
          <EmptyState
            icon={BookOpen}
            title="학습할 콘텐츠가 없어요"
            description="Feed에서 콘텐츠를 추가해주세요"
            className="py-4"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('addContent')}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                콘텐츠 추가
              </Button>
            }
          />
        </div>
      )}

      {/* 최근 메모 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            최근 메모
          </h2>
          {memos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal('allMemos')}
              className="text-[var(--text-muted)]"
            >
              전체 보기
            </Button>
          )}
        </div>

        {memos.length === 0 ? (
          <div
            className={cn(
              'p-6 rounded-xl text-center',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
            )}
          >
            <EmptyState
              icon={StickyNote}
              title="아직 메모가 없어요"
              description="떠오르는 생각을 자유롭게 기록해보세요"
              className="py-4"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('quickMemo')}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  첫 메모 작성
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-2">
            {memos.slice(0, 4).map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onClick={() => openModal('editMemo', { memo })}
                onDelete={deleteMemo}
              />
            ))}
          </div>
        )}
      </section>

      {/* 메모 정리 제안 */}
      {unorganizedMemos.length >= 3 && (
        <div
          className={cn(
            'p-4 rounded-xl',
            'bg-gradient-to-br from-[var(--accent-amber)]/10 to-[var(--accent-magenta)]/10',
            'border border-[var(--accent-amber)]/20'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                'bg-[var(--accent-amber)]/20'
              )}
            >
              <FolderOpen className="w-5 h-5 text-[var(--accent-amber)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                메모 정리 시간
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {unorganizedMemos.length}개의 메모가 정리를 기다리고 있어요.
                AI와 함께 정리하면서 새로운 인사이트를 발견해보세요.
              </p>
              <button
                onClick={() => openModal('organizeMemos')}
                className={cn(
                  'mt-3 flex items-center gap-1 text-sm font-medium',
                  'text-[var(--accent-amber)] hover:text-[var(--accent-amber)]/80',
                  'transition-colors'
                )}
              >
                <Sparkles className="w-4 h-4" />
                AI와 정리하기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface ModeCardProps {
  icon: typeof BookOpen;
  title: string;
  description: string;
  color: 'green' | 'amber';
  onClick: () => void;
}

function ModeCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: ModeCardProps) {
  const colorClasses = {
    green: {
      bg: 'bg-[var(--accent-green)]/10',
      border: 'border-[var(--accent-green)]/20 hover:border-[var(--accent-green)]/40',
      icon: 'bg-[var(--accent-green)]/20',
      iconColor: 'text-[var(--accent-green)]',
      title: 'text-[var(--accent-green)]',
    },
    amber: {
      bg: 'bg-[var(--accent-amber)]/10',
      border: 'border-[var(--accent-amber)]/20 hover:border-[var(--accent-amber)]/40',
      icon: 'bg-[var(--accent-amber)]/20',
      iconColor: 'text-[var(--accent-amber)]',
      title: 'text-[var(--accent-amber)]',
    },
  };

  const styles = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 p-4 rounded-xl text-left',
        'border transition-all',
        styles.bg,
        styles.border
      )}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', styles.icon)}>
        <Icon className={cn('w-5 h-5', styles.iconColor)} />
      </div>
      <div>
        <p className={cn('font-medium', styles.title)}>{title}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
      </div>
    </button>
  );
}

interface ContentCardProps {
  content: Content;
  onClick: () => void;
}

function ContentCard({ content, onClick }: ContentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl text-left',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        'hover:border-[var(--accent-green)]/30',
        'transition-colors'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          'bg-[var(--accent-cyan)]/10'
        )}
      >
        <BookOpen className="w-5 h-5 text-[var(--accent-cyan)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {content.title}
        </p>
        {content.source && (
          <p className="text-xs text-[var(--text-muted)]">{content.source}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
    </button>
  );
}
