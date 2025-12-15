import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Sparkles, Loader2, X, ChevronUp } from 'lucide-react';
import { Button, Card, CardContent, Textarea } from '@/components/ui';
import { hasAPIKey } from '@/lib/claude';
import { chatWithCoach } from '@/lib/ai-services';
import type { CoachResponse } from '@/lib/ai-services';
import { db } from '@/lib/db';
import { cn, calculateStreak } from '@/lib/utils';
import type { Goal, Journal } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actionItems?: string[];
  timestamp: Date;
}

export function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [streak, setStreak] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadContext = async () => {
      const [goalsData, journalsData, habitLogs] = await Promise.all([
        db.goals.toArray(),
        db.journals.orderBy('date').reverse().limit(5).toArray(),
        db.habitLogs.toArray(),
      ]);
      setGoals(goalsData);
      setJournals(journalsData);
      setStreak(calculateStreak(habitLogs.map((l) => l.date)));
    };
    loadContext();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 초기 환영 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! Catalyze 26 AI 코치입니다. 목표 달성, 습관 형성, 또는 성장에 대해 무엇이든 물어보세요.',
        suggestions: ['오늘의 동기부여가 필요해요', '목표를 어떻게 설정해야 할까요?', '습관을 유지하기 어려워요'],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !hasAPIKey()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithCoach(text, {
        goals,
        recentJournals: journals,
        currentStreak: streak,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
        actionItems: response.actionItems,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAPIKey()) {
    return null;
  }

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed right-4 z-50 transition-all duration-300',
        isMinimized ? 'bottom-24' : 'bottom-24 w-80 sm:w-96'
      )}
    >
      <Card className="shadow-xl border-2 border-primary-200 dark:border-primary-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI 코치</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <ChevronUp className={cn('w-4 h-4 transition-transform', isMinimized && 'rotate-180')} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        {!isMinimized && (
          <>
            <CardContent className="p-3 h-72 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2',
                      message.role === 'user'
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(suggestion)}
                            className="block w-full text-left text-xs px-2 py-1 bg-white/20 dark:bg-slate-700 rounded hover:bg-white/30 dark:hover:bg-slate-600 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Items */}
                    {message.actionItems && message.actionItems.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium mb-1">실행 항목:</p>
                        <ul className="space-y-1">
                          {message.actionItems.map((item, i) => (
                            <li key={i} className="text-xs flex items-start gap-1">
                              <span className="text-primary-400">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 rounded-bl-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
