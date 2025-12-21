import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip } from 'lucide-react';
import { AIOrb, type AIState } from '@/components/ai';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요. 저는 당신의 성장 파트너 Mosaic입니다.\n\n오늘 어떤 것을 탐험해볼까요? 관심 있는 주제가 있다면 알려주세요.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAiState('thinking');

    // Simulate AI response
    setTimeout(() => {
      setAiState('speaking');
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getAIResponse(userMessage.content),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setAiState('idle');
      }, 1000);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAiState('idle');
    } else {
      setIsRecording(true);
      setAiState('listening');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* AI Orb Header */}
      <div className="flex flex-col items-center py-6">
        <AIOrb state={aiState} size="md" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          {aiState === 'idle' && 'Mosaic'}
          {aiState === 'listening' && '듣고 있어요...'}
          {aiState === 'thinking' && '생각하고 있어요...'}
          {aiState === 'speaking' && '말하고 있어요...'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass glass-border">
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <button
            className={cn(
              'p-3 rounded-xl btn-neural-ghost',
              'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className={cn(
                'w-full px-4 py-3 rounded-2xl resize-none',
                'bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-[var(--accent-cyan)]',
                'focus:shadow-[0_0_10px_rgba(0,212,255,0.2)]',
                'transition-all duration-200'
              )}
            />
          </div>

          {/* Voice Button */}
          <button
            onClick={toggleRecording}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              isRecording
                ? 'bg-[var(--accent-magenta)] text-white animate-pulse'
                : 'btn-neural-ghost text-[var(--text-muted)] hover:text-[var(--accent-cyan)]'
            )}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              input.trim()
                ? 'btn-neural-primary'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <VoiceWaveform />
            <span className="text-sm text-[var(--accent-cyan)]">
              녹음 중... 탭하여 중지
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex animate-slide-up',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-3',
          isAI ? 'message-ai' : 'message-user'
        )}
      >
        <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// Voice Waveform Visualization
function VoiceWaveform() {
  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="waveform-bar w-1"
          style={{
            height: `${Math.random() * 16 + 8}px`,
            animation: `pulse 0.5s ease-in-out infinite`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// Temporary AI response generator
function getAIResponse(userInput: string): string {
  const responses = [
    `흥미로운 주제네요! "${userInput}"에 대해 더 깊이 탐험해볼까요?\n\n이 주제와 관련해서 어떤 점이 가장 궁금하신가요?`,
    `그 생각이 인상적이에요. 혹시 이 관점의 반대편도 생각해 보셨나요?\n\n다른 시각에서 바라보면 새로운 인사이트를 발견할 수 있어요.`,
    `좋은 질문이에요! 이 주제는 다른 분야와도 연결될 수 있어요.\n\n예를 들어, 심리학이나 경제학적 관점에서 바라보면 어떨까요?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
