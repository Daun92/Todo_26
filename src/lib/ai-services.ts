import { callClaudeJSON, callClaude } from './claude';
import type { Goal, Journal, HabitLog, ChallengeLog, Trigger, Insight } from '@/types';

// ==================== 진단 평가 ====================

export interface PromptEvaluation {
  scores: {
    clarity: number;
    specificity: number;
    context: number;
    structure: number;
    constraints: number;
  };
  totalScore: number;
  level: number;
  strengths: string[];
  improvements: string[];
  improvedVersion: string;
}

export async function evaluatePrompt(
  userPrompt: string,
  context: string
): Promise<PromptEvaluation> {
  const systemPrompt = `당신은 AI 프롬프트 엔지니어링 전문가입니다.
사용자가 작성한 프롬프트를 평가해주세요.

평가 기준 (각 1-10점):
1. clarity (명확성): 의도가 명확한가?
2. specificity (구체성): 충분히 구체적인가?
3. context (맥락): 필요한 배경정보가 있는가?
4. structure (구조화): 체계적으로 구성되었는가?
5. constraints (제약조건): 적절한 제약이 있는가?

totalScore는 평균 * 10 (100점 만점)
level은 1-10 (totalScore/10 반올림)

JSON 형식으로 응답:
{
  "scores": { "clarity": n, "specificity": n, "context": n, "structure": n, "constraints": n },
  "totalScore": n,
  "level": n,
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "improvedVersion": "개선된 프롬프트 전체"
}`;

  return callClaudeJSON<PromptEvaluation>(
    `상황: ${context}\n\n사용자가 작성한 프롬프트:\n${userPrompt}`,
    { system: systemPrompt, maxTokens: 1500 }
  );
}

export interface ScenarioEvaluation {
  selectedOption: string;
  score: number;
  feedback: string;
  optimalChoice: string;
  reasoning: string;
}

export async function evaluateScenario(
  scenario: string,
  options: string[],
  selectedOption: string,
  category: 'project-lead' | 'planning'
): Promise<ScenarioEvaluation> {
  const systemPrompt = `당신은 ${category === 'project-lead' ? '프로젝트 리더십' : '기획/관리'} 전문가입니다.
시나리오에 대한 사용자의 선택을 평가해주세요.

평가 기준:
- 상황 파악의 정확성
- 의사결정의 적절성
- 리더십/관리 원칙 적용

JSON 형식으로 응답:
{
  "selectedOption": "사용자가 선택한 옵션",
  "score": 1-10,
  "feedback": "선택에 대한 피드백",
  "optimalChoice": "가장 적절한 선택",
  "reasoning": "최적 선택의 이유"
}`;

  return callClaudeJSON<ScenarioEvaluation>(
    `시나리오: ${scenario}\n\n선택지:\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n사용자 선택: ${selectedOption}`,
    { system: systemPrompt }
  );
}

export interface DiagnosticSummary {
  category: string;
  level: number;
  percentile: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  nextSteps: string[];
}

export async function generateDiagnosticSummary(
  category: string,
  answers: { question: string; answer: string; score: number }[]
): Promise<DiagnosticSummary> {
  const systemPrompt = `당신은 역량 진단 전문가입니다.
사용자의 진단 결과를 종합 분석해주세요.

JSON 형식으로 응답:
{
  "category": "역량 카테고리명",
  "level": 1-10,
  "percentile": 1-100 (추정 상위 퍼센트),
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "recommendations": ["추천 학습/활동1", "추천2"],
  "nextSteps": ["다음 단계 행동1", "행동2"]
}`;

  return callClaudeJSON<DiagnosticSummary>(
    `역량: ${category}\n\n진단 결과:\n${answers.map((a) => `Q: ${a.question}\nA: ${a.answer}\nScore: ${a.score}`).join('\n\n')}`,
    { system: systemPrompt }
  );
}

// ==================== 저널 분석 ====================

export interface JournalAnalysis {
  mood: 'positive' | 'neutral' | 'challenging';
  energy: number;
  suggestedTags: string[];
  linkedGoals: string[];
  keyInsight: string;
  coachingMessage: string;
}

export async function analyzeJournal(
  content: string,
  goals: Goal[]
): Promise<JournalAnalysis> {
  const systemPrompt = `당신은 개인 성장 코치입니다.
사용자의 저널을 분석해주세요.

사용자의 목표 목록: ${goals.map((g) => g.title).join(', ')}

JSON 형식으로 응답:
{
  "mood": "positive" | "neutral" | "challenging",
  "energy": 1-5,
  "suggestedTags": ["태그1", "태그2", "태그3"],
  "linkedGoals": ["연관된 목표 제목"],
  "keyInsight": "핵심 인사이트 한 문장",
  "coachingMessage": "따뜻하고 실용적인 코칭 메시지 2-3문장"
}`;

  return callClaudeJSON<JournalAnalysis>(content, {
    system: systemPrompt,
    maxTokens: 800,
  });
}

// ==================== 주간/월간 회고 ====================

export interface WeeklyReview {
  highlight: string;
  growthPoints: string[];
  patterns: string[];
  nextWeekSuggestions: string[];
  encouragement: string;
  overallScore: number;
}

