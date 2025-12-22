/**
 * @file BiasAnalysis.tsx
 * @description 편향 분석 및 균형 점수 컴포넌트
 *
 * @checkpoint CP-4.4
 * @created 2025-12-22
 */

import {
  Scale,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, EmptyState } from '@/components/ui';
import { useAlgorithmAnalysis } from '@/hooks/useReflections';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface BiasAnalysisProps {
  className?: string;
  compact?: boolean;
}

interface AlgorithmCardProps {
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

function getBalanceStatus(score: number): {
  label: string;
  color: string;
  icon: typeof CheckCircle;
  description: string;
} {
  if (score >= 70) {
    return {
      label: '균형 잡힘',
      color: 'text-green-600 dark:text-green-400',
      icon: CheckCircle,
      description: '다양한 관점으로 학습하고 있어요!',
    };
  } else if (score >= 40) {
    return {
      label: '보통',
      color: 'text-amber-600 dark:text-amber-400',
      icon: AlertTriangle,
      description: '조금 더 다양한 관점을 탐색해보세요',
    };
  } else {
    return {
      label: '편향됨',
      color: 'text-red-600 dark:text-red-400',
      icon: AlertTriangle,
      description: '대척점을 추가해 균형을 맞춰보세요',
    };
  }
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// ============================================
// Balance Score Gauge
// ============================================

interface BalanceGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function BalanceGauge({ score, size = 'md' }: BalanceGaugeProps) {
  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-[10px]' },
    md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-xs' },
    lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-sm' },
  };

  const { container, text, label } = sizes[size];
  const status = getBalanceStatus(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative', container)}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={cn(
            score >= 70 && 'text-green-500',
            score >= 40 && score < 70 && 'text-amber-500',
            score < 40 && 'text-red-500'
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold text-slate-900 dark:text-white', text)}>
          {score}
        </span>
        <span className={cn('text-slate-500 dark:text-slate-400', label)}>
          균형 점수
        </span>
      </div>
    </div>
  );
}

// ============================================
// Bias Analysis Card
// ============================================

export function BiasAnalysis({ className, compact = false }: BiasAnalysisProps) {
  const { biasAnalysis, topicDistribution } = useAlgorithmAnalysis();
  const status = getBalanceStatus(biasAnalysis.balanceScore);
  const StatusIcon = status.icon;

  return (
    <Card className={className}>
      <CardContent className={compact ? 'py-4' : ''}>
        <div className="flex items-start gap-4">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <BalanceGauge
              score={biasAnalysis.balanceScore}
              size={compact ? 'sm' : 'md'}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn('w-4 h-4', status.color)} />
              <span className={cn('font-medium', status.color)}>
                {status.label}
              </span>
            </div>

            {!compact && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {status.description}
                </p>

                {/* Current Bias */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                    현재 성향
                  </p>
                  <Badge variant="secondary">{biasAnalysis.currentBias}</Badge>
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
                    추천
                  </p>
                  <ul className="space-y-1">
                    {biasAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Topic Distribution Bar */}
        {!compact && topicDistribution.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              주제 집중도
            </p>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {topicDistribution.slice(0, 5).map((topic, i) => (
                <div
                  key={topic.topic}
                  className={cn(
                    'h-full',
                    i === 0 && 'bg-indigo-500',
                    i === 1 && 'bg-green-500',
                    i === 2 && 'bg-amber-500',
                    i === 3 && 'bg-purple-500',
                    i === 4 && 'bg-pink-500'
                  )}
                  style={{ width: `${topic.percentage}%` }}
                  title={`${topic.topic}: ${topic.percentage}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {topicDistribution.slice(0, 3).map((topic, i) => (
                <span
                  key={topic.topic}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {topic.topic} {topic.percentage}%
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Algorithm Insight Card
// ============================================

export function AlgorithmCard({ className }: AlgorithmCardProps) {
  const { algorithmInsight } = useAlgorithmAnalysis();

  if (algorithmInsight.preferredTopics.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={Target}
            title="알고리즘 분석 중"
            description="학습 데이터가 쌓이면 성장 패턴을 분석해드려요"
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">
              나의 알고리즘
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI가 분석한 학습 패턴
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Learning Style */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
              학습 스타일
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="text-sm">
                {algorithmInsight.learningStyle}
              </Badge>
            </div>
          </div>

          {/* Preferred Topics */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              선호 주제
            </p>
            <div className="flex flex-wrap gap-1.5">
              {algorithmInsight.preferredTopics.map(topic => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Patterns */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
              학습 시간대
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {algorithmInsight.timePatterns}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Combined Analysis Dashboard
// ============================================

interface AnalysisDashboardProps {
  className?: string;
}

export function AnalysisDashboard({ className }: AnalysisDashboardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AlgorithmCard />
        <BiasAnalysis />
      </div>
    </div>
  );
}

// ============================================
// Counterpoint Suggestions
// ============================================

interface CounterpointSuggestionsProps {
  className?: string;
}

export function CounterpointSuggestions({ className }: CounterpointSuggestionsProps) {
  const { biasAnalysis, topicDistribution } = useAlgorithmAnalysis();

  // Generate counterpoint suggestions based on top topics
  const suggestions = topicDistribution.slice(0, 3).map(topic => ({
    currentTopic: topic.topic,
    suggestion: `${topic.topic}의 다른 관점 탐색하기`,
  }));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-medium text-slate-900 dark:text-white">
            대척점 제안
          </h3>
        </div>

        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <Badge variant="secondary">{s.currentTopic}</Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                {s.suggestion}
              </span>
              <Button variant="ghost" size="sm">
                탐색
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
