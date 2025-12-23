import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, Wifi, WifiOff, Settings } from 'lucide-react';
import { AIOrb, type AIState } from '@/components/ai';
import {
  getGeminiService,
  getApiKey,
  hasApiKey,
  type ConnectionState,
} from '@/lib/gemini-live';
import { AudioRecorder } from '@/lib/audio-recorder';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatPage() {
  const { openModal } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [streamingMessage, setStreamingMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const geminiRef = useRef(getGeminiService());
  const recorderRef = useRef<AudioRecorder | null>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = hasApiKey()
        ? '안녕하세요. 저는 당신의 성장 파트너 Mosaic입니다.\n\n오늘 어떤 것을 탐험해볼까요? 관심 있는 주제가 있다면 알려주세요.'
        : '안녕하세요! Mosaic을 시작하려면 먼저 Gemini API 키를 설정해주세요.\n\n우측 상단의 설정 버튼을 눌러 API 키를 입력할 수 있어요.';

      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Setup Gemini callbacks
  useEffect(() => {
    const gemini = geminiRef.current;

    gemini.setCallbacks({
      onConnectionChange: (state) => {
        setConnectionState(state);
        if (state === 'connected') {
          setAiState('idle');
        } else if (state === 'connecting') {
          setAiState('thinking');
        }
      },
      onMessage: (text, isFinal) => {
        if (isFinal) {
          // Finalize the streaming message
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.isStreaming) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + text, isStreaming: false },
              ];
            }
            return [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date(),
              },
            ];
          });
          setAiState('idle');
          setStreamingMessage('');
        } else {
          // Update streaming message
          setAiState('speaking');
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.isStreaming) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + text },
              ];
            }
            return [
              ...prev,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date(),
                isStreaming: true,
              },
            ];
          });
        }
      },
      onError: (error) => {
        console.error('[Chat] Gemini error:', error);
        setAiState('idle');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `오류가 발생했어요: ${error.message}\n\n다시 시도해주세요.`,
            timestamp: new Date(),
          },
        ]);
      },
      onTranscript: (text, isUser) => {
        if (isUser) {
          // User's speech was transcribed
          setInput((prev) => prev + text);
        }
      },
    });

    return () => {
      gemini.disconnect();
    };
  }, []);

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

  // Connect to Gemini
  const connectToGemini = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      openModal('settings');
      return false;
    }

    const success = await geminiRef.current.connect({ apiKey });
    return success;
  }, [openModal]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');

    // Check if connected, if not connect first
    if (!geminiRef.current.isConnected()) {
      setAiState('thinking');
      const connected = await connectToGemini();
      if (!connected) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Gemini에 연결할 수 없어요. API 키를 확인해주세요.',
            timestamp: new Date(),
          },
        ]);
        setAiState('idle');
        return;
      }
    }

    setAiState('thinking');
    geminiRef.current.sendText(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      recorderRef.current?.stop();
      setIsRecording(false);
      setAiState('idle');
    } else {
      // Check connection first
      if (!geminiRef.current.isConnected()) {
        const connected = await connectToGemini();
        if (!connected) {
          openModal('settings');
          return;
        }
      }

      // Start recording
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder({
          onDataAvailable: (audioData) => {
            geminiRef.current.sendAudio(audioData);
          },
          onStart: () => {
            setIsRecording(true);
            setAiState('listening');
          },
          onStop: () => {
            setIsRecording(false);
            setAiState('thinking');
          },
          onError: (error) => {
            console.error('[Chat] Recording error:', error);
            setIsRecording(false);
            setAiState('idle');
          },
        });
      }

      await recorderRef.current.start();
    }
  };

  // Connection indicator
  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-[var(--accent-green)]" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-[var(--accent-amber)] animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* AI Orb Header */}
      <div className="flex flex-col items-center py-6 relative">
        {/* Connection Status */}
        <div className="absolute top-2 right-0 flex items-center gap-2">
          {getConnectionIcon()}
          {!hasApiKey() && (
            <button
              onClick={() => openModal('settings')}
              className="text-xs text-[var(--accent-amber)] flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              API 키 설정
            </button>
          )}
        </div>

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
              placeholder={hasApiKey() ? '메시지를 입력하세요...' : 'API 키를 먼저 설정해주세요'}
              rows={1}
              disabled={!hasApiKey()}
              className={cn(
                'w-full px-4 py-3 rounded-2xl resize-none',
                'bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-[var(--accent-cyan)]',
                'focus:shadow-[0_0_10px_rgba(0,212,255,0.2)]',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Voice Button */}
          <button
            onClick={toggleRecording}
            disabled={!hasApiKey()}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              isRecording
                ? 'bg-[var(--accent-magenta)] text-white animate-pulse'
                : 'btn-neural-ghost text-[var(--text-muted)] hover:text-[var(--accent-cyan)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasApiKey()}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              input.trim() && hasApiKey()
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
            <span className="text-sm text-[var(--accent-cyan)]">녹음 중... 탭하여 중지</span>
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
    <div className={cn('flex animate-slide-up', isAI ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-[85%] px-4 py-3', isAI ? 'message-ai' : 'message-user')}>
        <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-[var(--accent-cyan)] animate-pulse" />
          )}
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
  const [heights, setHeights] = useState<number[]>(Array(12).fill(8));

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prev) => prev.map(() => Math.random() * 16 + 8));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1 h-6">
      {heights.map((height, i) => (
        <div
          key={i}
          className="waveform-bar w-1 transition-all duration-100"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

export default ChatPage;
