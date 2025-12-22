/**
 * @file ApiKeyModal.tsx
 * @description Gemini API Key 설정 모달
 *
 * @checkpoint CP-5.1
 * @created 2025-12-22
 */

import { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Modal, Button, Badge } from '@/components/ui';
import { saveApiKey, getApiKey, removeApiKey, hasApiKey } from '@/lib/gemini-live';
import { aiService } from '@/lib/ai-service';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      if (existingKey) {
        // Mask the existing key
        setApiKey('•'.repeat(20) + existingKey.slice(-4));
        setIsConfigured(true);
      } else {
        setApiKey('');
        setIsConfigured(false);
      }
      setTestResult(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    if (!apiKey || apiKey.startsWith('•')) {
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily save the key to test
      saveApiKey(apiKey);
      const success = await aiService.checkConnection();
      setTestResult(success ? 'success' : 'error');

      if (success) {
        setIsConfigured(true);
      } else {
        removeApiKey();
      }
    } catch {
      setTestResult('error');
      removeApiKey();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (apiKey && !apiKey.startsWith('•')) {
      saveApiKey(apiKey);
    }
    onClose();
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKey('');
    setIsConfigured(false);
    setTestResult(null);
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setTestResult(null);
    if (value.startsWith('•')) {
      // User is trying to edit masked key, clear it
      setApiKey('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>AI 설정</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">상태:</span>
          {isConfigured ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              연결됨
            </Badge>
          ) : (
            <Badge variant="secondary">설정 필요</Badge>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Mosaic의 AI 기능을 사용하려면 Gemini API 키가 필요합니다.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Google AI Studio에서 API 키 받기
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            API 키
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="API 키를 입력하세요"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            {testResult === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">연결 성공! AI 기능을 사용할 수 있습니다.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">연결 실패. API 키를 확인해주세요.</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={handleTestConnection}
            disabled={!apiKey || apiKey.startsWith('•') || isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                테스트 중...
              </>
            ) : (
              '연결 테스트'
            )}
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={!isConfigured}>
            저장
          </Button>
        </div>

        {/* Remove Key */}
        {isConfigured && (
          <button
            onClick={handleRemove}
            className="w-full text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            API 키 삭제
          </button>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          API 키는 브라우저의 로컬 스토리지에 저장되며, 서버로 전송되지 않습니다.
        </p>
      </div>
    </Modal>
  );
}
