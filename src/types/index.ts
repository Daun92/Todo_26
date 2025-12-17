// ==================== Core Types ====================

export type GoalCategory = 'competency' | 'habit' | 'lifestyle';
export type TriggerType = 'book' | 'article' | 'lecture' | 'talk' | 'event' | 'failure' | 'success' | 'code' | 'paper';
export type JournalType = 'free' | 'trigger' | 'reflection' | 'goal-note';
export type ChallengeFrequency = 'daily' | 'weekly' | 'monthly';
export type ChallengeStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

// ==================== Goal System ====================

export interface Strategy {
  id: string;
  version: number;
  content: string;
  reason: string;
  startDate: string;
  endDate?: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  order: number;
}

export interface LevelLog {
  date: string;
  level: number;
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  icon: string;
  strategies: Strategy[];
  milestones: Milestone[];
  currentLevel: number;
  levelHistory: LevelLog[];
  linkedTriggers: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Habit System ====================

export interface HabitDefinition {
  id: string;
  name: string;
  icon: string;
  description?: string;
  active: boolean;
  order: number;
}

export interface HabitLog {
  id: string;
  date: string;
  habits: Record<string, boolean>;
  energy?: number;
  mood?: number;
  note?: string;
}

// ==================== Challenge System ====================

export interface ChallengeTemplate {
  id: string;
  title: string;
  description?: string;
  frequency: ChallengeFrequency;
  icon: string;
  linkedGoals: string[];
  active: boolean;
  order: number;
}

export interface ChallengeLog {
  id: string;
  templateId: string;
  date: string;
  status: ChallengeStatus;
  title?: string;
  source?: string;
  content?: string;
  insights: string[];
  linkedGoals: string[];
  actionPlan?: string;
  completedAt?: string;
}

// ==================== Trigger-Insight-Action-Outcome ====================

export interface Trigger {
  id: string;
  type: TriggerType;
  title: string;
  source?: string;
  date: string;
  insights: string[];
  linkedGoals: string[];
  challengeLogId?: string;
}

export interface Insight {
  id: string;
  content: string;
  triggerId: string;
  actions: string[];
  linkedGoals: string[];
  createdAt: string;
}

export interface Action {
  id: string;
  content: string;
  insightId: string;
  outcomes: string[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Outcome {
  id: string;
  content: string;
  actionId: string;
  impactLevel: number; // 1-5
  linkedGoals: string[];
  createdAt: string;
}

// ==================== Journal ====================

export interface Journal {
  id: string;
  type: JournalType;
  title?: string;
  content: string;
  tags: string[];
  linkedGoals: string[];
  linkedTriggers: string[];
  mood?: number;
  energy?: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Reflection (Weekly/Monthly) ====================

export interface Reflection {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  highlights: string[];
  challenges: string[];
  learnings: string[];
  gratitude: string[];
  nextPeriodGoals: string[];
  overallRating: number; // 1-5
  createdAt: string;
}

// ==================== Achievement System ====================

export type AchievementCategory = 'streak' | 'milestone' | 'special';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'streak' | 'total' | 'rate' | 'special';
    value: number;
    period?: 'day' | 'week' | 'month';
  };
}

export interface UserStats {
  id: string;
  unlockedAchievements: Array<{
    achievementId: string;
    unlockedAt: string;
  }>;
  bestStreak: number;
  totalCompletions: number;
  streakFreezes: {
    remaining: number;
    usedDates: string[];
  };
}

// ==================== Stats ====================

export interface DailyStats {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  challengesCompleted: number;
  challengesTotal: number;
  journalEntries: number;
  triggersRecorded: number;
  insightsGained: number;
}

// ==================== Graph Node/Edge for Ontology ====================

export interface GraphNode {
  id: string;
  type: 'goal' | 'trigger' | 'insight' | 'action' | 'outcome' | 'habit' | 'challenge';
  label: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'sparks' | 'drives' | 'produces' | 'improves' | 'builds' | 'requires';
  label?: string;
}
