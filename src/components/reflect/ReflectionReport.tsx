/**
 * @file ReflectionReport.tsx
 * @description 회고 리포트 컴포넌트
 *
 * @checkpoint CP-4.5
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Scale,
  Lightbulb,
  Target,
  ChevronRight,
  Download,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Modal,
} from '@/components/ui';
import type { Reflection, ReflectionReport as ReportType } from '@/types';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ReflectionReportProps {
  reflection: Reflection;
  onDelete?: (id: string) => void;
  className?: string;
}

interface ReflectionCardProps {
  reflection: Reflection;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

interface ReflectionListProps {
  reflections: Reflection[];
  onSelect?: (reflection: Reflection) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

function getReflectionTypeLabel(type: Reflection['type']): string {
  switch (type) {
    case 'monthly':
      return '월간 회고';
    case 'quarterly':
      return '분기 회고';
    case 'ondemand':
      return '수시 회고';
    case 'triggered':
      return '자동 회고';
    default:
      return '회고';
  }
}

function getReflectionTypeColor(type: Reflection['type']): string {
  switch (type) {
    case 'monthly':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
    case 'quarterly':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
    case 'ondemand':
      return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    case 'triggered':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

function formatPeriod(period: Reflection['period']): string {
  const start = new Date(period.start).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(period.end).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
  return `${start} - ${end}`;
}

// ============================================
// Reflection Card (List Item)
// ============================================

export function ReflectionCard({
  reflection,
  onClick,
  compact = false,
  className,
}: ReflectionCardProps) {
  const { report } = reflection;

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? 'py-3' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  getReflectionTypeColor(reflection.type)
                )}
              >
                {getReflectionTypeLabel(reflection.type)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatPeriod(reflection.period)}
              </span>
            </div>

            {/* Stats Summary */}
            {!compact && (
              <div className="flex gap-4 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {report.stats.contentsRead}
                  </span>{' '}
                  학습
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {report.stats.interviewSessions}
                  </span>{' '}
                  인터뷰
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {report.counterpoints.balanceScore}
                  </span>
                  점
                </span>
              </div>
            )}

            {/* Narrative Preview */}
            {report.narrative && !compact && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {report.narrative}
              </p>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Full Reflection Report
// ============================================

export function ReflectionReport({
  reflection,
  onDelete,
  className,
}: ReflectionReportProps) {
  const { report } = reflection;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'text-sm px-3 py-1 rounded-full font-medium',
                getReflectionTypeColor(reflection.type)
              )}
            >
              {getReflectionTypeLabel(reflection.type)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {formatPeriod(reflection.period)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date(reflection.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            작성
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('이 회고를 삭제할까요?')) {
                  onDelete(reflection.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Narrative */}
      {report.narrative && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <CardContent>
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 dark:text-slate-300">
                {report.narrative}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatItem
          icon={TrendingUp}
          label="학습 완료"
          value={report.stats.contentsRead}
          color="indigo"
        />
        <StatItem
          icon={Calendar}
          label="인터뷰"
          value={report.stats.interviewSessions}
          color="green"
        />
        <StatItem
          icon={FileText}
          label="메모"
          value={report.stats.memosWritten}
          color="amber"
        />
        <StatItem
          icon={Award}
          label="연결"
          value={report.stats.connectionsFound}
          color="purple"
        />
      </div>

      {/* Algorithm Insight */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              학습 패턴
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                학습 스타일
              </p>
              <Badge variant="primary">{report.algorithm.learningStyle}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                학습 시간대
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {report.algorithm.timePatterns}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                선호 주제
              </p>
              <div className="flex flex-wrap gap-1">
                {report.algorithm.preferredTopics.slice(0, 3).map(topic => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Score */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              균형 점수
            </h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {report.counterpoints.balanceScore}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">/ 100</p>
            </div>

            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                현재 성향: {report.counterpoints.currentBias}
              </p>
              <ul className="space-y-1">
                {report.counterpoints.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patterns */}
      {report.patterns.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                발견된 패턴
              </h3>
            </div>

            <div className="space-y-3">
              {report.patterns.map(pattern => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {pattern.description}
                  </span>
                  <Badge variant="secondary">{pattern.occurrences}회</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Successes */}
      {report.successes.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                주요 성과
              </h3>
            </div>

            <div className="space-y-2">
              {report.successes.map(success => (
                <div
                  key={success.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {success.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Stat Item Component
// ============================================

interface StatItemProps {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  color: 'indigo' | 'green' | 'amber' | 'purple';
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors[color])}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Reflection List
// ============================================

export function ReflectionList({
  reflections,
  onSelect,
  onDelete,
  className,
}: ReflectionListProps) {
  if (reflections.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="아직 회고 기록이 없어요"
            description="회고를 시작하면 여기에 기록이 쌓여요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {reflections.map(reflection => (
        <ReflectionCard
          key={reflection.id}
          reflection={reflection}
          onClick={() => onSelect?.(reflection)}
        />
      ))}
    </div>
  );
}

// ============================================
// Reflection Detail Modal
// ============================================

interface ReflectionDetailModalProps {
  reflection: Reflection | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function ReflectionDetailModal({
  reflection,
  isOpen,
  onClose,
  onDelete,
}: ReflectionDetailModalProps) {
  if (!reflection) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{getReflectionTypeLabel(reflection.type)}</span>
        </div>
      }
      size="lg"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <ReflectionReport
          reflection={reflection}
          onDelete={(id) => {
            onDelete?.(id);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
