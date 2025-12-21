// ============================================
// Gemini Live API Service
// WebSocket-based real-time conversation
// ============================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  voice?: string;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiLiveCallbacks {
  onConnectionChange?: (state: ConnectionState) => void;
  onMessage?: (text: string, isFinal: boolean) => void;
  onAudio?: (audioData: ArrayBuffer) => void;
  onError?: (error: Error) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
}

const WEBSOCKET_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const DEFAULT_SYSTEM_INSTRUCTION = `당신은 Mosaic라는 AI 성장 파트너입니다.

핵심 역할:
- 사용자의 학습과 성장을 돕는 파트너
- 넓고 다양한 분야의 지식을 연결하는 조력자
- 사용자의 편향을 인식하고 대척점(반대 관점)을 제시하는 균형 잡힌 사고 촉진자

대화 스타일:
- 따뜻하고 친근하게 대화하세요
- 호기심을 자극하는 질문을 던지세요
- 사용자의 생각을 확장시키는 관점을 제시하세요
- 한국어로 자연스럽게 대화하세요

중요 원칙:
1. 사용자가 배운 내용에서 연결고리를 찾아주세요
2. 한쪽 관점만 강조하지 말고 대척점도 함께 제시하세요
3. 작은 성장과 발견을 격려하고 축하해주세요`;

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private config: GeminiConfig | null = null;
  private callbacks: GeminiLiveCallbacks = {};
  private connectionState: ConnectionState = 'disconnected';
  private messageQueue: string[] = [];
  private isSetupComplete = false;

  constructor(callbacks?: GeminiLiveCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  setCallbacks(callbacks: GeminiLiveCallbacks) {
    this.callbacks = callbacks;
  }

  private updateConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.callbacks.onConnectionChange?.(state);
  }

  async connect(config: GeminiConfig): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }

    this.config = config;
    this.updateConnectionState('connecting');

    return new Promise((resolve) => {
      try {
        const url = `${WEBSOCKET_URL}?key=${config.apiKey}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('[Gemini] WebSocket connected');
          this.sendSetup();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
          if (this.isSetupComplete && this.connectionState === 'connecting') {
            this.updateConnectionState('connected');
            resolve(true);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Gemini] WebSocket error:', error);
          this.updateConnectionState('error');
          this.callbacks.onError?.(new Error('WebSocket connection failed'));
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[Gemini] WebSocket closed');
          this.updateConnectionState('disconnected');
          this.isSetupComplete = false;
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.disconnect();
            this.callbacks.onError?.(new Error('Connection timeout'));
            resolve(false);
          }
        }, 10000);
      } catch (error) {
        console.error('[Gemini] Connection error:', error);
        this.updateConnectionState('error');
        resolve(false);
      }
    });
  }

  private sendSetup() {
    if (!this.ws || !this.config) return;

    const setupMessage = {
      setup: {
        model: this.config.model || 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['TEXT'], // Start with text only
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voice || 'Aoede',
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: this.config.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION }],
        },
      },
    };

    this.ws.send(JSON.stringify(setupMessage));
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);

      // Setup complete
      if (message.setupComplete) {
        console.log('[Gemini] Setup complete');
        this.isSetupComplete = true;
        this.flushMessageQueue();
        return;
      }

      // Server content (model response)
      if (message.serverContent) {
        const content = message.serverContent;

        // Check if model is still generating
        if (content.modelTurn?.parts) {
          for (const part of content.modelTurn.parts) {
            if (part.text) {
              this.callbacks.onMessage?.(part.text, content.turnComplete || false);
            }
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              const audioData = this.base64ToArrayBuffer(part.inlineData.data);
              this.callbacks.onAudio?.(audioData);
            }
          }
        }

        // Transcript (user speech recognized)
        if (content.inputTranscript) {
          this.callbacks.onTranscript?.(content.inputTranscript, true);
        }

        // Output transcript (model speech)
        if (content.outputTranscript) {
          this.callbacks.onTranscript?.(content.outputTranscript, false);
        }
      }

      // Tool calls (for future expansion)
      if (message.toolCall) {
        console.log('[Gemini] Tool call received:', message.toolCall);
      }
    } catch (error) {
      console.error('[Gemini] Failed to parse message:', error);
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendTextInternal(message);
      }
    }
  }

  sendText(text: string) {
    if (!this.isSetupComplete) {
      this.messageQueue.push(text);
      return;
    }
    this.sendTextInternal(text);
  }

  private sendTextInternal(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[Gemini] WebSocket not connected');
      return;
    }

    const message = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  sendAudio(audioData: ArrayBuffer, mimeType: string = 'audio/pcm;rate=16000') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[Gemini] WebSocket not connected');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);

    const message = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType,
            data: base64Audio,
          },
        ],
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isSetupComplete = false;
    this.messageQueue = [];
    this.updateConnectionState('disconnected');
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

// Singleton instance
let geminiInstance: GeminiLiveService | null = null;

export function getGeminiService(): GeminiLiveService {
  if (!geminiInstance) {
    geminiInstance = new GeminiLiveService();
  }
  return geminiInstance;
}

// API Key management
const API_KEY_STORAGE_KEY = 'mosaic-gemini-api-key';

export function saveApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}
