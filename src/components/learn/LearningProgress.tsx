/**
 * @file LearningProgress.tsx
 * @description 학습 진행 상황 표시 컴포넌트
 *
 * @checkpoint CP-2.5
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - 현재 학습 세션 상태 표시
 * - 진행률 바
 * - 인사이트 카운트
 * - 학습 통계
 *
 * @dependencies
 * - src/types/index.ts
 */

import {
  BookOpen,
  MessageCircle,
  Lightbulb,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewSession, Content } from '@/types';

// ============================================
// Types
// ============================================

interface LearningProgressProps {
  /** 현재 세션 */
  session?: InterviewSession | null;
  /** 학습 콘텐츠 */
  content?: Content | null;
  /** 대화 수 */
  exchangeCount: number;
  /** 인사이트 수 */
  insightCount: number;
  /** 학습 시작 시간 */
  startTime?: Date;
  /** 목표 대화 수 */
  targetExchanges?: number;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

// ============================================
// Component
// ============================================

export function LearningProgress({
  session,
  content,
  exchangeCount,
  insightCount,
  startTime,
  targetExchanges = 10,
  compact = false,
  className,
}: LearningProgressProps) {
  // ----------------------------------------
  // Calculations
  // ----------------------------------------

  const progress = Math.min((exchangeCount / targetExchanges) * 100, 100);
  const elapsedMinutes = startTime
    ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000)
    : 0;

  // ----------------------------------------
  // Compact Render
  // ----------------------------------------

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-2 rounded-xl',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
          className
        )}
      >
        <StatItem
          icon={MessageCircle}
          value={exchangeCount}
          label="대화"
          color="cyan"
        />
        <StatItem
          icon={Lightbulb}
          value={insightCount}
          label="인사이트"
          color="amber"
        />
        {startTime && (
          <StatItem
            icon={Clock}
            value={elapsedMinutes}
            label="분"
            color="green"
          />
        )}
        <div className="flex-1">
          <ProgressBar progress={progress} />
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Full Render
  // ----------------------------------------

  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-[var(--accent-green)]/10'
            )}
          >
            <Brain className="w-4 h-4 text-[var(--accent-green)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              학습 진행
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {content?.title || '학습 중'}
            </p>
          </div>
        </div>

        {session?.completedAt && (
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full',
              'bg-[var(--accent-green)]/10'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            <span className="text-xs font-medium text-[var(--accent-green)]">
              완료
            </span>
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--text-muted)]">진행률</span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar progress={progress} showMilestones />
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={MessageCircle}
          value={exchangeCount}
          label="대화"
          subLabel={`/ ${targetExchanges}`}
          color="cyan"
        />
        <StatCard
          icon={Lightbulb}
          value={insightCount}
          label="인사이트"
          color="amber"
        />
        <StatCard
          icon={Clock}
          value={elapsedMinutes}
          label="소요 시간"
          subLabel="분"
          color="green"
        />
      </div>

      {/* 팁 */}
      {exchangeCount < 3 && (
        <div
          className={cn(
            'mt-4 p-3 rounded-lg',
            'bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/10'
          )}
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--accent-cyan)]">팁:</strong> AI의
              질문에 자세히 답변할수록 더 깊은 학습이 가능해요!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface ProgressBarProps {
  progress: number;
  showMilestones?: boolean;
}

