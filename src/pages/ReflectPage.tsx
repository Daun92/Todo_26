/**
 * @file ReflectPage.tsx
 * @description Reflect (회고) 페이지 - 성장 시각화 및 회고 관리
 *
 * @checkpoint CP-4.6
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Scale,
  Plus,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal } from '@/components/ui';
import {
  GrowthTimeline,
  ActivityAreaChart,
  WeeklyBarChart,
  TopicPieChart,
  StreakCard,
  StatsOverview,
  BiasAnalysis,
  AlgorithmCard,
  ReflectionList,
  ReflectionDetailModal,
} from '@/components/reflect';
import { useReflections, type CreateReflectionInput } from '@/hooks';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { Reflection } from '@/types';

// ============================================
// Types
// ============================================

type ViewMode = 'overview' | 'timeline' | 'stats' | 'algorithm';

// ============================================
// Main Component
// ============================================

export function ReflectPage() {
  const { openModal } = useStore();
  const {
    reflections,
    stats,
    learningStreak,
    daysActive,
    biasAnalysis,
    hasEnoughData,
    createReflection,
    deleteReflection,
  } = useReflections();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [isNewReflectionOpen, setIsNewReflectionOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ============================================
  // Handlers
  // ============================================

  const handleCreateReflection = async (type: CreateReflectionInput['type']) => {
    setIsCreating(true);
    try {
      const now = new Date();
      let start: Date;

      switch (type) {
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      }

      await createReflection({
        type,
        period: { start, end: now },
      });

      setIsNewReflectionOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReflection = async (id: string) => {
    await deleteReflection(id);
    setSelectedReflection(null);
  };

  // ============================================
  // View Mode Tabs
  // ============================================

  const tabs: { value: ViewMode; label: string; icon: typeof BarChart3 }[] = [
    { value: 'overview', label: '개요', icon: BarChart3 },
    { value: 'timeline', label: '타임라인', icon: Calendar },
    { value: 'stats', label: '통계', icon: TrendingUp },
    { value: 'algorithm', label: '알고리즘', icon: Sparkles },
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reflect
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            성장을 돌아보고 실감해요
          </p>
        </div>
        <Button
          onClick={() => setIsNewReflectionOpen(true)}
          disabled={!hasEnoughData}
        >
          <Plus className="w-4 h-4 mr-1" />
          회고 시작
        </Button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.value}
            variant={viewMode === tab.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(tab.value)}
          >
            <tab.icon className="w-4 h-4 mr-1" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Stats Overview (Always visible) */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Calendar}
          label="학습 일수"
          value={String(daysActive)}
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="완료한 학습"
          value={String(stats.contentsRead)}
          color="green"
        />
        <StatCard
          icon={Award}
          label="발견한 연결"
          value={String(stats.connectionsFound)}
          color="amber"
        />
        <StatCard
          icon={Scale}
          label="균형 점수"
          value={hasEnoughData ? String(biasAnalysis.balanceScore) : '-'}
          color="purple"
        />
      </div>

      {/* Content by View Mode */}
      {viewMode === 'overview' && (
        <OverviewContent
          reflections={reflections}
          onSelectReflection={setSelectedReflection}
          hasEnoughData={hasEnoughData}
        />
      )}

      {viewMode === 'timeline' && <TimelineContent />}

      {viewMode === 'stats' && <StatsContent />}

      {viewMode === 'algorithm' && <AlgorithmContent hasEnoughData={hasEnoughData} />}

      {/* Growth Story Teaser */}
      <GrowthStoryTeaser hasEnoughData={hasEnoughData} />

      {/* New Reflection Modal */}
      <NewReflectionModal
        isOpen={isNewReflectionOpen}
        onClose={() => setIsNewReflectionOpen(false)}
        onSelect={handleCreateReflection}
        isCreating={isCreating}
      />

      {/* Reflection Detail Modal */}
      <ReflectionDetailModal
        reflection={selectedReflection}
        isOpen={!!selectedReflection}
        onClose={() => setSelectedReflection(null)}
        onDelete={handleDeleteReflection}
      />
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: typeof BarChart3;
  label: string;
  value: string;
  color: 'indigo' | 'green' | 'amber' | 'purple';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-900/50',
              color === 'green' && 'bg-green-100 dark:bg-green-900/50',
              color === 'amber' && 'bg-amber-100 dark:bg-amber-900/50',
              color === 'purple' && 'bg-purple-100 dark:bg-purple-900/50'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                color === 'green' && 'text-green-600 dark:text-green-400',
                color === 'amber' && 'text-amber-600 dark:text-amber-400',
                color === 'purple' && 'text-purple-600 dark:text-purple-400'
              )}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Overview Content
