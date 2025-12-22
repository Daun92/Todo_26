/**
 * @file StatsCharts.tsx
 * @description 통계 차트 컴포넌트 (Recharts 기반)
 *
 * @checkpoint CP-4.3
 * @created 2025-12-22
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, EmptyState } from '@/components/ui';
import { useGrowthStats, useAlgorithmAnalysis, type TopicDistribution } from '@/hooks/useReflections';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, PieChartIcon } from 'lucide-react';

// ============================================
// Types
// ============================================

interface ChartProps {
  className?: string;
  height?: number;
}

// ============================================
// Color Palette
// ============================================

const COLORS = {
  contents: '#6366f1', // indigo
  interviews: '#22c55e', // green
  memos: '#f59e0b', // amber
  connections: '#a855f7', // purple
};

const PIE_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
];

// ============================================
// Custom Tooltip
// ============================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600 dark:text-slate-400">
            {entry.name}:
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Activity Area Chart
// ============================================

export function ActivityAreaChart({ className, height = 200 }: ChartProps) {
  const { dailyStats } = useGrowthStats();

  // Transform data for chart
  const chartData = dailyStats.map(d => ({
    date: d.date.slice(5), // MM-DD format
    콘텐츠: d.contents,
    인터뷰: d.interviews,
    메모: d.memos,
    연결: d.connections,
  }));

  const hasData = dailyStats.some(d =>
    d.contents > 0 || d.interviews > 0 || d.memos > 0 || d.connections > 0
  );

  if (!hasData) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="데이터가 없어요"
            description="학습 활동을 시작하면 차트가 표시돼요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          최근 30일 활동
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorContents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.contents} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.contents} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.interviews} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.interviews} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMemos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.memos} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.memos} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              className="text-slate-500"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              className="text-slate-500"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="콘텐츠"
              stroke={COLORS.contents}
              fillOpacity={1}
              fill="url(#colorContents)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="인터뷰"
              stroke={COLORS.interviews}
              fillOpacity={1}
              fill="url(#colorInterviews)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="메모"
              stroke={COLORS.memos}
              fillOpacity={1}
              fill="url(#colorMemos)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================
// Weekly Bar Chart
// ============================================

export function WeeklyBarChart({ className, height = 200 }: ChartProps) {
  const { weeklyStats } = useGrowthStats();

  const chartData = weeklyStats.map(w => ({
    week: w.week,
    콘텐츠: w.contents,
    인터뷰: w.interviews,
    메모: w.memos,
    연결: w.connections,
  }));

  const hasData = weeklyStats.some(w =>
    w.contents > 0 || w.interviews > 0 || w.memos > 0 || w.connections > 0
  );

  if (!hasData) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="데이터가 없어요"
            description="주간 활동 통계가 여기에 표시돼요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          주간 활동
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              className="text-slate-500"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              className="text-slate-500"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="콘텐츠" fill={COLORS.contents} radius={[4, 4, 0, 0]} />
            <Bar dataKey="인터뷰" fill={COLORS.interviews} radius={[4, 4, 0, 0]} />
            <Bar dataKey="메모" fill={COLORS.memos} radius={[4, 4, 0, 0]} />
            <Bar dataKey="연결" fill={COLORS.connections} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================
// Topic Distribution Pie Chart
// ============================================

interface TopicPieChartProps extends ChartProps {
  data?: Array<{ topic: string; count: number; percentage: number }>;
}

export function TopicPieChart({ className, height = 200, data }: TopicPieChartProps) {
  const { topicDistribution } = useAlgorithmAnalysis();
  const chartData: TopicDistribution[] = data || topicDistribution;

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={PieChartIcon}
            title="주제 데이터가 없어요"
            description="콘텐츠에 태그를 추가하면 분포가 표시돼요"
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  const pieData = chartData.map((d: TopicDistribution) => ({
    name: d.topic,
    value: d.count,
  }));

  return (
    <Card className={className}>
      <CardContent>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          주제 분포
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                typeof percent === 'number' && percent > 0.1 ? `${name || ''} ${(percent * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {pieData.map((_: { name: string; value: number }, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {chartData.slice(0, 5).map((item: TopicDistribution, index: number) => (
            <div key={item.topic} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {item.topic}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Streak Card
// ============================================

interface StreakCardProps {
  className?: string;
}

export function StreakCard({ className }: StreakCardProps) {
  const { learningStreak, daysActive } = useGrowthStats();

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
        <p className="text-xs opacity-80 mb-1">연속 학습</p>
        <p className="text-3xl font-bold">
          {learningStreak.currentStreak}
          <span className="text-lg ml-1">일</span>
        </p>
      </div>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">최장 기록</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {learningStreak.longestStreak}일
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">총 활동일</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {daysActive}일
            </p>
          </div>
        </div>
        {learningStreak.lastActiveDate && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            마지막 활동: {learningStreak.lastActiveDate.toLocaleDateString('ko-KR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Stats Overview
// ============================================

interface StatsOverviewProps {
  className?: string;
}

export function StatsOverview({ className }: StatsOverviewProps) {
  const { stats } = useGrowthStats();

  const items = [
    { label: '학습 완료', value: stats.contentsRead, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: '인터뷰', value: stats.interviewSessions, color: 'text-green-600 dark:text-green-400' },
    { label: '메모', value: stats.memosWritten, color: 'text-amber-600 dark:text-amber-400' },
    { label: '연결', value: stats.connectionsFound, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <Card className={className}>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.label} className="text-center">
              <p className={cn('text-2xl font-bold', item.color)}>
                {item.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Combined Chart Dashboard
// ============================================

interface ChartDashboardProps {
  className?: string;
}

export function ChartDashboard({ className }: ChartDashboardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <StatsOverview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreakCard />
        <TopicPieChart height={180} />
      </div>
      <ActivityAreaChart height={200} />
      <WeeklyBarChart height={200} />
    </div>
  );
}
