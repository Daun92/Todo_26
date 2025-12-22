/**
 * @file ai-service.ts
 * @description 통합 AI 서비스 레이어 (Gemini REST API)
 *
 * @checkpoint CP-5.1
 * @created 2025-12-22
 *
 * @features
 * - 콘텐츠 요약
 * - 대척점(반대 관점) 생성
 * - 패턴 분석
 * - 연결 제안
 * - 성장 스토리 생성
 * - 인터뷰 질문 생성
 *
 * @usage
 * import { aiService } from '@/lib/ai-service';
 * const summary = await aiService.summarizeContent(content);
 */

import { getApiKey } from './gemini-live';
import type { Content, Memo, Tag } from '@/types';

// ============================================
// Configuration
// ============================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash-exp';

// ============================================
// Types
// ============================================

export interface AISummary {
  summary: string;
  keyPoints: string[];
  estimatedReadTime: number;
}

export interface AICounterpoint {
  counterpoint: string;
  alternativePerspectives: string[];
  questions: string[];
}

export interface AIPattern {
  name: string;
  description: string;
  confidence: number;
  relatedTopics: string[];
  insight: string;
}

export interface AIConnection {
  sourceId: string;
  targetId: string;
  relationship: string;
  explanation: string;
  strength: number;
}

export interface AIGrowthStory {
  title: string;
  narrative: string;
  period: {
    start: Date;
    end: Date;
  };
  themes: string[];
  milestones: {
    title: string;
    description: string;
    date: Date;
  }[];
  highlights: string[];
  insights: string[];
  growthDirection: string;
  nextSteps: string[];
}

export interface AIInterviewQuestion {
  question: string;
  type: 'understanding' | 'connection' | 'counterpoint' | 'application' | 'insight';
  followUp?: string;
}

export interface AIServiceConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// ============================================
// API Request Helper
// ============================================

async function callGeminiAPI(
  prompt: string,
  systemPrompt?: string,
  config?: AIServiceConfig
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set your API key in settings.');
  }

  const model = config?.model || DEFAULT_MODEL;
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  const contents = [];

  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `[System Instructions]\n${systemPrompt}` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: '네, 이해했습니다. 지시에 따라 응답하겠습니다.' }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: config?.temperature ?? 0.7,
        maxOutputTokens: config?.maxTokens ?? 2048,
        topP: 0.95,
        topK: 40,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from AI');
  }

  return text;
}

// ============================================
// JSON Parsing Helper
// ============================================

function parseJSONResponse<T>(text: string, fallback: T): T {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonStr);
  } catch {
    console.warn('Failed to parse AI response as JSON:', text);
    return fallback;
  }
}

// ============================================
// AI Service Class
// ============================================

class AIService {
  private config: AIServiceConfig = {};

  setConfig(config: AIServiceConfig) {
    this.config = config;
  }

  // ----------------------------------------
  // Content Summarization
  // ----------------------------------------

  async summarizeContent(content: Content): Promise<AISummary> {
    const systemPrompt = `당신은 콘텐츠 요약 전문가입니다.
핵심을 간결하게 정리하고, 주요 포인트를 추출합니다.
응답은 반드시 JSON 형식으로 해주세요.`;

    const prompt = `다음 콘텐츠를 분석하고 요약해주세요:

제목: ${content.title}
유형: ${content.type}
${content.url ? `URL: ${content.url}` : ''}
${content.body ? `내용:\n${content.body.slice(0, 3000)}` : ''}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "2-3문장의 핵심 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "estimatedReadTime": 예상 읽기 시간(분)
}`;

    const response = await callGeminiAPI(prompt, systemPrompt, this.config);
    return parseJSONResponse<AISummary>(response, {
      summary: content.summary || content.title,
      keyPoints: [],
      estimatedReadTime: 5,
    });
  }

  // ----------------------------------------
  // Counterpoint Generation
  // ----------------------------------------

