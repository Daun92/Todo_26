import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, Trash2, Database } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { DataManagement } from '@/components/settings';
import { saveApiKey, getApiKey, removeApiKey, hasApiKey } from '@/lib/gemini-live';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKey();
      setHasKey(!!existingKey);
      if (existingKey) {
        setApiKey(existingKey);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKey('');
    setHasKey(false);
  };

  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정">
      <div className="space-y-6">
        {/* API Key Section */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--accent-cyan)]" />
            Gemini API 설정
          </h3>

          <div className="space-y-4">
            {/* Status */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl',
                hasKey
                  ? 'bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)]'
                  : 'bg-[rgba(255,170,0,0.1)] border border-[rgba(255,170,0,0.3)]'
              )}
            >
              {hasKey ? (
                <>
                  <Check className="w-5 h-5 text-[var(--accent-green)]" />
                  <span className="text-[var(--accent-green)] text-sm">
                    API 키가 설정되어 있습니다
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-[var(--accent-amber)]" />
                  <span className="text-[var(--accent-amber)] text-sm">
                    API 키를 설정해주세요
                  </span>
                </>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">
                Google AI API Key
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)]',
                      'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                      'focus:outline-none focus:border-[var(--accent-cyan)]',
                      'focus:shadow-[0_0_10px_rgba(0,212,255,0.2)]',
                      'font-mono text-sm'
                    )}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs"
                  >
                    {showKey ? '숨기기' : '보기'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-cyan)] hover:underline"
                >
                  Google AI Studio
                </a>
                에서 API 키를 발급받을 수 있습니다.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className={cn(
                  'flex-1',
                  saved && 'bg-[var(--accent-green)]'
                )}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    저장됨
                  </>
                ) : (
                  '저장'
                )}
              </Button>
              {hasKey && (
                <Button
                  variant="ghost"
                  onClick={handleRemove}
                  className="text-[var(--accent-magenta)]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.1)]" />

        {/* Voice Settings */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            음성 설정
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[var(--text-secondary)] block mb-2">
                AI 음성
              </label>
              <select
                className={cn(
                  'w-full px-4 py-3 rounded-xl appearance-none',
                  'bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)]',
                  'text-[var(--text-primary)]',
                  'focus:outline-none focus:border-[var(--accent-cyan)]'
                )}
                defaultValue="Aoede"
              >
                <option value="Aoede">Aoede (기본)</option>
                <option value="Charon">Charon</option>
                <option value="Fenrir">Fenrir</option>
                <option value="Kore">Kore</option>
                <option value="Puck">Puck</option>
              </select>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              * 음성 기능은 Gemini Live API 연결 시 활성화됩니다.
            </p>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--accent-magenta)]" />
            데이터 관리
          </h3>
          <DataManagement />
        </section>

        {/* About */}
        <section className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Mosaic v0.2.0 · AI Growth Partner
          </p>
        </section>
      </div>
    </Modal>
  );
}
