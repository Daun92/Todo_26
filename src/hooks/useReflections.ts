/**
 * @file useReflections.ts
 * @description 회고 관리 및 성장 통계 훅
 *
 * @checkpoint CP-4.1
 * @created 2025-12-22
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: Reflection, ReflectionReport 타입
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type {
  Reflection,
  ReflectionReport,
  LearningStats,
  Pattern,
  AlgorithmInsight,
  CounterpointBalance,
  Success,
  Content,
  InterviewSession,
  Memo,
  Connection,
  Tag,
} from '@/types';

// ============================================
// Types
// ============================================

export interface CreateReflectionInput {
  type: Reflection['type'];
  period: {
    start: Date;
    end: Date;
  };
}

export interface GrowthTimelineItem {
  date: Date;
  type: 'content' | 'interview' | 'memo' | 'connection' | 'reflection';
  title: string;
  description?: string;
  relatedId: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  contents: number;
  interviews: number;
  memos: number;
  connections: number;
}

export interface WeeklyStats {
  week: string; // Week label
  startDate: Date;
  endDate: Date;
  contents: number;
  interviews: number;
  memos: number;
  connections: number;
}

export interface TopicDistribution {
  topic: string;
  count: number;
  percentage: number;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
}

export interface UseReflectionsReturn {
  // Data
  reflections: Reflection[];
  isLoading: boolean;

  // Stats
  stats: LearningStats;
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  topicDistribution: TopicDistribution[];
  learningStreak: LearningStreak;

  // Timeline
  timeline: GrowthTimelineItem[];

  // Algorithm & Bias
  algorithmInsight: AlgorithmInsight;
  biasAnalysis: CounterpointBalance;

  // Actions
  createReflection: (input: CreateReflectionInput) => Promise<string>;
  deleteReflection: (id: string) => Promise<void>;
  generateReport: (period: { start: Date; end: Date }) => Promise<ReflectionReport>;

  // Utilities
  hasEnoughData: boolean;
  daysActive: number;
  lastReflection: Reflection | null;
}

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Stats Calculation
// ============================================

function calculateLearningStats(
  contents: Content[],
  interviews: InterviewSession[],
  memos: Memo[],
  connections: Connection[]
): LearningStats {
  return {
    contentsRead: contents.filter(c => c.status === 'completed').length,
    interviewSessions: interviews.length,
    memosWritten: memos.length,
    connectionsFound: connections.length,
  };
}

function calculateDailyStats(
  contents: Content[],
  interviews: InterviewSession[],
  memos: Memo[],
  connections: Connection[],
  days: number = 30
): DailyStats[] {
  const today = new Date();
  const stats: DailyStats[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    const dayStart = getStartOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    stats.push({
      date: dateStr,
      contents: contents.filter(c => {
        const created = new Date(c.createdAt);
        return created >= dayStart && created < dayEnd;
      }).length,
      interviews: interviews.filter(i => {
        const created = new Date(i.createdAt);
        return created >= dayStart && created < dayEnd;
      }).length,
      memos: memos.filter(m => {
        const created = new Date(m.createdAt);
        return created >= dayStart && created < dayEnd;
      }).length,
      connections: connections.filter(c => {
        const created = new Date(c.createdAt);
        return created >= dayStart && created < dayEnd;
      }).length,
    });
  }

  return stats;
}

function calculateWeeklyStats(
  contents: Content[],
  interviews: InterviewSession[],
  memos: Memo[],
  connections: Connection[],
  weeks: number = 12
): WeeklyStats[] {
  const today = new Date();
  const stats: WeeklyStats[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = getStartOfWeek(new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    stats.push({
      week: weekLabel,
      startDate: weekStart,
      endDate: weekEnd,
      contents: contents.filter(c => {
        const created = new Date(c.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length,
      interviews: interviews.filter(i => {
        const created = new Date(i.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length,
      memos: memos.filter(m => {
        const created = new Date(m.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length,
      connections: connections.filter(c => {
        const created = new Date(c.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length,
    });
  }

  return stats;
}

function calculateTopicDistribution(
  contents: Content[],
  tags: Tag[]
): TopicDistribution[] {
  const tagCounts: Record<string, number> = {};

  contents.forEach(content => {
    content.tags.forEach(tagId => {
      tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
    });
  });

  const total = Object.values(tagCounts).reduce((a, b) => a + b, 0);

  return Object.entries(tagCounts)
    .map(([tagId, count]) => {
      const tag = tags.find(t => t.id === tagId || t.name === tagId);
      return {
        topic: tag?.name || tagId,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateLearningStreak(
  contents: Content[],
  interviews: InterviewSession[],
  memos: Memo[]
): LearningStreak {
  // Get all activity dates
  const activityDates = new Set<string>();

  contents.forEach(c => activityDates.add(formatDate(new Date(c.createdAt))));
  interviews.forEach(i => activityDates.add(formatDate(new Date(i.createdAt))));
  memos.forEach(m => activityDates.add(formatDate(new Date(m.createdAt))));

  const sortedDates = Array.from(activityDates).sort().reverse();

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    let checkDate = new Date(sortedDates[0]);
    while (activityDates.has(formatDate(checkDate))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  // Calculate longest streak
  const allDates = Array.from(activityDates).sort();
  allDates.forEach((dateStr, index) => {
    if (index === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allDates[index - 1]);
      const currDate = new Date(dateStr);
      const diff = getDaysBetween(prevDate, currDate);

      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  });

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: new Date(sortedDates[0]),
  };
}

function analyzeAlgorithm(
  contents: Content[],
  tags: Tag[],
  interviews: InterviewSession[]
): AlgorithmInsight {
  // Preferred topics
  const topicCounts: Record<string, number> = {};
  contents.forEach(c => {
    c.tags.forEach(tagId => {
      topicCounts[tagId] = (topicCounts[tagId] || 0) + 1;
    });
  });

  const preferredTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tagId]) => {
      const tag = tags.find(t => t.id === tagId || t.name === tagId);
      return tag?.name || tagId;
    });

  // Learning style analysis
  const avgInterviewLength = interviews.length > 0
    ? interviews.reduce((sum, i) => sum + i.exchanges.length, 0) / interviews.length
    : 0;

  let learningStyle = '탐색 중';
  if (avgInterviewLength > 10) {
    learningStyle = '심층 분석형';
  } else if (avgInterviewLength > 5) {
    learningStyle = '균형 학습형';
  } else if (interviews.length > 0) {
    learningStyle = '핵심 파악형';
  }

  // Time patterns (simplified)
  const hourCounts: Record<number, number> = {};
  contents.forEach(c => {
    const hour = new Date(c.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  let timePatterns = '데이터 수집 중';
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (peakHour) {
    const hour = parseInt(peakHour[0]);
    if (hour >= 6 && hour < 12) {
      timePatterns = '아침형 학습자';
    } else if (hour >= 12 && hour < 18) {
      timePatterns = '오후형 학습자';
    } else if (hour >= 18 && hour < 22) {
      timePatterns = '저녁형 학습자';
    } else {
      timePatterns = '심야형 학습자';
    }
  }

  return {
    preferredTopics,
    learningStyle,
    timePatterns,
  };
}

function analyzeBias(
  contents: Content[],
  tags: Tag[]
): CounterpointBalance {
  // Find contents with counterpoints
  const withCounterpoint = contents.filter(c => c.counterpoint);
  const withoutCounterpoint = contents.filter(c => !c.counterpoint);

  const balanceScore = contents.length > 0
    ? Math.round((withCounterpoint.length / contents.length) * 100)
    : 50;

  // Analyze topic concentration
  const topicCounts: Record<string, number> = {};
  contents.forEach(c => {
    c.tags.forEach(tagId => {
      topicCounts[tagId] = (topicCounts[tagId] || 0) + 1;
    });
  });

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  const topTopic = sortedTopics[0];
  const topTopicPercentage = topTopic && contents.length > 0
    ? Math.round((topTopic[1] / contents.length) * 100)
    : 0;

  let currentBias = '균형 잡힌 학습';
  const recommendations: string[] = [];

  if (topTopicPercentage > 60) {
    const topicName = tags.find(t => t.id === topTopic[0] || t.name === topTopic[0])?.name || topTopic[0];
    currentBias = `${topicName} 집중 경향`;
    recommendations.push(`${topicName} 외 다른 분야도 탐색해보세요`);
  }

  if (balanceScore < 30) {
    recommendations.push('콘텐츠에 대척점(다른 관점)을 추가해보세요');
  }

  if (withoutCounterpoint.length > 5) {
    recommendations.push(`${withoutCounterpoint.length}개 콘텐츠에 대척점이 없어요`);
  }

  if (recommendations.length === 0) {
    recommendations.push('균형 잡힌 학습을 하고 있어요!');
  }

  return {
    currentBias,
    recommendations,
    balanceScore,
  };
}

function buildTimeline(
  contents: Content[],
  interviews: InterviewSession[],
  memos: Memo[],
  connections: Connection[],
  reflections: Reflection[],
  limit: number = 50
): GrowthTimelineItem[] {
  const items: GrowthTimelineItem[] = [];

  contents.forEach(c => {
    items.push({
      date: new Date(c.createdAt),
      type: 'content',
      title: c.title,
      description: c.status === 'completed' ? '학습 완료' : c.status === 'learning' ? '학습 중' : '대기 중',
      relatedId: c.id,
    });
  });

  interviews.forEach(i => {
    items.push({
      date: new Date(i.createdAt),
      type: 'interview',
      title: `인터뷰 세션 (${i.exchanges.length}회 대화)`,
      description: i.insights.length > 0 ? `${i.insights.length}개 인사이트` : undefined,
      relatedId: i.id,
    });
  });

  memos.forEach(m => {
    items.push({
      date: new Date(m.createdAt),
      type: 'memo',
      title: m.text.slice(0, 50) + (m.text.length > 50 ? '...' : ''),
      relatedId: m.id,
    });
  });

  connections.forEach(c => {
    items.push({
      date: new Date(c.createdAt),
      type: 'connection',
      title: `새로운 연결: ${c.relationship}`,
      description: `강도 ${c.strength}/10`,
      relatedId: c.id,
    });
  });

  reflections.forEach(r => {
    items.push({
      date: new Date(r.createdAt),
      type: 'reflection',
      title: `${r.type === 'monthly' ? '월간' : r.type === 'quarterly' ? '분기' : '수시'} 회고`,
      relatedId: r.id,
    });
  });

  return items
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// ============================================
// Main Hook
// ============================================

export function useReflections(): UseReflectionsReturn {
  // Fetch all data
  const reflections = useLiveQuery(() => db.reflections.orderBy('createdAt').reverse().toArray()) || [];
  const contents = useLiveQuery(() => db.contents.toArray()) || [];
  const interviews = useLiveQuery(() => db.interviews.toArray()) || [];
  const memos = useLiveQuery(() => db.memos.toArray()) || [];
  const connections = useLiveQuery(() => db.connections.toArray()) || [];
  const tags = useLiveQuery(() => db.tags.toArray()) || [];

  const isLoading = reflections === undefined || contents === undefined;

  // Calculate stats
  const stats = calculateLearningStats(contents, interviews, memos, connections);
  const dailyStats = calculateDailyStats(contents, interviews, memos, connections);
  const weeklyStats = calculateWeeklyStats(contents, interviews, memos, connections);
  const topicDistribution = calculateTopicDistribution(contents, tags);
  const learningStreak = calculateLearningStreak(contents, interviews, memos);

  // Timeline
  const timeline = buildTimeline(contents, interviews, memos, connections, reflections);

  // Algorithm & Bias
  const algorithmInsight = analyzeAlgorithm(contents, tags, interviews);
  const biasAnalysis = analyzeBias(contents, tags);

  // Utilities
  const hasEnoughData = contents.length >= 3 || interviews.length >= 1 || memos.length >= 5;
  const daysActive = new Set([
    ...contents.map(c => formatDate(new Date(c.createdAt))),
    ...interviews.map(i => formatDate(new Date(i.createdAt))),
    ...memos.map(m => formatDate(new Date(m.createdAt))),
  ]).size;
  const lastReflection = reflections.length > 0 ? reflections[0] : null;

  // ============================================
  // Actions
  // ============================================

  const generateReport = async (period: { start: Date; end: Date }): Promise<ReflectionReport> => {
    const periodContents = contents.filter(c => {
      const date = new Date(c.createdAt);
      return date >= period.start && date <= period.end;
    });

    const periodInterviews = interviews.filter(i => {
      const date = new Date(i.createdAt);
      return date >= period.start && date <= period.end;
    });

    const periodMemos = memos.filter(m => {
      const date = new Date(m.createdAt);
      return date >= period.start && date <= period.end;
    });

    const periodConnections = connections.filter(c => {
      const date = new Date(c.createdAt);
      return date >= period.start && date <= period.end;
    });

    // Find patterns
    const patterns: Pattern[] = [];
    const tagFrequency: Record<string, number> = {};

    periodContents.forEach(c => {
      c.tags.forEach(tagId => {
        tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
      });
    });

    Object.entries(tagFrequency)
      .filter(([, count]) => count >= 3)
      .forEach(([tagId, count]) => {
        const tag = tags.find(t => t.id === tagId || t.name === tagId);
        patterns.push({
          id: generateId(),
          description: `${tag?.name || tagId} 주제에 집중했어요`,
          occurrences: count,
          relatedTags: [tagId],
        });
      });

    // Find successes
    const successes: Success[] = periodContents
      .filter(c => c.status === 'completed')
      .slice(0, 5)
      .map(c => ({
        id: generateId(),
        description: `"${c.title}" 학습 완료`,
        date: c.completedAt || c.createdAt,
        relatedContentIds: [c.id],
      }));

    return {
      stats: calculateLearningStats(periodContents, periodInterviews, periodMemos, periodConnections),
      patterns,
      algorithm: analyzeAlgorithm(periodContents, tags, periodInterviews),
      counterpoints: analyzeBias(periodContents, tags),
      successes,
      narrative: generateNarrative(periodContents, periodInterviews, patterns),
    };
  };

  const createReflection = async (input: CreateReflectionInput): Promise<string> => {
    const report = await generateReport(input.period);

    const reflection: Reflection = {
      id: generateId(),
      type: input.type,
      period: input.period,
      report,
      createdAt: new Date(),
    };

    await db.reflections.add(reflection);
    return reflection.id;
  };

  const deleteReflection = async (id: string): Promise<void> => {
    await db.reflections.delete(id);
  };

  return {
    reflections,
    isLoading,
    stats,
    dailyStats,
    weeklyStats,
    topicDistribution,
    learningStreak,
    timeline,
    algorithmInsight,
    biasAnalysis,
    createReflection,
    deleteReflection,
    generateReport,
    hasEnoughData,
    daysActive,
    lastReflection,
  };
}

// ============================================
// Narrative Generator
// ============================================

function generateNarrative(
  contents: Content[],
  interviews: InterviewSession[],
  patterns: Pattern[]
): string {
  const completed = contents.filter(c => c.status === 'completed').length;
  const totalInsights = interviews.reduce((sum, i) => sum + i.insights.length, 0);

  if (completed === 0 && interviews.length === 0) {
    return '아직 충분한 학습 데이터가 없어요. 콘텐츠를 추가하고 학습을 시작해보세요!';
  }

  let narrative = `이 기간 동안 ${completed}개의 콘텐츠를 학습하고, ${interviews.length}번의 인터뷰 세션을 진행했어요. `;

  if (totalInsights > 0) {
    narrative += `총 ${totalInsights}개의 인사이트를 발견했네요! `;
  }

  if (patterns.length > 0) {
    const topPattern = patterns[0];
    narrative += `특히 ${topPattern.description}. `;
  }

  narrative += '꾸준히 성장하고 있어요!';

  return narrative;
}

// ============================================
// Utility Hooks
// ============================================

export function useGrowthStats() {
  const { stats, dailyStats, weeklyStats, learningStreak, daysActive } = useReflections();
  return { stats, dailyStats, weeklyStats, learningStreak, daysActive };
}

export function useAlgorithmAnalysis() {
  const { algorithmInsight, biasAnalysis, topicDistribution } = useReflections();
  return { algorithmInsight, biasAnalysis, topicDistribution };
}

export function useGrowthTimeline(limit?: number) {
  const contents = useLiveQuery(() => db.contents.toArray()) || [];
  const interviews = useLiveQuery(() => db.interviews.toArray()) || [];
  const memos = useLiveQuery(() => db.memos.toArray()) || [];
  const connections = useLiveQuery(() => db.connections.toArray()) || [];
  const reflections = useLiveQuery(() => db.reflections.toArray()) || [];

  return buildTimeline(contents, interviews, memos, connections, reflections, limit);
}
