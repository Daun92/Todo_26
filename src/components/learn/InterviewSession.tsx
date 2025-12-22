/**
 * @file InterviewSession.tsx
 * @description AI 인터뷰 세션 UI 컴포넌트
 *
 * @checkpoint CP-2.3
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - AI와 사용자 대화 표시
 * - 메시지 입력 (텍스트/음성)
 * - 인사이트 캡처
 * - 세션 컨트롤 (종료/취소)
 * - 학습 콘텐츠 정보 표시
 *
 * @dependencies
 * - src/hooks/useInterview.ts
 * - src/lib/interview-templates.ts
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Exchange, Content, InterviewSession as InterviewSessionType } from '@/types';
import type { InterviewState } from '@/hooks/useInterview';

// ============================================
// Types
// ============================================

interface InterviewSessionProps {
  /** 현재 세션 */
  session: InterviewSessionType | null;
  /** 세션 상태 */
  state: InterviewState;
  /** 대화 목록 */
  exchanges: Exchange[];
  /** 인사이트 목록 */
  insights: string[];
  /** 현재 학습 콘텐츠 */
  content: Content | null;
  /** 질문 추가 (AI) */
  onAddQuestion?: (text: string) => void;
  /** 답변 추가 (사용자) */
  onAddAnswer: (text: string) => void;
  /** 인사이트 추가 */
  onAddInsight: (insight: string) => void;
  /** 세션 종료 */
  onEndSession: () => void;
  /** 세션 취소 */
  onCancelSession: () => void;
  /** AI 응답 대기 중 */
  isThinking?: boolean;
  /** 클래스명 */
  className?: string;
}

// ============================================
// Component
// ============================================

export function InterviewSession({
  session,
  state,
  exchanges,
  insights,
  content,
  onAddAnswer,
  onAddInsight,
  onEndSession,
  onCancelSession,
  isThinking = false,
  className,
}: InterviewSessionProps) {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showInsightInput, setShowInsightInput] = useState(false);
  const [insightText, setInsightText] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [exchanges]);

  // 세션 시작 시 입력 포커스
  useEffect(() => {
    if (state === 'active') {
      inputRef.current?.focus();
    }
  }, [state]);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    onAddAnswer(inputText.trim());
    setInputText('');
  }, [inputText, onAddAnswer]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddInsight = useCallback(() => {
    if (!insightText.trim()) return;

    onAddInsight(insightText.trim());
    setInsightText('');
    setShowInsightInput(false);
  }, [insightText, onAddInsight]);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    // TODO(CP-2.3): 음성 녹음 기능 연동
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------

  if (!session || state === 'idle') {
    return null;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 헤더 - 콘텐츠 정보 */}
      <div className="flex-shrink-0 border-b border-[var(--border-subtle)]">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-[var(--accent-green)]/10'
                )}
              >
                <BookOpen className="w-5 h-5 text-[var(--accent-green)]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--text-primary)] truncate">
                  {content?.title || '학습 세션'}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {exchanges.length}개의 대화 · {insights.length}개의 인사이트
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContent(!showContent)}
                className="text-[var(--text-muted)]"
              >
                {showContent ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelSession}
                className="text-[var(--text-muted)] hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 콘텐츠 상세 (펼침) */}
          {showContent && content && (
            <div
              className={cn(
                'mt-3 p-3 rounded-lg',
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
              )}
            >
              {content.url && (
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--accent-cyan)] hover:underline mb-2"
                >
                  {content.source || content.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {content.summary && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                  {content.summary}
                </p>
              )}
              {content.counterpoint && (
                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--accent-magenta)]">
                    💡 대척점: {content.counterpoint}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {exchanges.map((exchange) => (
          <MessageBubble key={exchange.id} exchange={exchange} />
        ))}

        {/* AI 생각 중 표시 */}
        {isThinking && <ThinkingIndicator />}

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 인사이트 표시 */}
      {insights.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-amber)] flex-shrink-0" />
            {insights.map((insight, idx) => (
              <span
                key={idx}
                className={cn(
                  'px-2 py-1 rounded-full text-xs whitespace-nowrap',
                  'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]',
                  'border border-[var(--accent-amber)]/20'
                )}
              >
                {insight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 인사이트 입력 */}
      {showInsightInput && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-xl',
              'bg-[var(--accent-amber)]/5 border border-[var(--accent-amber)]/20'
            )}
          >
            <Lightbulb className="w-4 h-4 text-[var(--accent-amber)] flex-shrink-0" />
            <input
              type="text"
              value={insightText}
              onChange={(e) => setInsightText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInsight()}
              placeholder="발견한 인사이트를 적어주세요..."
              className={cn(
                'flex-1 bg-transparent text-sm',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none'
              )}
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddInsight}
              disabled={!insightText.trim()}
              className="text-[var(--accent-amber)]"
            >
              저장
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowInsightInput(false)}
              className="text-[var(--text-muted)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-end gap-2">
          {/* 인사이트 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInsightInput(true)}
            className={cn(
              'flex-shrink-0',
              showInsightInput
                ? 'text-[var(--accent-amber)]'
                : 'text-[var(--text-muted)]'
            )}
            title="인사이트 추가"
          >
            <Lightbulb className="w-5 h-5" />
          </Button>

          {/* 텍스트 입력 */}
          <div
            className={cn(
              'flex-1 flex items-end gap-2 px-4 py-2 rounded-xl',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
              'focus-within:border-[var(--accent-cyan)]/50'
            )}
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="답변을 입력하세요..."
              rows={1}
              className={cn(
                'flex-1 bg-transparent resize-none',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none',
                'max-h-32'
              )}
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* 마이크 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={cn(
              'flex-shrink-0',
              isRecording
                ? 'text-red-400 animate-pulse'
                : 'text-[var(--text-muted)]'
            )}
            title={isRecording ? '녹음 중지' : '음성 입력'}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* 전송 버튼 */}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* 세션 컨트롤 */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-[var(--text-muted)]">
            {state === 'active' && 'AI 파트너와 대화 중'}
            {state === 'thinking' && 'AI가 생각하고 있어요...'}
            {state === 'completed' && '학습 완료!'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onEndSession}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            학습 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface MessageBubbleProps {
  exchange: Exchange;
}

function MessageBubble({ exchange }: MessageBubbleProps) {
  const isAI = exchange.type === 'question';

  return (
    <div
      className={cn(
        'flex',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-2xl',
          isAI
            ? [
                'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
                'rounded-tl-md',
              ]
            : [
                'bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20',
                'rounded-tr-md',
              ]
        )}
      >
        {isAI && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-xs font-medium text-[var(--accent-cyan)]">
              AI 파트너
            </span>
          </div>
        )}
        <p
          className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap',
            isAI ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
          )}
        >
          {exchange.text}
        </p>
        <p
          className={cn(
            'text-xs mt-1.5',
            isAI ? 'text-[var(--text-muted)]' : 'text-[var(--accent-cyan)]/60'
          )}
        >
          {formatTime(exchange.timestamp)}
        </p>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'px-4 py-3 rounded-2xl rounded-tl-md',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
        )}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          <span className="text-xs font-medium text-[var(--accent-cyan)]">
            AI 파트너
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Utilities
// ============================================

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