// ============================================

interface OverviewContentProps {
  reflections: Reflection[];
  onSelectReflection: (r: Reflection) => void;
  hasEnoughData: boolean;
}

function OverviewContent({ reflections, onSelectReflection, hasEnoughData }: OverviewContentProps) {
  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakCard />
        <BiasAnalysis compact />
      </div>

      {/* Algorithm & Counterpoint */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          나의 알고리즘
        </h2>
        <AlgorithmCard />
      </section>

      {/* Recent Reflections */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          회고 기록
        </h2>
        <ReflectionList
          reflections={reflections.slice(0, 3)}
          onSelect={onSelectReflection}
        />
      </section>

      {/* Recent Timeline */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          최근 활동
        </h2>
        <GrowthTimeline limit={5} compact showFilters={false} />
      </section>
    </>
  );
}

// ============================================
// Timeline Content
// ============================================

function TimelineContent() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
        성장 타임라인
      </h2>
      <GrowthTimeline limit={30} showFilters />
    </section>
  );
}

// ============================================
// Stats Content
// ============================================

function StatsContent() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          종합 통계
        </h2>
        <StatsOverview />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakCard />
        <TopicPieChart height={180} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          일별 활동
        </h2>
        <ActivityAreaChart height={220} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          주간 활동
        </h2>
        <WeeklyBarChart height={220} />
      </section>
    </div>
  );
}

// ============================================
// Algorithm Content
// ============================================

interface AlgorithmContentProps {
  hasEnoughData: boolean;
}

function AlgorithmContent({ hasEnoughData }: AlgorithmContentProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          학습 패턴 분석
        </h2>
        <AlgorithmCard />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          균형 분석
        </h2>
        <BiasAnalysis />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          주제 분포
        </h2>
        <TopicPieChart height={250} />
      </section>
    </div>
  );
}

// ============================================
// Growth Story Teaser
// ============================================

interface GrowthStoryTeaserProps {
  hasEnoughData: boolean;
}

function GrowthStoryTeaser({ hasEnoughData }: GrowthStoryTeaserProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              성장 스토리
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              {hasEnoughData
                ? 'AI가 당신의 성장 여정을 스토리로 만들어드릴 준비가 됐어요!'
                : '충분한 학습 데이터가 쌓이면 AI가 당신의 성장 여정을 스토리로 만들어드려요.'}
            </p>
            {hasEnoughData && (
              <Button variant="ghost" size="sm" className="mt-2 -ml-2">
                스토리 생성하기
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// New Reflection Modal
// ============================================

interface NewReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: CreateReflectionInput['type']) => void;
  isCreating: boolean;
}

function NewReflectionModal({ isOpen, onClose, onSelect, isCreating }: NewReflectionModalProps) {
  const reflectionTypes: {
    type: CreateReflectionInput['type'];
    label: string;
    description: string;
    icon: typeof Calendar;
  }[] = [
    {
      type: 'ondemand',
      label: '수시 회고',
      description: '최근 7일간의 학습을 돌아봐요',
      icon: FileText,
    },
    {
      type: 'monthly',
      label: '월간 회고',
      description: '이번 달의 성장을 정리해요',
      icon: Calendar,
    },
    {
      type: 'quarterly',
      label: '분기 회고',
      description: '분기별 큰 그림을 그려요',
      icon: TrendingUp,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>새 회고 시작</span>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          어떤 기간의 회고를 진행할까요?
        </p>

        {reflectionTypes.map(({ type, label, description, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={isCreating}
            className={cn(
              'w-full p-4 rounded-lg border text-left transition-colors',
              'border-slate-200 dark:border-slate-700',
              'hover:border-indigo-300 dark:hover:border-indigo-700',
              'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {label}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          </button>
        ))}

        {isCreating && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-slate-500">회고 생성 중...</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
