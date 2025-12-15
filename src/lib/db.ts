import Dexie, { type EntityTable } from 'dexie';
import type {
  Goal,
  HabitDefinition,
  HabitLog,
  ChallengeTemplate,
  ChallengeLog,
  Trigger,
  Insight,
  Action,
  Outcome,
  Journal,
  Reflection,
  DailyStats,
} from '@/types';

class CatalyzeDB extends Dexie {
  goals!: EntityTable<Goal, 'id'>;
  habitDefinitions!: EntityTable<HabitDefinition, 'id'>;
  habitLogs!: EntityTable<HabitLog, 'id'>;
  challengeTemplates!: EntityTable<ChallengeTemplate, 'id'>;
  challengeLogs!: EntityTable<ChallengeLog, 'id'>;
  triggers!: EntityTable<Trigger, 'id'>;
  insights!: EntityTable<Insight, 'id'>;
  actions!: EntityTable<Action, 'id'>;
  outcomes!: EntityTable<Outcome, 'id'>;
  journals!: EntityTable<Journal, 'id'>;
  reflections!: EntityTable<Reflection, 'id'>;
  dailyStats!: EntityTable<DailyStats, 'date'>;

  constructor() {
    super('CatalyzeDB');

    this.version(1).stores({
      goals: 'id, category, createdAt',
      habitDefinitions: 'id, order, active',
      habitLogs: 'id, date',
      challengeTemplates: 'id, frequency, order, active',
      challengeLogs: 'id, templateId, date, status',
      triggers: 'id, type, date, *linkedGoals',
      insights: 'id, triggerId, createdAt, *linkedGoals',
      actions: 'id, insightId, completed, createdAt',
      outcomes: 'id, actionId, createdAt, *linkedGoals',
      journals: 'id, type, date, *tags, *linkedGoals',
      reflections: 'id, type, periodStart',
      dailyStats: 'date',
    });
  }
}

export const db = new CatalyzeDB();

// ==================== Initial Data ====================

export async function initializeDefaultData() {
  const goalsCount = await db.goals.count();
  if (goalsCount > 0) return;

  // Default Goals
  const defaultGoals: Goal[] = [
    {
      id: crypto.randomUUID(),
      title: 'AI 프롬프팅 마스터',
      description: 'AI 프롬프트 엔지니어링 역량을 전문가 수준으로 향상',
      category: 'competency',
      icon: '🤖',
      strategies: [{
        id: crypto.randomUUID(),
        version: 1,
        content: '매일 1개 프롬프트 실험 및 기록',
        reason: '초기 전략',
        startDate: new Date().toISOString().split('T')[0],
      }],
      milestones: [
        { id: crypto.randomUUID(), title: '기본 프롬프트 패턴 학습', completed: false, order: 0 },
        { id: crypto.randomUUID(), title: 'Chain of Thought 마스터', completed: false, order: 1 },
        { id: crypto.randomUUID(), title: 'Few-shot Learning 적용', completed: false, order: 2 },
      ],
      currentLevel: 3,
      levelHistory: [{ date: new Date().toISOString().split('T')[0], level: 3, note: '시작점' }],
      linkedTriggers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: '프로젝트 리드 역량',
      description: '프로젝트를 효과적으로 이끌고 팀을 관리하는 역량 개발',
      category: 'competency',
      icon: '🎖️',
      strategies: [{
        id: crypto.randomUUID(),
        version: 1,
        content: '주간 리더십 관련 아티클 리뷰 및 실무 적용',
        reason: '초기 전략',
        startDate: new Date().toISOString().split('T')[0],
      }],
      milestones: [
        { id: crypto.randomUUID(), title: '효과적인 회의 진행법 학습', completed: false, order: 0 },
        { id: crypto.randomUUID(), title: '피드백 스킬 향상', completed: false, order: 1 },
      ],
      currentLevel: 4,
      levelHistory: [{ date: new Date().toISOString().split('T')[0], level: 4, note: '시작점' }],
      linkedTriggers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: '프로젝트 기획/관리',
      description: '체계적인 프로젝트 기획과 관리 스킬 개발',
      category: 'competency',
      icon: '📋',
      strategies: [{
        id: crypto.randomUUID(),
        version: 1,
        content: '실제 프로젝트에 애자일 방법론 적용 및 회고',
        reason: '초기 전략',
        startDate: new Date().toISOString().split('T')[0],
      }],
      milestones: [
        { id: crypto.randomUUID(), title: '기획서 템플릿 완성', completed: false, order: 0 },
        { id: crypto.randomUUID(), title: '리스크 관리 체계 구축', completed: false, order: 1 },
      ],
      currentLevel: 3,
      levelHistory: [{ date: new Date().toISOString().split('T')[0], level: 3, note: '시작점' }],
      linkedTriggers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Default Habits
  const defaultHabits: HabitDefinition[] = [
    { id: 'walking', name: '걷기', icon: '🚶', description: '하루 30분 이상 걷기', active: true, order: 0 },
    { id: 'posture', name: '자세', icon: '📐', description: '바른 자세 유지하기', active: true, order: 1 },
    { id: 'core', name: '코어', icon: '💪', description: '코어 운동 10분', active: true, order: 2 },
    { id: 'breathing', name: '호흡', icon: '🌬️', description: '깊은 호흡 연습', active: true, order: 3 },
    { id: 'meditation', name: '명상', icon: '🧘', description: '명상 10분', active: true, order: 4 },
  ];

  // Default Challenge Templates
  const defaultChallenges: ChallengeTemplate[] = [
    // Daily
    { id: 'daily-article', title: '기사/리포트 리뷰', description: 'AI/Tech 관련 기사 1건 읽고 인사이트 정리', frequency: 'daily', icon: '📰', linkedGoals: [], active: true, order: 0 },
    { id: 'daily-code', title: '코드 리뷰', description: '동료 코드 또는 오픈소스 1건 리뷰', frequency: 'daily', icon: '💻', linkedGoals: [], active: true, order: 1 },
    { id: 'daily-prompt', title: '프롬프트 실험', description: '새로운 프롬프트 패턴 1개 실험', frequency: 'daily', icon: '🧪', linkedGoals: [], active: true, order: 2 },
    { id: 'daily-til', title: 'TIL 작성', description: '오늘 배운 것 기록', frequency: 'daily', icon: '📝', linkedGoals: [], active: true, order: 3 },
    // Weekly
    { id: 'weekly-paper', title: '논문/리포트 딥다이브', description: '트렌드 관련 논문 또는 심층 리포트 1편 정독', frequency: 'weekly', icon: '📄', linkedGoals: [], active: true, order: 0 },
    { id: 'weekly-deepdive', title: '딥다이브 학습', description: '한 주제에 대해 깊이 있는 학습', frequency: 'weekly', icon: '🔬', linkedGoals: [], active: true, order: 1 },
    // Monthly
    { id: 'monthly-book', title: '서적 완독', description: '전문 서적 1권 완독 및 리뷰', frequency: 'monthly', icon: '📚', linkedGoals: [], active: true, order: 0 },
    { id: 'monthly-reflection', title: '월간 성장 회고', description: '한 달간의 성장 돌아보기', frequency: 'monthly', icon: '🔮', linkedGoals: [], active: true, order: 1 },
  ];

  await db.transaction('rw', [db.goals, db.habitDefinitions, db.challengeTemplates], async () => {
    await db.goals.bulkAdd(defaultGoals);
    await db.habitDefinitions.bulkAdd(defaultHabits);
    await db.challengeTemplates.bulkAdd(defaultChallenges);
  });
}
