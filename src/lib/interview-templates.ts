/**
 * @file interview-templates.ts
 * @description AI 인터뷰 질문 템플릿 및 프롬프트
 *
 * @checkpoint CP-2.6
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @usage
 * import { SYSTEM_PROMPT, getQuestionPrompt } from '@/lib/interview-templates';
 */

import type { Content } from '@/types';

// ============================================
// System Prompt
// ============================================

/**
 * AI 파트너 시스템 프롬프트
 * Gemini Live API에 전달되는 기본 역할 설정
 */
export const SYSTEM_PROMPT = `당신은 Mosaic 앱의 AI 학습 파트너입니다.

## 역할
- 사용자가 콘텐츠를 깊이 이해할 수 있도록 돕는 소크라테스식 대화 파트너
- 적극적으로 질문하고, 사용자의 생각을 확장시키는 역할
- 따뜻하고 호기심 많은 성격

## 대화 원칙
1. **질문 중심**: 정보를 일방적으로 전달하지 말고, 질문으로 사용자의 생각을 이끌어내세요
2. **연결 유도**: "이전에 배운 것과 어떻게 연결될까요?" 같은 질문으로 지식 연결을 유도하세요
3. **대척점 탐구**: 반대 관점에 대해서도 생각해보도록 하세요
4. **감정 인정**: 사용자의 감정적 반응도 중요하게 다루세요
5. **인사이트 발견**: 대화 중 중요한 통찰이 나오면 짚어주세요

## 대화 스타일
- 자연스럽고 편안한 말투 (존댓말)
- 짧고 명확한 질문
- 사용자의 답변에 진심으로 관심을 보이세요
- 너무 길게 말하지 마세요 (2-3문장 이내)

## 금지 사항
- 강의하듯 긴 설명 금지
- 사용자의 답변을 판단하거나 평가 금지
- 정답을 알려주기보다 스스로 발견하도록 유도`;

// ============================================
// Question Types
// ============================================

/**
 * 질문 유형
 */
export type QuestionType =
  | 'understanding' // 이해 확인
  | 'connection' // 연결 질문
  | 'counterpoint' // 대척점 질문
  | 'application' // 적용 질문
  | 'emotion' // 감정 질문
  | 'insight' // 인사이트 질문
  | 'summary'; // 요약 질문

/**
 * 질문 템플릿
 */
export interface QuestionTemplate {
  type: QuestionType;
  label: string;
  description: string;
  examples: string[];
  prompt: string;
}

// ============================================
// Question Templates
// ============================================

export const QUESTION_TEMPLATES: Record<QuestionType, QuestionTemplate> = {
  understanding: {
    type: 'understanding',
    label: '이해 확인',
    description: '핵심 내용 이해도를 확인하는 질문',
    examples: [
      '이 내용에서 가장 핵심적인 부분은 뭐라고 생각하세요?',
      '한 문장으로 요약한다면 어떻게 말할 수 있을까요?',
      '저자가 가장 강조하고 싶은 메시지는 뭘까요?',
    ],
    prompt: `사용자가 방금 읽은 콘텐츠의 이해도를 확인하는 질문을 해주세요.
핵심 내용을 자신의 언어로 표현하도록 유도하세요.`,
  },

  connection: {
    type: 'connection',
    label: '연결 질문',
    description: '기존 지식과 연결하는 질문',
    examples: [
      '예전에 배운 것 중에 이것과 연결되는 게 있나요?',
      '이게 다른 분야에서도 적용될 수 있을까요?',
      '비슷한 개념을 어디서 본 적 있으세요?',
    ],
    prompt: `사용자가 새로 배운 내용을 기존 지식과 연결하도록 돕는 질문을 해주세요.
다른 분야, 이전 경험, 기존 지식과의 연결점을 찾도록 유도하세요.`,
  },

  counterpoint: {
    type: 'counterpoint',
    label: '대척점 질문',
    description: '반대 관점을 탐구하는 질문',
    examples: [
      '이 주장에 반대하는 사람은 뭐라고 할까요?',
      '이게 항상 옳은 건 아닐 수도 있지 않을까요?',
      '반대 상황에서는 어떻게 될까요?',
    ],
    prompt: `사용자가 다른 관점이나 반대 의견을 고려하도록 하는 질문을 해주세요.
비판적 사고를 자극하되, 공격적이지 않게 질문하세요.`,
  },

  application: {
    type: 'application',
    label: '적용 질문',
    description: '실생활 적용을 탐구하는 질문',
    examples: [
      '이걸 내 삶에 어떻게 적용할 수 있을까요?',
      '내일 당장 실천할 수 있는 게 있을까요?',
      '이 아이디어를 어디에 써먹을 수 있을까요?',
    ],
    prompt: `배운 내용을 실제 생활에 어떻게 적용할 수 있는지 질문해주세요.
구체적인 상황이나 행동으로 연결되도록 유도하세요.`,
  },

  emotion: {
    type: 'emotion',
    label: '감정 질문',
    description: '감정적 반응을 탐구하는 질문',
    examples: [
      '이 내용을 읽으면서 어떤 느낌이 들었어요?',
      '특별히 마음에 와닿은 부분이 있었나요?',
      '불편하거나 저항감이 드는 부분은 없었어요?',
    ],
    prompt: `콘텐츠에 대한 사용자의 감정적 반응을 물어보세요.
감정도 학습의 중요한 부분입니다. 편안하게 표현하도록 유도하세요.`,
  },

  insight: {
    type: 'insight',
    label: '인사이트 질문',
    description: '새로운 깨달음을 정리하는 질문',
    examples: [
      '오늘 대화에서 가장 인상 깊었던 건 뭐예요?',
      '새롭게 깨달은 게 있다면 뭘까요?',
      '이 대화를 통해 생각이 바뀐 부분이 있나요?',
    ],
    prompt: `대화를 통해 사용자가 얻은 인사이트나 깨달음을 정리하도록 도와주세요.
중요한 통찰을 명확하게 언어화하도록 유도하세요.`,
  },

  summary: {
    type: 'summary',
    label: '요약 질문',
    description: '학습 내용을 정리하는 질문',
    examples: [
      '오늘 배운 걸 세 가지로 정리한다면?',
      '이 내용을 친구에게 설명한다면 어떻게 할래요?',
      '기억하고 싶은 핵심 포인트는 뭐예요?',
    ],
    prompt: `세션을 마무리하며 학습 내용을 정리하는 질문을 해주세요.
핵심을 간결하게 정리하도록 유도하세요.`,
  },
};