  async generateCounterpoint(content: Content): Promise<AICounterpoint> {
    const systemPrompt = `당신은 비판적 사고 전문가입니다.
주어진 콘텐츠의 반대 관점, 대안적 시각, 비판적 질문을 제시합니다.
균형 잡힌 시각을 제공하되, 공격적이지 않게 표현해주세요.
응답은 반드시 JSON 형식으로 해주세요.`;

    const prompt = `다음 콘텐츠에 대한 대척점(반대 관점)을 제시해주세요:

제목: ${content.title}
${content.summary ? `요약: ${content.summary}` : ''}
${content.body ? `내용:\n${content.body.slice(0, 2000)}` : ''}

다음 JSON 형식으로 응답해주세요:
{
  "counterpoint": "핵심 반대 관점 1-2문장",
  "alternativePerspectives": ["대안적 시각 1", "대안적 시각 2"],
  "questions": ["비판적 질문 1", "비판적 질문 2"]
}`;

    const response = await callGeminiAPI(prompt, systemPrompt, this.config);
    return parseJSONResponse<AICounterpoint>(response, {
      counterpoint: '',
      alternativePerspectives: [],
      questions: [],
    });
  }

  // ----------------------------------------
  // Pattern Analysis
  // ----------------------------------------

  async analyzePatterns(
    contents: Content[],
    memos: Memo[],
    tags: Tag[]
  ): Promise<AIPattern[]> {
    const systemPrompt = `당신은 학습 패턴 분석 전문가입니다.
사용자의 학습 데이터에서 의미 있는 패턴과 연결고리를 발견합니다.
응답은 반드시 JSON 배열 형식으로 해주세요.`;

    const contentSummaries = contents.slice(0, 10).map(c => ({
      title: c.title,
      tags: c.tags,
      type: c.type,
    }));

    const memoSummaries = memos.slice(0, 10).map(m => ({
      text: m.text.slice(0, 100),
      tags: m.tags,
    }));

    const tagNames = tags.slice(0, 20).map(t => t.name);

    const prompt = `다음 학습 데이터에서 패턴을 분석해주세요:

최근 콘텐츠:
${JSON.stringify(contentSummaries, null, 2)}

최근 메모:
${JSON.stringify(memoSummaries, null, 2)}

사용 중인 태그: ${tagNames.join(', ')}

다음 JSON 배열 형식으로 응답해주세요:
[
  {
    "name": "패턴 이름",
    "description": "패턴 설명",
    "confidence": 0.8,
    "relatedTopics": ["관련 주제들"],
    "insight": "이 패턴이 의미하는 것"
  }
]

최대 5개의 패턴을 찾아주세요.`;

    const response = await callGeminiAPI(prompt, systemPrompt, this.config);
    return parseJSONResponse<AIPattern[]>(response, []);
  }

  // ----------------------------------------
  // Connection Suggestions
  // ----------------------------------------

  async suggestConnections(
    contents: Content[],
    memos: Memo[]
  ): Promise<AIConnection[]> {
    const systemPrompt = `당신은 지식 연결 전문가입니다.
서로 관련 있는 콘텐츠와 메모 사이의 연결고리를 찾아냅니다.
응답은 반드시 JSON 배열 형식으로 해주세요.`;

    const items = [
      ...contents.slice(0, 8).map(c => ({
        id: c.id,
        type: 'content',
        title: c.title,
        tags: c.tags,
      })),
      ...memos.slice(0, 8).map(m => ({
        id: m.id,
        type: 'memo',
        title: m.text.slice(0, 50),
        tags: m.tags,
      })),
    ];

    const prompt = `다음 콘텐츠와 메모들 사이의 연결을 제안해주세요:

${JSON.stringify(items, null, 2)}

다음 JSON 배열 형식으로 응답해주세요:
[
  {
    "sourceId": "소스 ID",
    "targetId": "타겟 ID",
    "relationship": "연결 관계 (예: '관련 주제', '영감', '응용')",
    "explanation": "왜 이 연결이 의미 있는지",
    "strength": 연결 강도 1-10
  }
]

최대 5개의 연결을 제안해주세요.`;

    const response = await callGeminiAPI(prompt, systemPrompt, this.config);
    return parseJSONResponse<AIConnection[]>(response, []);
  }

