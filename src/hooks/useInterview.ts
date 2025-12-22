/**
 * @file useInterview.ts
 * @description 인터뷰 세션 관리 훅
 *
 * @checkpoint CP-2.1
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: InterviewSession, Exchange 타입
 *
 * @usage
 * const { startSession, addExchange, endSession } = useInterview();
 */

import { useState, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { InterviewSession, Exchange, Content } from '@/types';

// ============================================
// Types
// ============================================

/**
 * 인터뷰 상태
 */
export type InterviewState = 'idle' | 'active' | 'thinking' | 'completed';

/**
 * 인터뷰 세션 생성 입력
 */
export interface StartSessionInput {
  contentId: string;
  content?: Content;
}

/**
 * useInterview 훅 반환 타입
 */
export interface UseInterviewReturn {
  // 현재 세션
  session: InterviewSession | null;
  state: InterviewState;
  exchanges: Exchange[];

  // 세션 관리
  startSession: (input: StartSessionInput) => Promise<InterviewSession>;
  endSession: () => Promise<void>;
  cancelSession: () => void;

  // 대화 관리
  addQuestion: (text: string) => void;
  addAnswer: (text: string) => void;
  addExchange: (type: Exchange['type'], text: string) => void;

  // 인사이트
  addInsight: (insight: string) => Promise<void>;
  insights: string[];

  // 현재 콘텐츠
  currentContent: Content | null;

  // 유틸리티
  isActive: boolean;
  exchangeCount: number;

  // 히스토리
  getSessionsByContent: (contentId: string) => Promise<InterviewSession[]>;
}

// ============================================
// Hook Implementation
// ============================================

export function useInterview(): UseInterviewReturn {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [state, setState] = useState<InterviewState>('idle');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);

  // 세션 ID 레퍼런스 (비동기 작업용)
  const sessionIdRef = useRef<string | null>(null);

  // ----------------------------------------
  // Session Management
  // ----------------------------------------

  /**
   * 새 인터뷰 세션 시작
   */
  const startSession = useCallback(
    async (input: StartSessionInput): Promise<InterviewSession> => {
      // 기존 세션이 있으면 종료
      if (session) {
        await endSession();
      }

      // 콘텐츠 조회
      let content = input.content;
      if (!content) {
        content = await db.contents.get(input.contentId);
      }

      if (!content) {
        throw new Error('콘텐츠를 찾을 수 없습니다');
      }

      // 새 세션 생성
      const newSession: InterviewSession = {
        id: crypto.randomUUID(),
        contentId: input.contentId,
        exchanges: [],
        insights: [],
        connections: [],
        createdAt: new Date(),
      };

      // DB에 저장
      await db.interviews.add(newSession);

      // 콘텐츠 상태를 'learning'으로 변경
      await db.contents.update(input.contentId, { status: 'learning' });

      // 상태 업데이트
      setSession(newSession);
      setExchanges([]);
      setInsights([]);
      setCurrentContent(content);
      setState('active');
      sessionIdRef.current = newSession.id;

      return newSession;
    },
    [session]
  );

  /**
   * 세션 종료 (완료)
   */
  const endSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    // DB 업데이트
    await db.interviews.update(session.id, {
      exchanges,
      insights,
      completedAt: new Date(),
    });

    // 콘텐츠 상태를 'completed'로 변경
    if (currentContent) {
      await db.contents.update(currentContent.id, {
        status: 'completed',
        completedAt: new Date(),
      });
    }

    // 상태 초기화
    setSession(null);
    setExchanges([]);
    setInsights([]);
    setCurrentContent(null);
    setState('completed');
    sessionIdRef.current = null;

    // 잠시 후 idle로 전환
    setTimeout(() => setState('idle'), 1000);
  }, [session, exchanges, insights, currentContent]);

  /**
   * 세션 취소 (저장하지 않음)
   */
  const cancelSession = useCallback((): void => {
    if (!session) return;

    // DB에서 세션 삭제
    db.interviews.delete(session.id);

    // 콘텐츠 상태를 'queued'로 복원
    if (currentContent) {
      db.contents.update(currentContent.id, { status: 'queued' });
    }

    // 상태 초기화
    setSession(null);
    setExchanges([]);
    setInsights([]);
    setCurrentContent(null);
    setState('idle');
    sessionIdRef.current = null;
  }, [session, currentContent]);

  // ----------------------------------------
  // Exchange Management
  // ----------------------------------------

  /**
   * 대화 추가 (내부)
   */
  const addExchange = useCallback(
    (type: Exchange['type'], text: string): void => {
      const newExchange: Exchange = {
        id: crypto.randomUUID(),
        type,
        text,
        timestamp: new Date(),
      };

      setExchanges((prev) => [...prev, newExchange]);

      // DB 업데이트 (비동기)
      if (sessionIdRef.current) {
        db.interviews.update(sessionIdRef.current, {
          exchanges: [...exchanges, newExchange],
        });
      }
    },
    [exchanges]
  );

  /**
   * AI 질문 추가
   */
  const addQuestion = useCallback(
    (text: string): void => {
      addExchange('question', text);
    },
    [addExchange]
  );

  /**
   * 사용자 답변 추가
   */
  const addAnswer = useCallback(
    (text: string): void => {
      addExchange('answer', text);
    },
    [addExchange]
  );

  // ----------------------------------------
  // Insight Management
  // ----------------------------------------

  /**
   * 인사이트 추가
   */
  const addInsight = useCallback(
    async (insight: string): Promise<void> => {
      const newInsights = [...insights, insight];
      setInsights(newInsights);

      // DB 업데이트
      if (sessionIdRef.current) {
        await db.interviews.update(sessionIdRef.current, {
          insights: newInsights,
        });
      }
    },
    [insights]
  );

  // ----------------------------------------
  // History
  // ----------------------------------------

  /**
   * 콘텐츠별 세션 히스토리 조회
   */
  const getSessionsByContent = useCallback(
    async (contentId: string): Promise<InterviewSession[]> => {
      return db.interviews
        .where('contentId')
        .equals(contentId)
        .reverse()
        .sortBy('createdAt');
    },
    []
  );

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    // 현재 세션
    session,
    state,
    exchanges,

    // 세션 관리
    startSession,
    endSession,
    cancelSession,

    // 대화 관리
    addQuestion,
    addAnswer,
    addExchange,

    // 인사이트
    addInsight,
    insights,

    // 현재 콘텐츠
    currentContent,

    // 유틸리티
    isActive: state === 'active' || state === 'thinking',
    exchangeCount: exchanges.length,

    // 히스토리
    getSessionsByContent,
  };
}

// ============================================
// Utility Hooks
// ============================================

/**
 * 특정 콘텐츠의 인터뷰 히스토리 조회 훅
 */
export function useInterviewHistory(contentId: string | null) {
  const sessions = useLiveQuery(
    async () => {
      if (!contentId) return [];
      return db.interviews
        .where('contentId')
        .equals(contentId)
        .reverse()
        .sortBy('createdAt');
    },
    [contentId]
  );

  return {
    sessions: sessions || [],
    loading: sessions === undefined,
    count: sessions?.length || 0,
  };
}

/**
 * 최근 인터뷰 세션 조회 훅
 */
export function useRecentInterviews(limit: number = 5) {
  const sessions = useLiveQuery(async () => {
    return db.interviews.orderBy('createdAt').reverse().limit(limit).toArray();
  }, [limit]);

  return {
    sessions: sessions || [],
    loading: sessions === undefined,
  };
}