// ============================================
// Interview Flow
// ============================================

/**
 * 기본 인터뷰 흐름
 * 질문 유형의 순서 정의
 */
export const DEFAULT_INTERVIEW_FLOW: QuestionType[] = [
  'understanding', // 1. 먼저 이해도 확인
  'emotion', // 2. 감정적 반응
  'connection', // 3. 기존 지식과 연결
  'counterpoint', // 4. 반대 관점 탐구
  'application', // 5. 실생활 적용
  'insight', // 6. 인사이트 정리
  'summary', // 7. 마무리 요약
];

// ============================================
// Prompt Generators
// ============================================

/**
 * 콘텐츠 기반 시작 프롬프트 생성
 */
export function generateStartPrompt(content: Content): string {
  return `사용자가 다음 콘텐츠를 학습하려고 합니다:

제목: ${content.title}
유형: ${content.type}
${content.summary ? `요약: ${content.summary}` : ''}
${content.body ? `내용 일부: ${content.body.slice(0, 500)}...` : ''}
${content.counterpoint ? `대척점 메모: ${content.counterpoint}` : ''}

이 콘텐츠에 대한 인터뷰를 시작해주세요.
먼저 가벼운 인사와 함께 첫 번째 질문(이해 확인)을 해주세요.`;
}

/**
 * 질문 유형별 프롬프트 생성
 */
export function generateQuestionPrompt(
  type: QuestionType,
  context?: string
): string {
  const template = QUESTION_TEMPLATES[type];

  let prompt = template.prompt;

  if (context) {
    prompt += `\n\n이전 대화 맥락: ${context}`;
  }

  return prompt;
}

/**
 * 마무리 프롬프트 생성
 */
export function generateClosingPrompt(insights: string[]): string {
  return `인터뷰 세션을 마무리해주세요.

${insights.length > 0 ? `오늘 발견한 인사이트들:\n${insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}` : ''}

따뜻하게 마무리 인사를 하고, 다음에 또 대화하자고 해주세요.
너무 길지 않게 2-3문장으로 마무리하세요.`;
}

// ============================================
// Quick Questions
// ============================================

/**
 * 빠른 시작용 질문 목록
 * 인터뷰 시작 시 바로 사용할 수 있는 질문들
 */
export const QUICK_START_QUESTIONS = [
  '이 내용에서 가장 인상 깊은 부분이 뭐예요?',
  '왜 이 콘텐츠를 선택하셨어요?',
  '이미 알고 있던 내용이 있었나요?',
  '처음 보는 개념이 있었어요?',
  '어떤 부분이 가장 흥미로웠어요?',
];

/**
 * 대화 이어가기용 질문
 */
export const FOLLOW_UP_QUESTIONS = [
  '조금 더 자세히 얘기해줄 수 있어요?',
  '왜 그렇게 생각하세요?',
  '예를 들어 설명해줄 수 있어요?',
  '그래서 어떤 느낌이 들었어요?',
  '다른 관점에서 보면 어떨까요?',
];

/**
 * 인사이트 발견 시 사용할 문구
 */
export const INSIGHT_ACKNOWLEDGMENTS = [
  '오, 정말 좋은 통찰이네요!',
  '그거 중요한 포인트 같아요.',
  '흥미로운 연결이네요!',
  '그 생각, 기억해두면 좋겠어요.',
  '지금 말씀하신 게 핵심인 것 같아요.',
];