  // ----------------------------------------
  // Growth Story Generation
  // ----------------------------------------

  async generateGrowthStory(
    contents: Content[],
    memos: Memo[],
    period: { start: Date; end: Date }
  ): Promise<AIGrowthStory> {
    const systemPrompt = `당신은 성장 스토리텔러입니다.
사용자의 학습 여정을 따뜻하고 의미 있는 스토리로 만들어줍니다.
성취를 축하하고, 성장을 격려하는 톤으로 작성해주세요.
응답은 반드시 JSON 형식으로 해주세요.`;

    const completedContents = contents
      .filter(c => c.status === 'completed')
      .slice(0, 10);

    const periodStr = `${period.start.toLocaleDateString('ko-KR')} ~ ${period.end.toLocaleDateString('ko-KR')}`;

    // Extract themes from tags
    const allTags = completedContents.flatMap(c => c.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topThemes = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    const prompt = `다음 학습 데이터를 바탕으로 성장 스토리를 만들어주세요:

기간: ${periodStr}

완료한 학습:
${completedContents.map(c => `- ${c.title} (${c.tags.join(', ')}) - ${new Date(c.completedAt || c.createdAt).toLocaleDateString('ko-KR')}`).join('\n')}

작성한 메모: ${memos.length}개

주요 테마: ${topThemes.join(', ') || '없음'}

다음 JSON 형식으로 응답해주세요:
{
  "title": "성장 스토리 제목 (예: '탐험가의 한 주')",
  "narrative": "5-8문장의 성장 내러티브. 따뜻하고 격려하는 톤으로.",
  "themes": ["주요 테마1", "주요 테마2", "주요 테마3"],
  "milestones": [
    {
      "title": "마일스톤 제목",
      "description": "마일스톤 설명",
      "date": "2025-12-22"
    }
  ],
  "highlights": ["주요 성취 1", "주요 성취 2"],
  "insights": ["발견한 인사이트1", "인사이트2"],
  "growthDirection": "성장 방향 요약 (예: '기술 깊이 확장')",
  "nextSteps": ["다음 단계 제안1", "다음 단계 제안2"]
}`;

    const response = await callGeminiAPI(prompt, systemPrompt, this.config);
    const parsed = parseJSONResponse<Omit<AIGrowthStory, 'period' | 'milestones'> & { milestones: Array<{ title: string; description: string; date: string }> }>(response, {
      title: '나의 학습 여정',
      narrative: '학습 데이터를 분석 중입니다.',
      themes: topThemes.length > 0 ? topThemes : ['학습'],
      milestones: [],
      highlights: [],
      insights: [],
      growthDirection: '꾸준한 성장',
      nextSteps: [],
    });

    // Convert date strings to Date objects and add period
    return {
      ...parsed,
      period,
      milestones: parsed.milestones.map(m => ({
        ...m,
        date: new Date(m.date),
      })),
    };
  }

  // ----------------------------------------
  // Interview Question Generation
  // ----------------------------------------

  async generateInterviewQuestion(
    content: Content,
    previousExchanges: Array<{ question: string; answer: string }>,
    questionType?: AIInterviewQuestion['type']
  ): Promise<AIInterviewQuestion> {
    const systemPrompt = `당신은 소크라테스식 대화 전문가입니다.
사용자가 콘텐츠를 깊이 이해할 수 있도록 질문을 생성합니다.
질문은 짧고 명확하며, 사용자의 생각을 이끌어내는 것이어야 합니다.
응답은 반드시 JSON 형식으로 해주세요.`;

    const previousContext = previousExchanges
      .slice(-3)
      .map(e => `Q: ${e.question}\nA: ${e.answer}`)
      .join('\n\n');

    const prompt = `다음 콘텐츠에 대한 인터뷰 질문을 생성해주세요:

콘텐츠:
제목: ${content.title}
${content.summary ? `요약: ${content.summary}` : ''}
${content.body ? `내용 일부: ${content.body.slice(0, 500)}` : ''}

${previousContext ? `이전 대화:\n${previousContext}\n\n` : ''}
${questionType ? `질문 유형: ${questionType}` : ''}

다음 JSON 형식으로 응답해주세요:
{
  "question": "질문 (2문장 이내)",
  "type": "understanding|connection|counterpoint|application|insight",
  "followUp": "후속 질문 (선택사항)"
}`;

    const response = await callGeminiAPI(prompt, systemPrompt, {
      ...this.config,
      temperature: 0.8,
    });

    return parseJSONResponse<AIInterviewQuestion>(response, {
      question: '이 내용에서 가장 인상 깊은 부분은 무엇인가요?',
      type: 'understanding',
    });
  }

  // ----------------------------------------
  // Chat Completion (General)
  // ----------------------------------------

  async chat(
    message: string,
    context?: string,
    systemPrompt?: string
  ): Promise<string> {
    const defaultSystem = `당신은 Mosaic 앱의 AI 학습 파트너입니다.
친근하고 따뜻하게 대화하며, 사용자의 학습을 돕습니다.
한국어로 자연스럽게 대화해주세요.`;

    let prompt = message;
    if (context) {
      prompt = `맥락:\n${context}\n\n질문: ${message}`;
    }

    return callGeminiAPI(prompt, systemPrompt || defaultSystem, this.config);
  }

  // ----------------------------------------
  // Health Check
  // ----------------------------------------

  async checkConnection(): Promise<boolean> {
    try {
      await callGeminiAPI('Hello', undefined, { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }

  isConfigured(): boolean {
    return !!getApiKey();
  }
}

// ============================================
// Singleton Export
// ============================================

export const aiService = new AIService();

// ============================================
// React Hook
// ============================================

import { useState, useCallback } from 'react';

export interface UseAIReturn {
  isLoading: boolean;
  error: string | null;
  summarize: (content: Content) => Promise<AISummary | null>;
  generateCounterpoint: (content: Content) => Promise<AICounterpoint | null>;
  analyzePatterns: (contents: Content[], memos: Memo[], tags: Tag[]) => Promise<AIPattern[]>;
  suggestConnections: (contents: Content[], memos: Memo[]) => Promise<AIConnection[]>;
  generateGrowthStory: (contents: Content[], memos: Memo[], period: { start: Date; end: Date }) => Promise<AIGrowthStory | null>;
  generateQuestion: (content: Content, exchanges: Array<{ question: string; answer: string }>) => Promise<AIInterviewQuestion | null>;
  chat: (message: string, context?: string) => Promise<string | null>;
  isConfigured: boolean;
}

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'AI 요청 실패';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    isConfigured: aiService.isConfigured(),
    summarize: useCallback(
      (content: Content) => handleRequest(() => aiService.summarizeContent(content)),
      [handleRequest]
    ),
    generateCounterpoint: useCallback(
      (content: Content) => handleRequest(() => aiService.generateCounterpoint(content)),
      [handleRequest]
    ),
    analyzePatterns: useCallback(
      (contents: Content[], memos: Memo[], tags: Tag[]) =>
        handleRequest(() => aiService.analyzePatterns(contents, memos, tags)).then(r => r || []),
      [handleRequest]
    ),
    suggestConnections: useCallback(
      (contents: Content[], memos: Memo[]) =>
        handleRequest(() => aiService.suggestConnections(contents, memos)).then(r => r || []),
      [handleRequest]
    ),
    generateGrowthStory: useCallback(
      (contents: Content[], memos: Memo[], period: { start: Date; end: Date }) =>
        handleRequest(() => aiService.generateGrowthStory(contents, memos, period)),
      [handleRequest]
    ),
    generateQuestion: useCallback(
      (content: Content, exchanges: Array<{ question: string; answer: string }>) =>
        handleRequest(() => aiService.generateInterviewQuestion(content, exchanges)),
      [handleRequest]
    ),
    chat: useCallback(
      (message: string, context?: string) =>
        handleRequest(() => aiService.chat(message, context)),
      [handleRequest]
    ),
  };
}
