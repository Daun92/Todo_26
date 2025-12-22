/**
 * @file PatternList.tsx
 * @description 발견된 패턴 목록 컴포넌트
 *
 * @checkpoint CP-3.4
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - 패턴 카드 목록
 * - 패턴 유형별 스타일링
 * - 관련 노드 표시
 * - 인사이트 강조
 */

import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  GitBranch,
  Link2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DiscoveredPattern } from '@/hooks/useConnections';

// ============================================
// Types
// ============================================

interface PatternListProps {
  /** 패턴 목록 */
  patterns: DiscoveredPattern[];
  /** 패턴 클릭 핸들러 */
  onPatternClick?: (pattern: DiscoveredPattern) => void;
  /** AI 분석 요청 핸들러 */
  onAnalyzeRequest?: () => void;
  /** 로딩 상태 */
  loading?: boolean;
  /** 클래스명 */
  className?: string;
}

interface PatternCardProps {
  pattern: DiscoveredPattern;
  onClick?: () => void;
  className?: string;
}

// ============================================
// Constants
// ============================================

const PATTERN_ICONS: Record<DiscoveredPattern['type'], typeof Sparkles> = {
  'tag-cluster': GitBranch,
  'content-chain': Link2,
  'topic-bridge': TrendingUp,
  'repeat-connection': Sparkles,
};

const PATTERN_COLORS: Record<DiscoveredPattern['type'], string> = {
  'tag-cluster': 'magenta',
  'content-chain': 'cyan',
  'topic-bridge': 'green',
  'repeat-connection': 'amber',
};

const PATTERN_LABELS: Record<DiscoveredPattern['type'], string> = {
  'tag-cluster': '태그 클러스터',
  'content-chain': '콘텐츠 체인',
  'topic-bridge': '주제 다리',
  'repeat-connection': '반복 연결',
};

// ============================================
// Component
// ============================================

export function PatternList({
  patterns,
  onPatternClick,
  onAnalyzeRequest,
  loading = false,
  className,
}: PatternListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ----------------------------------------
  // Empty State
  // ----------------------------------------
  if (patterns.length === 0) {
    return (
      <div
        className={cn(
          'p-6 rounded-xl text-center',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
          className
        )}
      >
        <EmptyState
          icon={Sparkles}
          title="아직 발견된 패턴이 없어요"
          description="더 많은 콘텐츠를 학습하고 연결하면 AI가 패턴을 발견합니다"
          className="py-4"
          action={
            onAnalyzeRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAnalyzeRequest}
                disabled={loading}
                className="gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? '분석 중...' : '패턴 분석하기'}
              </Button>
            )
          }
        />
      </div>
    );
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[var(--accent-amber)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {patterns.length}개의 패턴 발견
          </span>
        </div>
        {onAnalyzeRequest && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAnalyzeRequest}
            disabled={loading}
            className="text-[var(--text-muted)]"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            다시 분석
          </Button>
        )}
      </div>

      {/* Pattern Cards */}
      <div className="space-y-2">
        {patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            onClick={() => {
              setExpandedId(expandedId === pattern.id ? null : pattern.id);
              onPatternClick?.(pattern);
            }}
            expanded={expandedId === pattern.id}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Pattern Card
// ============================================

interface ExtendedPatternCardProps extends PatternCardProps {
  expanded?: boolean;
}

function PatternCard({
  pattern,
  onClick,
  expanded = false,
  className,
}: ExtendedPatternCardProps) {
  const Icon = PATTERN_ICONS[pattern.type] || Sparkles;
  const color = PATTERN_COLORS[pattern.type] || 'gray';
  const label = PATTERN_LABELS[pattern.type] || pattern.type;

  const colorClasses = getColorClasses(color);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        'hover:border-[var(--accent-cyan)]/30',
        'transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              colorClasses.bg
            )}
          >
            <Icon className={cn('w-5 h-5', colorClasses.text)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  colorClasses.bg,
                  colorClasses.text
                )}
              >
                {label}
              </span>
              <StrengthBar strength={pattern.strength} />
            </div>
            <p className="text-sm text-[var(--text-primary)] mt-1.5">
              {pattern.description}
            </p>
          </div>

          {/* Expand Button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              관련 노드: {pattern.relatedNodes.length}개
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pattern.relatedNodes.slice(0, 5).map((nodeId, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs',
                    'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  )}
                >
                  {nodeId.slice(0, 8)}...
                </span>
              ))}
              {pattern.relatedNodes.length > 5 && (
                <span className="text-xs text-[var(--text-muted)]">
                  +{pattern.relatedNodes.length - 5}개
                </span>
              )}
            </div>

            {/* AI Insight */}
            <div
              className={cn(
                'mt-3 p-3 rounded-lg',
                'bg-gradient-to-r from-[var(--accent-cyan)]/5 to-[var(--accent-magenta)]/5',
                'border border-[var(--accent-cyan)]/10'
              )}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[var(--accent-cyan)]">
                    AI 인사이트
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {getPatternInsight(pattern)}
                  </p>
                </div>
              </div>
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

interface StrengthBarProps {
  strength: number;
}

function StrengthBar({ strength }: StrengthBarProps) {
  const percentage = Math.round(strength * 100);

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-green)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-[var(--text-muted)]">{percentage}%</span>
    </div>
  );
}

// ============================================
// Utilities
// ============================================

function getColorClasses(color: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    cyan: {
      bg: 'bg-[var(--accent-cyan)]/10',
      text: 'text-[var(--accent-cyan)]',
    },
    magenta: {
      bg: 'bg-[var(--accent-magenta)]/10',
      text: 'text-[var(--accent-magenta)]',
    },
    amber: {
      bg: 'bg-[var(--accent-amber)]/10',
      text: 'text-[var(--accent-amber)]',
    },
    green: {
      bg: 'bg-[var(--accent-green)]/10',
      text: 'text-[var(--accent-green)]',
    },
    gray: {
      bg: 'bg-[var(--bg-tertiary)]',
      text: 'text-[var(--text-muted)]',
    },
  };
  return colorMap[color] || colorMap.gray;
}

function getPatternInsight(pattern: DiscoveredPattern): string {
  switch (pattern.type) {
    case 'tag-cluster':
      return '이 태그를 중심으로 여러 콘텐츠가 연결되어 있어요. 핵심 관심사일 수 있습니다.';
    case 'content-chain':
      return '연속적으로 연결된 학습 흐름이 발견됐어요. 하나의 학습 여정을 형성하고 있습니다.';
    case 'topic-bridge':
      return '서로 다른 분야를 연결하는 다리 역할을 하고 있어요. 크로스오버 인사이트가 기대됩니다.';
    case 'repeat-connection':
      return '이 연결 패턴이 반복적으로 나타나요. 중요한 사고방식일 수 있습니다.';
    default:
      return '흥미로운 패턴이 발견됐어요.';
  }
}