function ProgressBar({ progress, showMilestones = false }: ProgressBarProps) {
  return (
    <div className="relative">
      {/* 배경 */}
      <div
        className={cn(
          'h-2 rounded-full overflow-hidden',
          'bg-[var(--bg-tertiary)]'
        )}
      >
        {/* 진행 바 */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-green)]'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 마일스톤 */}
      {showMilestones && (
        <div className="absolute inset-0 flex items-center justify-between px-0.5">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'w-1 h-1 rounded-full',
                progress >= milestone
                  ? 'bg-white/50'
                  : 'bg-[var(--border-default)]'
              )}
              style={{ marginLeft: `${milestone - 1}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  icon: typeof BookOpen;
  value: number;
  label: string;
  color: 'cyan' | 'amber' | 'green' | 'magenta';
}

function StatItem({ icon: Icon, value, label, color }: StatItemProps) {
  const colorClasses = {
    cyan: 'text-[var(--accent-cyan)]',
    amber: 'text-[var(--accent-amber)]',
    green: 'text-[var(--accent-green)]',
    magenta: 'text-[var(--accent-magenta)]',
  };

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('w-4 h-4', colorClasses[color])} />
      <span className={cn('font-medium', colorClasses[color])}>{value}</span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

interface StatCardProps {
  icon: typeof BookOpen;
  value: number;
  label: string;
  subLabel?: string;
  color: 'cyan' | 'amber' | 'green' | 'magenta';
}

function StatCard({
  icon: Icon,
  value,
  label,
  subLabel,
  color,
}: StatCardProps) {
  const colorClasses = {
    cyan: {
      bg: 'bg-[var(--accent-cyan)]/10',
      text: 'text-[var(--accent-cyan)]',
    },
    amber: {
      bg: 'bg-[var(--accent-amber)]/10',
      text: 'text-[var(--accent-amber)]',
    },
    green: {
      bg: 'bg-[var(--accent-green)]/10',
      text: 'text-[var(--accent-green)]',
    },
    magenta: {
      bg: 'bg-[var(--accent-magenta)]/10',
      text: 'text-[var(--accent-magenta)]',
    },
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center p-3 rounded-lg',
        colorClasses[color].bg
      )}
    >
      <Icon className={cn('w-5 h-5 mb-1', colorClasses[color].text)} />
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn('text-lg font-semibold', colorClasses[color].text)}
        >
          {value}
        </span>
        {subLabel && (
          <span className="text-xs text-[var(--text-muted)]">{subLabel}</span>
        )}
      </div>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

// ============================================
// Learning Session Summary
// ============================================

interface LearningSessionSummaryProps {
  session: InterviewSession;
  content?: Content | null;
  onClose?: () => void;
  className?: string;
}

export function LearningSessionSummary({
  session,
  content,
  onClose,
  className,
}: LearningSessionSummaryProps) {
  const duration = session.completedAt
    ? Math.floor(
        (session.completedAt.getTime() - session.createdAt.getTime()) / 60000
      )
    : 0;

  return (
    <div
      className={cn(
        'p-6 rounded-xl',
        'bg-gradient-to-br from-[var(--accent-green)]/10 to-[var(--accent-cyan)]/10',
        'border border-[var(--accent-green)]/20',
        className
      )}
    >
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center',
            'bg-[var(--accent-green)]/20'
          )}
        >
          <CheckCircle2 className="w-8 h-8 text-[var(--accent-green)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          학습 완료!
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {content?.title || '학습 세션'}을 완료했어요
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={MessageCircle}
          value={session.exchanges.length}
          label="대화"
          color="cyan"
        />
        <StatCard
          icon={Lightbulb}
          value={session.insights.length}
          label="인사이트"
          color="amber"
        />
        <StatCard
          icon={Clock}
          value={duration}
          label="소요 시간"
          subLabel="분"
          color="green"
        />
      </div>

      {/* 인사이트 목록 */}
      {session.insights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
            발견한 인사이트
          </h3>
          <div className="space-y-2">
            {session.insights.map((insight, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-2 p-2 rounded-lg',
                  'bg-[var(--bg-secondary)]'
                )}
              >
                <Lightbulb className="w-4 h-4 text-[var(--accent-amber)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--text-primary)]">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'w-full py-3 rounded-xl font-medium',
            'bg-[var(--accent-green)] text-white',
            'hover:bg-[var(--accent-green)]/90',
            'transition-colors'
          )}
        >
          확인
        </button>
      )}
    </div>
  );
}
