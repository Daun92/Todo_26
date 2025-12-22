/**
 * @file useAIInterview.ts
 * @description AI 인터뷰 세션 관리 훅 (Gemini API 연동)
 *
 * @checkpoint CP-5.2
 * @created 2025-12-22
 *
 * @features
 * - AI 질문 자동 생성
 * - Gemini Live API 실시간 대화 (선택적)
 * - REST API 폴백
 * - 대화 흐름 관리
 */

import { useState, useCallback, useRef } from 'react';
import { useInterview, type StartSessionInput } from './useInterview';
import { aiService } from '@/lib/ai-service';
import {
  getGeminiService,
  getApiKey,
  hasApiKey,
  type ConnectionState,
} from '@/lib/gemini-live';
import { SYSTEM_PROMPT, generateStartPrompt } from '@/lib/interview-templates';
import type { Content, Exchange } from '@/types';

// ============================================
// Types
// ============================================

export interface UseAIInterviewReturn {
  // Session state (from useInterview)
  session: ReturnType<typeof useInterview>['session'];
  state: ReturnType<typeof useInterview>['state'];
  exchanges: Exchange[];
  insights: string[];
  currentContent: Content | null;

  // AI state
  isAIConnected: boolean;
  isAIThinking: boolean;
  connectionState: ConnectionState;
  useRealTimeMode: boolean;

  // Actions
  startSession: (input: StartSessionInput) => Promise<void>;
  endSession: () => Promise<void>;
  cancelSession: () => void;
  sendMessage: (text: string) => Promise<void>;
  addInsight: (insight: string) => void;

  // AI controls
  setUseRealTimeMode: (value: boolean) => void;
  reconnectAI: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useAIInterview(): UseAIInterviewReturn {
  // Base interview hook
  const interview = useInterview();

  // AI state
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [useRealTimeMode, setUseRealTimeMode] = useState(false);

  // Refs for managing conversation
  const pendingResponseRef = useRef<string>('');
  const exchangeHistoryRef = useRef<Array<{ question: string; answer: string }>>([]);

  // ----------------------------------------
  // AI Connection Management
  // ----------------------------------------

  const connectToGeminiLive = useCallback(async (content: Content): Promise<boolean> => {
    if (!hasApiKey()) {
      console.warn('[AI Interview] No API key configured');
      return false;
    }

    const gemini = getGeminiService();

    gemini.setCallbacks({
      onConnectionChange: setConnectionState,
      onMessage: (text, isFinal) => {
        pendingResponseRef.current += text;
        if (isFinal && pendingResponseRef.current) {
          interview.addQuestion(pendingResponseRef.current.trim());
          pendingResponseRef.current = '';
          setIsAIThinking(false);
        }
      },
      onError: (error) => {
        console.error('[AI Interview] Gemini error:', error);
        setIsAIThinking(false);
      },
    });

    try {
      const connected = await gemini.connect({
        apiKey: getApiKey()!,
        systemInstruction: SYSTEM_PROMPT,
      });

      if (connected) {
        // Send initial context
        const startPrompt = generateStartPrompt(content);
        gemini.sendText(startPrompt);
        setIsAIThinking(true);
      }

      return connected;
    } catch (error) {
      console.error('[AI Interview] Connection failed:', error);
      return false;
    }
  }, [interview]);

  const disconnectFromGeminiLive = useCallback(() => {
    const gemini = getGeminiService();
    gemini.disconnect();
    setConnectionState('disconnected');
  }, []);

  // ----------------------------------------
  // REST API Fallback
  // ----------------------------------------

  const generateAIQuestionREST = useCallback(async (
    content: Content,
    isFirst: boolean = false
  ): Promise<string | null> => {
    if (!hasApiKey()) {
      return null;
    }

    try {
      setIsAIThinking(true);

      if (isFirst) {
        // Generate first question
        const result = await aiService.generateInterviewQuestion(content, []);
        return result?.question || null;
      }

      // Generate follow-up question based on history
      const result = await aiService.generateInterviewQuestion(
        content,
        exchangeHistoryRef.current
      );
      return result?.question || null;
    } catch (error) {
      console.error('[AI Interview] REST API error:', error);
      return null;
    } finally {
      setIsAIThinking(false);
    }
  }, []);

  // ----------------------------------------
  // Session Management
  // ----------------------------------------

  const startSession = useCallback(async (input: StartSessionInput) => {
    // Reset state
    exchangeHistoryRef.current = [];
    pendingResponseRef.current = '';

    // Start base session
    await interview.startSession(input);

    // Get content for AI context
    const content = interview.currentContent;
    if (!content) return;

    // Try real-time mode first if enabled
    if (useRealTimeMode && hasApiKey()) {
      const connected = await connectToGeminiLive(content);
      if (connected) return;
    }

    // Fallback to REST API
    const firstQuestion = await generateAIQuestionREST(content, true);
    if (firstQuestion) {
      setTimeout(() => {
        interview.addQuestion(firstQuestion);
      }, 500);
    } else {
      // Final fallback to default question
      setTimeout(() => {
        interview.addQuestion('안녕하세요! 이 콘텐츠에서 가장 인상 깊었던 부분은 무엇인가요?');
      }, 500);
    }
  }, [interview, useRealTimeMode, connectToGeminiLive, generateAIQuestionREST]);

  const endSession = useCallback(async () => {
    disconnectFromGeminiLive();
    await interview.endSession();
    exchangeHistoryRef.current = [];
  }, [interview, disconnectFromGeminiLive]);

  const cancelSession = useCallback(() => {
    disconnectFromGeminiLive();
    interview.cancelSession();
    exchangeHistoryRef.current = [];
  }, [interview, disconnectFromGeminiLive]);

  // ----------------------------------------
  // Message Handling
  // ----------------------------------------

  const sendMessage = useCallback(async (text: string) => {
    // Add user's answer
    interview.addAnswer(text);

    // Update history
    const lastQuestion = interview.exchanges
      .filter(e => e.type === 'question')
      .pop();

    if (lastQuestion) {
      exchangeHistoryRef.current.push({
        question: lastQuestion.text,
        answer: text,
      });
    }

    // Generate AI response
    if (useRealTimeMode && connectionState === 'connected') {
      // Use Gemini Live
      const gemini = getGeminiService();
      gemini.sendText(text);
      setIsAIThinking(true);
    } else if (hasApiKey() && interview.currentContent) {
      // Use REST API
      const nextQuestion = await generateAIQuestionREST(interview.currentContent);
      if (nextQuestion) {
        interview.addQuestion(nextQuestion);
      }
    }
  }, [interview, useRealTimeMode, connectionState, generateAIQuestionREST]);

  // ----------------------------------------
  // Reconnection
  // ----------------------------------------

  const reconnectAI = useCallback(async () => {
    if (!interview.currentContent) return;

    if (useRealTimeMode) {
      disconnectFromGeminiLive();
      await connectToGeminiLive(interview.currentContent);
    }
  }, [interview.currentContent, useRealTimeMode, disconnectFromGeminiLive, connectToGeminiLive]);

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    // Session state
    session: interview.session,
    state: isAIThinking ? 'thinking' : interview.state,
    exchanges: interview.exchanges,
    insights: interview.insights,
    currentContent: interview.currentContent,

    // AI state
    isAIConnected: connectionState === 'connected',
    isAIThinking,
    connectionState,
    useRealTimeMode,

    // Actions
    startSession,
    endSession,
    cancelSession,
    sendMessage,
    addInsight: interview.addInsight,

    // AI controls
    setUseRealTimeMode,
    reconnectAI,
  };
}
