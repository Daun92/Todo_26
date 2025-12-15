const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-haiku-latest';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  id: string;
  content: { type: string; text: string }[];
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface CallOptions {
  system?: string;
  messages?: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}

class ClaudeAPIError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ClaudeAPIError';
    this.status = status;
    this.code = code;
  }
}

export function getAPIKey(): string | null {
  return localStorage.getItem('claude-api-key');
}

export function setAPIKey(key: string): void {
  localStorage.setItem('claude-api-key', key);
}

export function removeAPIKey(): void {
  localStorage.removeItem('claude-api-key');
}

export function hasAPIKey(): boolean {
  const key = getAPIKey();
  return !!key && key.startsWith('sk-ant-');
}

export async function callClaude(
  prompt: string,
  options: CallOptions = {}
): Promise<string> {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new ClaudeAPIError('API 키가 설정되지 않았습니다.', 401, 'NO_API_KEY');
  }

  const {
    system,
    messages = [],
    maxTokens = 1024,
    temperature = 0.7,
  } = options;

  const requestMessages: ClaudeMessage[] =
    messages.length > 0
      ? messages
      : [{ role: 'user', content: prompt }];

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: maxTokens,
        temperature,
        system: system || undefined,
        messages: requestMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ClaudeAPIError(
        errorData.error?.message || `API 요청 실패: ${response.status}`,
        response.status,
        errorData.error?.type
      );
    }

    const data: ClaudeResponse = await response.json();
    return data.content[0]?.text || '';
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      throw error;
    }
    throw new ClaudeAPIError(
      error instanceof Error ? error.message : 'API 호출 중 오류가 발생했습니다.',
      500,
      'NETWORK_ERROR'
    );
  }
}

export async function callClaudeJSON<T>(
  prompt: string,
  options: CallOptions = {}
): Promise<T> {
  const systemWithJSON = `${options.system || ''}

중요: 반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.`;

  const response = await callClaude(prompt, {
    ...options,
    system: systemWithJSON,
  });

  try {
    // JSON 부분만 추출 (마크다운 코드블록 처리)
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    return JSON.parse(jsonStr.trim());
  } catch {
    throw new ClaudeAPIError('AI 응답을 파싱할 수 없습니다.', 500, 'PARSE_ERROR');
  }
}

export async function testAPIKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
