// ==================== Memory System Types ====================

export type HighlightType = 'moment' | 'milestone' | 'memory';
export type EmotionType = 'joy' | 'pride' | 'gratitude' | 'reflection' | 'growth';

export interface LinkedEntity {
  type: 'habit' | 'goal' | 'journal' | 'challenge';
  id: string;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'screenshot';
  url: string;
  caption?: string;
}

// 하이라이트 - 특별한 순간 기록
export interface Highlight {
  id: string;
  type: HighlightType;
  title: string;
  content?: string;
  date: string;
  tags: string[];
  linkedEntities: LinkedEntity[];
  media?: MediaItem[];
  emotion?: EmotionType;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

// 타임캡슐 - 미래의 나에게 보내는 편지
export interface TimeCapsule {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  openDate: string;
  isOpened: boolean;
  openedAt?: string;
  linkedGoals?: string[];
  response?: {
    content: string;
    writtenAt: string;
  };
  tags: string[];
}

// 연간 요약 (캐시용)
export interface YearSummary {
  year: number;
  stats: {
    totalHabitCompletions: number;
    maxStreak: number;
    journalCount: number;
    goalLevelUps: number;
    highlightCount: number;
    totalActiveDays: number;
  };
  topHighlights: string[]; // highlight IDs
  growthAreas: Array<{
    goalId: string;
    goalTitle: string;
    levelChange: number;
  }>;
  monthlyActivity: number[]; // 12 months
  generatedAt: string;
}

// "1년 전 오늘" 데이터
export interface OnThisDayData {
  year: number;
  date: string;
  highlights: Highlight[];
  habitLog?: {
    completedCount: number;
    totalCount: number;
  };
  journals: Array<{
    id: string;
    title?: string;
    content: string;
    type: string;
  }>;
  milestones: Array<{
    goalId: string;
    goalTitle: string;
    milestoneTitle: string;
  }>;
  streakInfo?: {
    streak: number;
    wasStreakDay: boolean;
  };
}

// 감정 이모지 매핑
export const EMOTION_CONFIG: Record<EmotionType, { emoji: string; label: string; color: string }> = {
  joy: { emoji: '😊', label: '기쁨', color: 'amber' },
  pride: { emoji: '🏆', label: '자부심', color: 'yellow' },
  gratitude: { emoji: '🙏', label: '감사', color: 'emerald' },
  reflection: { emoji: '💭', label: '성찰', color: 'blue' },
  growth: { emoji: '🌱', label: '성장', color: 'green' },
};

// 하이라이트 타입 설정
export const HIGHLIGHT_TYPE_CONFIG: Record<HighlightType, { icon: string; label: string; color: string }> = {
  moment: { icon: '✨', label: '순간', color: 'amber' },
  milestone: { icon: '🏁', label: '마일스톤', color: 'emerald' },
  memory: { icon: '💎', label: '기억', color: 'purple' },
};
