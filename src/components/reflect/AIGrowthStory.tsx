/**
 * @file AIGrowthStory.tsx
 * @description AI 기반 성장 스토리 생성 컴포넌트
 *
 * @checkpoint CP-5.4
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  BookOpen,
  RefreshCw,
  Sparkles,
  Calendar,
  TrendingUp,
  Award,
  Lightbulb,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, EmptyState } from '@/components/ui';
import { useAI, type AIGrowthStory as AIGrowthStoryType } from '@/lib/ai-service';
import { useContents, useMemos } from '@/hooks';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface AIGrowthStoryProps {
  className?: string;
  period?: {
    start: Date;
    end: Date;
  };
}

type PeriodOption = 'week' | 'month' | 'quarter';

// ============================================
// Helper Functions
// ============================================

function getPeriodDates(option: PeriodOption): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (option) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
  }

  return { start, end };
}

function getPeriodLabel(option: PeriodOption): string {
  switch (option) {
    case 'week':
      return '지난 1주';
    case 'month':
      return '지난 1달';
    case 'quarter':
      return '지난 3개월';
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// Component
// ============================================

export function AIGrowthStory({ className, period }: AIGrowthStoryProps) {
  const { contents } = useContents({});
  const { memos } = useMemos();

  const { isLoading, error, isConfigured, generateGrowthStory } = useAI();

  const [story, setStory] = useState<AIGrowthStoryType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('month');
  const [showFullNarrative, setShowFullNarrative] = useState(false);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleGenerateStory = async () => {
    const { start, end } = period || getPeriodDates(selectedPeriod);
    const newStory = await generateGrowthStory(contents, memos, { start, end });
    setStory(newStory);
    setShowFullNarrative(false);
  };

  // ----------------------------------------
  // Render - Not Configured
  // ----------------------------------------

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                AI 설정 필요
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                설정에서 Gemini API 키를 입력하면 AI 성장 스토리를 생성할 수 있어요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  AI 성장 스토리
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  나만의 성장 여정을 AI가 분석해드려요
                </p>
              </div>
            </div>

            {/* Period Selector */}
            {!period && (
              <div className="flex items-center gap-2">
                {(['week', 'month', 'quarter'] as PeriodOption[]).map((opt) => (
                  <Button
                    key={opt}
                    variant={selectedPeriod === opt ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPeriod(opt)}
                    disabled={isLoading}
                  >
                    {getPeriodLabel(opt)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleGenerateStory}
              disabled={isLoading || contents.length === 0}
              className="gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  스토리 생성
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Result */}
      {story && (
        <>
          {/* Period & Title */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400">
                  {formatDate(story.period.start)} - {formatDate(story.period.end)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {story.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {story.themes.map((theme) => (
                  <Badge key={theme} variant="primary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Narrative */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">
                  나의 성장 이야기
                </h4>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p
                  className={cn(
                    'text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line',
                    !showFullNarrative && 'line-clamp-4'
                  )}
                >
                  {story.narrative}
                </p>
              </div>

              {story.narrative.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullNarrative(!showFullNarrative)}
                  className="mt-2 gap-1"
                >
                  {showFullNarrative ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      접기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      더보기
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          {story.milestones.length > 0 && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    주요 마일스톤
                  </h4>
                  <Badge variant="secondary">{story.milestones.length}개</Badge>
                </div>

                <div className="space-y-3">
                  {story.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {milestone.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {new Date(milestone.date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {story.insights.length > 0 && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    인사이트
                  </h4>
                </div>

                <div className="space-y-2">
                  {story.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20"
                    >
                      <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growth Trend */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">
                  성장 요약
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    성장 방향
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {story.growthDirection}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    추천 다음 단계
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {story.nextSteps[0] || '계속 학습하세요!'}
                  </p>
                </div>
              </div>

              {story.nextSteps.length > 1 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    추가 제안
                  </p>
                  <div className="space-y-1">
                    {story.nextSteps.slice(1).map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial State */}
      {!story && !isLoading && (
        <Card>
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="성장 스토리를 만들어보세요"
              description="AI가 학습 데이터를 분석해서 나만의 성장 스토리를 작성해드려요"
              className="py-8"
              action={
                <Button onClick={handleGenerateStory} disabled={contents.length === 0}>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  스토리 생성
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
