/**
 * @file hooks/index.ts
 * @description 커스텀 훅 모음
 *
 * @checkpoint CP-1.1, CP-1.2
 * @created 2025-12-21
 */

// ============================================
// Phase 1: Feed 관련 훅
// ============================================

export {
  useContents,
  useContent,
  useLearningQueue,
  type CreateContentInput,
  type ContentFilter,
  type ContentSort,
  type UseContentsReturn,
} from './useContents';

export {
  useTags,
  initializePresetTags,
  PRESET_TAGS,
  type CreateTagInput,
  type UseTagsReturn,
} from './useTags';

// ============================================
// Phase 2: Learn 관련 훅
// ============================================

export {
  useInterview,
  useInterviewHistory,
  useRecentInterviews,
  type InterviewState,
  type StartSessionInput,
  type UseInterviewReturn,
} from './useInterview';

export {
  useMemos,
  useMemosByContent,
  useMemosBySession,
  useUnorganizedMemos,
  type CreateMemoInput,
  type MemoFilter,
  type UseMemosReturn,
} from './useMemos';

// ============================================
// Phase 3: Connect 관련 훅
// ============================================

export {
  useConnections,
  CONNECTION_TYPES,
  type ConnectionType,
  type GraphNode,
  type GraphLink,
  type GraphData,
  type DiscoveredPattern,
  type CreateConnectionInput,
  type SuggestedConnection,
  type ConnectionStats,
  type UseConnectionsReturn,
} from './useConnections';

// ============================================
// Phase 4: Reflect 관련 훅
// ============================================

export {
  useReflections,
  useGrowthStats,
  useAlgorithmAnalysis,
  useGrowthTimeline,
  type CreateReflectionInput,
  type GrowthTimelineItem,
  type DailyStats,
  type WeeklyStats,
  type TopicDistribution,
  type LearningStreak,
  type UseReflectionsReturn,
} from './useReflections';
