// ============================================
// MOSAIC - Type Definitions
// ============================================

// Content (학습 자료)
export interface Content {
  id: string;
  type: 'article' | 'note' | 'url' | 'thought';
  title: string;
  source?: string;
  url?: string;
  body?: string;
  summary?: string;
  tags: string[];
  status: 'queued' | 'learning' | 'completed';
  counterpoint?: string; // 대척점
  createdAt: Date;
  completedAt?: Date;
}

// Interview Session (인터뷰 세션)
export interface InterviewSession {
  id: string;
  contentId: string;
  exchanges: Exchange[];
  insights: string[];
  connections: string[]; // Connection IDs
  createdAt: Date;
  completedAt?: Date;
}

export interface Exchange {
  id: string;
  type: 'question' | 'answer';
  text: string;
  timestamp: Date;
}

// Memo (메모)
export interface Memo {
  id: string;
  text: string;
  contentId?: string;
  sessionId?: string;
  tags: string[];
  organized: boolean;
  createdAt: Date;
}

// Connection (연결)
export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: 'content' | 'memo' | 'tag';
  targetType: 'content' | 'memo' | 'tag';
  relationship: string;
  strength: number; // 1-10
  createdAt: Date;
}

// Tag (태그)
export interface Tag {
  id: string;
  name: string;
  category: 'topic' | 'emotion' | 'action' | 'custom';
  count: number;
  createdAt: Date;
}

// Reflection (회고)
export interface Reflection {
  id: string;
  type: 'monthly' | 'quarterly' | 'ondemand' | 'triggered';
  period: {
    start: Date;
    end: Date;
  };
  report: ReflectionReport;
  createdAt: Date;
}

export interface ReflectionReport {
  stats: LearningStats;
  patterns: Pattern[];
  algorithm: AlgorithmInsight;
  counterpoints: CounterpointBalance;
  successes: Success[];
  narrative?: string;
}

export interface LearningStats {
  contentsRead: number;
  interviewSessions: number;
  memosWritten: number;
  connectionsFound: number;
}

export interface Pattern {
  id: string;
  description: string;
  occurrences: number;
  relatedTags: string[];
}

export interface AlgorithmInsight {
  preferredTopics: string[];
  learningStyle: string;
  timePatterns: string;
}

export interface CounterpointBalance {
  currentBias: string;
  recommendations: string[];
  balanceScore: number; // 0-100
}

export interface Success {
  id: string;
  description: string;
  date: Date;
  relatedContentIds: string[];
}

// User Profile (사용자 프로필)
export interface UserProfile {
  id: string;
  interests: Interest[];
  learningPatterns: LearningPattern[];
  biases: Bias[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Interest {
  topic: string;
  level: number; // 1-10
  lastAccessed: Date;
}

export interface LearningPattern {
  type: string;
  frequency: number;
  description: string;
}

export interface Bias {
  topic: string;
  direction: 'positive' | 'negative' | 'neutral';
  strength: number; // 1-10
}

// App State
export type TabType = 'feed' | 'learn' | 'connect' | 'reflect';

export interface AppState {
  activeTab: TabType;
  darkMode: boolean;
  currentContentId: string | null;
  currentSessionId: string | null;
}
