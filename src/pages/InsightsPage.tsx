import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Flame, Sparkles, Loader2, X, Star } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal } from '@/components/ui';
import { db } from '@/lib/db';
import { cn, getWeekRange, getMonthRange } from '@/lib/utils';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { hasAPIKey } from '@/lib/claude';
import { generateWeeklyReview } from '@/lib/ai-services';
import type { WeeklyReview } from '@/lib/ai-services';
import type { Goal, HabitLog, ChallengeLog, Trigger, Journal } from '@/types';

export function InsightsPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [challengeLogs, setChallengeLogs] = useState<ChallengeLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [habits, challenges, goalsData, triggersData, journalsData] = await Promise.all([
        db.habitLogs.toArray(),
        db.challengeLogs.toArray(),
        db.goals.toArray(),
        db.triggers.toArray(),
        db.journals.toArray(),
      ]);
      setHabitLogs(habits);
      setChallengeLogs(challenges);
      setGoals(goalsData);
      setTriggers(triggersData);
      setJournals(journalsData);
      setLoading(false);
    };
    load();
  }, []);

  // Calculate habit trend data
  const habitTrendData = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const startDate = subDays(new Date(), days - 1);
    const endDate = new Date();

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = habitLogs.find((l) => l.date === dateStr);
      const completed = log ? Object.values(log.habits).filter(Boolean).length : 0;

      return {
        date: format(date, period === 'week' ? 'EEE' : 'M/d', { locale: ko }),
        completed,
        fullDate: dateStr,
      };
    });
  }, [habitLogs, period]);

  // Calculate challenge stats
  const challengeStats = useMemo(() => {
    const { start, end } = period === 'week' ? getWeekRange() : getMonthRange();
    const periodLogs = challengeLogs.filter(
      (l) => l.date >= start && l.date <= end && l.status === 'completed'
    );

    return {
      total: periodLogs.length,
      articles: periodLogs.filter((l) => l.templateId === 'daily-article').length,
      code: periodLogs.filter((l) => l.templateId === 'daily-code').length,
      prompts: periodLogs.filter((l) => l.templateId === 'daily-prompt').length,
    };
  }, [challengeLogs, period]);

  // Calculate level changes
  const levelChanges = useMemo(() => {
    return goals.map((goal) => {
      const history = goal.levelHistory;
      const current = goal.currentLevel;
      const initial = history[0]?.level || current;
      const change = current - initial;

      return {
        id: goal.id,
        title: goal.title,
        icon: goal.icon,
        current,
        change,
      };
    });
  }, [goals]);

  // Top triggers (would need more data to be meaningful)
  const topInsights = useMemo(() => {
    // For demo, just show recent triggers
    return triggers.slice(0, 3);
  }, [triggers]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="animate-pulse p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          인사이트
        </h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setPeriod('week')}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              period === 'week'
                ? 'bg-white dark:bg-slate-700 shadow-sm'
                : 'text-slate-500'
            )}
          >
            주간
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              period === 'month'
                ? 'bg-white dark:bg-slate-700 shadow-sm'
                : 'text-slate-500'
            )}
          >
            월간
          </button>
        </div>
      </div>

      {/* Habit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            습관 달성 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={habitTrendData}>
                <defs>
                  <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#habitGradient)"
                  name="완료 습관"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            챌린지 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary-600">{challengeStats.total}</p>
              <p className="text-xs text-slate-500">총 완료</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{challengeStats.articles}</p>
              <p className="text-xs text-slate-500">기사 리뷰</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{challengeStats.code}</p>
              <p className="text-xs text-slate-500">코드 리뷰</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{challengeStats.prompts}</p>
              <p className="text-xs text-slate-500">프롬프트 실험</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-500" />
            역량 레벨 변화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {levelChanges.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <span className="text-xl">{goal.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        style={{ width: `${goal.current * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{goal.current}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    goal.change > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : goal.change < 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {goal.change > 0 ? '+' : ''}{goal.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly/Monthly Reflection CTA */}
      <Card className="bg-gradient-to-br from-primary-500 to-accent-500 text-white border-none">
        <CardContent className="py-6 text-center">
          {hasAPIKey() ? (
            <>
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold mb-1">
                AI {period === 'week' ? '주간' : '월간'} 회고
              </h3>
              <p className="text-sm text-white/80 mb-4">
                AI가 이번 {period === 'week' ? '주' : '달'}의 성과를 분석하고 피드백을 제공합니다
              </p>
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={handleGenerateReview}
                disabled={isGeneratingReview}
              >
                {isGeneratingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI 회고 생성
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold mb-1">
                {period === 'week' ? '주간' : '월간'} 회고 작성하기
              </h3>
              <p className="text-sm text-white/80 mb-4">
                이번 {period === 'week' ? '주' : '달'}를 돌아보고 다음을 계획하세요
              </p>
              <p className="text-xs text-white/60 mb-2">
                설정에서 API 키를 등록하면 AI 회고 기능을 사용할 수 있습니다
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`AI ${period === 'week' ? '주간' : '월간'} 회고`}
      >
        {weeklyReview && (
          <div className="space-y-4">
            {/* Score */}
            <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < weeklyReview.overallScore
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                종합 점수 <span className="font-bold">{weeklyReview.overallScore}</span>/10
              </p>
            </div>

            {/* Highlight */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
              <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                이번 {period === 'week' ? '주' : '달'} 하이라이트
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">{weeklyReview.highlight}</p>
            </div>

            {/* Growth Points */}
            {weeklyReview.growthPoints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">성장 포인트</h4>
                <ul className="space-y-1">
                  {weeklyReview.growthPoints.map((point, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">+</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Patterns */}
            {weeklyReview.patterns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">발견된 패턴</h4>
                <ul className="space-y-1">
                  {weeklyReview.patterns.map((pattern, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">→</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Week Suggestions */}
            {weeklyReview.nextWeekSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">다음 {period === 'week' ? '주' : '달'} 제안</h4>
                <ul className="space-y-1">
                  {weeklyReview.nextWeekSuggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">★</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{weeklyReview.encouragement}</p>
              </div>
            </div>

            <Button className="w-full" onClick={() => setIsReviewModalOpen(false)}>
              확인
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );

  async function handleGenerateReview() {
    if (!hasAPIKey()) return;

    setIsGeneratingReview(true);
    setIsReviewModalOpen(true);

    try {
      const { start, end } = period === 'week' ? getWeekRange() : getMonthRange();

      const periodHabits = habitLogs.filter((l) => l.date >= start && l.date <= end);
      const periodChallenges = challengeLogs.filter((l) => l.date >= start && l.date <= end);
      const periodJournals = journals.filter((j) => j.date >= start && j.date <= end);

      const review = await generateWeeklyReview({
        habitLogs: periodHabits,
        challengeLogs: periodChallenges,
        journals: periodJournals,
        goals,
      });

      setWeeklyReview(review);
    } catch (error) {
      console.error('Failed to generate review:', error);
      setIsReviewModalOpen(false);
    } finally {
      setIsGeneratingReview(false);
    }
  }
}
