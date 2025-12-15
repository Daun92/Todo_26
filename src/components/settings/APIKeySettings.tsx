import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { getAPIKey, setAPIKey, removeAPIKey, testAPIKey, hasAPIKey } from '@/lib/claude';
import { cn } from '@/lib/utils';

export function APIKeySettings() {
  const [key, setKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setIsConfigured(hasAPIKey());
    const savedKey = getAPIKey();
    if (savedKey) {
      setKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    if (!key.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const isValid = await testAPIKey(key.trim());

    if (isValid) {
      setAPIKey(key.trim());
      setIsConfigured(true);
      setTestResult('success');
    } else {
      setTestResult('error');
    }

    setIsTesting(false);
  };

  const handleRemove = () => {
    removeAPIKey();
    setKey('');
    setIsConfigured(false);
    setTestResult(null);
  };

  const maskedKey = key ? `${key.slice(0, 10)}${'•'.repeat(20)}${key.slice(-4)}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="w-4 h-4" />
          Claude API 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          AI 기능을 사용하려면 Anthropic API 키가 필요합니다.
        </p>

        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          API 키 발급받기
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="space-y-2">
          <Input
            type={showKey ? 'text' : 'password'}
            placeholder="sk-ant-..."
            value={showKey ? key : (isConfigured ? maskedKey : key)}
            onChange={(e) => {
              setKey(e.target.value);
              setTestResult(null);
            }}
            disabled={isConfigured && !showKey}
          />

          <div className="flex items-center gap-2">
            {isConfigured ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? '숨기기' : '보기'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-600"
                >
                  삭제
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!key.trim() || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            )}
          </div>
        </div>

        {testResult && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              testResult === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
            )}
          >
            {testResult === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                API 키가 확인되었습니다.
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                유효하지 않은 API 키입니다.
              </>
            )}
          </div>
        )}

        {isConfigured && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            AI 기능이 활성화되었습니다.
          </div>
        )}

        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            API 키는 브라우저에 안전하게 저장되며 외부로 전송되지 않습니다.
            API 호출 비용은 Anthropic 계정에 청구됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