export async function generateWeeklyReview(data: {
  habitLogs: HabitLog[];
  challengeLogs: ChallengeLog[];
  journals: Journal[];
  goals: Goal[];
}): Promise<WeeklyReview> {
  const systemPrompt = `당신은 개인 성장 코치입니다.
사용자의 일주일 데이터를 분석하여 회고를 생성해주세요.

분석 관점:
1. 가장 의미있던 순간/성취
2. 성장한 부분
3. 반복되는 패턴
4. 다음 주 제안

JSON 형식으로 응답:
{
  "highlight": "이번 주 하이라이트 (가장 의미있던 것)",
  "growthPoints": ["성장 포인트1", "성장 포인트2"],
  "patterns": ["발견된 패턴1", "패턴2"],
  "nextWeekSuggestions": ["구체적 제안1", "제안2"],
  "encouragement": "격려 메시지 2-3문장",
  "overallScore": 1-10
}`;

  const summary = {
    habits: `완료율: ${data.habitLogs.length}일 기록`,
    challenges: `완료: ${data.challengeLogs.filter((c) => c.status === 'completed').length}개`,
    journals: data.journals.map((j) => j.content.slice(0, 100)).join('\n'),
    goals: data.goals.map((g) => `${g.title}: Lv.${g.currentLevel}`).join(', '),
  };

  return callClaudeJSON<WeeklyReview>(JSON.stringify(summary), {
    system: systemPrompt,
    maxTokens: 1000,
  });
}

// ==================== AI 코치 ====================

export interface CoachResponse {
  message: string;
  suggestions?: string[];
  actionItems?: string[];
}

export async function chatWithCoach(
  userMessage: string,
  context: {
    goals: Goal[];
    recentJournals: Journal[];
    currentStreak: number;
  }
): Promise<CoachResponse> {
  const systemPrompt = `당신은 Catalyze 26의 AI 성장 코치입니다.
사용자의 질문에 따뜻하고 실용적으로 답변해주세요.

사용자 컨텍스트:
- 목표: ${context.goals.map((g) => `${g.title}(Lv.${g.currentLevel})`).join(', ')}
- 연속 기록: ${context.currentStreak}일
- 최근 저널: ${context.recentJournals.slice(0, 2).map((j) => j.content.slice(0, 50)).join(' / ')}

응답 원칙:
1. 공감하고 격려
2. 구체적이고 실행 가능한 조언
3. 사용자의 데이터를 참고하여 개인화
4. 간결하게 (3-4문장)

JSON 형식으로 응답:
{
  "message": "코칭 메시지",
  "suggestions": ["제안1", "제안2"] (선택적),
  "actionItems": ["실행 항목1"] (선택적)
}`;

  return callClaudeJSON<CoachResponse>(userMessage, {
    system: systemPrompt,
    maxTokens: 800,
  });
}

// ==================== 인과관계 분석 ====================

export interface CausalityAnalysis {
  topTriggers: {
    title: string;
    impact: number;
    reason: string;
  }[];
  growthPatterns: string[];
  inflectionPoints: {
    date: string;
    cause: string;
    effect: string;
  }[];
  correlations: {
    factorA: string;
    factorB: string;
    strength: number;
    insight: string;
  }[];
  narrative: string;
}

export async function analyzeCausality(data: {
  triggers: Trigger[];
  insights: Insight[];
  goals: Goal[];
  journals: Journal[];
}): Promise<CausalityAnalysis> {
  const systemPrompt = `당신은 개인 성장 데이터 분석 전문가입니다.
사용자의 성장 데이터를 분석하여 인과관계를 발견해주세요.

분석 목표:
1. 가장 영향력 있던 자극(Trigger) 식별
2. 성장 패턴 발견
3. 변곡점(급성장 시점)과 원인
4. 숨겨진 상관관계

JSON 형식으로 응답:
{
  "topTriggers": [{"title": "제목", "impact": 1-100, "reason": "이유"}],
  "growthPatterns": ["패턴1", "패턴2"],
  "inflectionPoints": [{"date": "YYYY-MM", "cause": "원인", "effect": "결과"}],
  "correlations": [{"factorA": "요소A", "factorB": "요소B", "strength": 0.0-1.0, "insight": "인사이트"}],
  "narrative": "성장 스토리 요약 (3-4문장)"
}`;

  return callClaudeJSON<CausalityAnalysis>(JSON.stringify(data), {
    system: systemPrompt,
    maxTokens: 1500,
  });
}

// ==================== 챌린지 인사이트 추출 ====================

export interface ChallengeInsights {
  keyPoints: string[];
  applicableActions: string[];
  linkedConcepts: string[];
  summary: string;
}

export async function extractChallengeInsights(
  challengeType: string,
  title: string,
  content: string
): Promise<ChallengeInsights> {
  const systemPrompt = `당신은 학습 코치입니다.
사용자가 완료한 챌린지에서 핵심 인사이트를 추출해주세요.

JSON 형식으로 응답:
{
  "keyPoints": ["핵심 포인트1", "포인트2", "포인트3"],
  "applicableActions": ["적용할 수 있는 행동1", "행동2"],
  "linkedConcepts": ["연관 개념/키워드"],
  "summary": "한 문장 요약"
}`;

  return callClaudeJSON<ChallengeInsights>(
    `챌린지 유형: ${challengeType}\n제목: ${title}\n내용: ${content}`,
    { system: systemPrompt, maxTokens: 600 }
  );
}
