/**
 * @file DataManagement.tsx
 * @description 데이터 관리 UI - 내보내기/가져오기/삭제
 */

import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileJson,
  Trash2,
  HardDrive,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import {
  downloadJSON,
  downloadMarkdown,
  importFromFile,
  getStorageInfo,
  clearAllData,
  type StorageInfo,
  type ImportResult,
} from '@/lib/data-export';
import { cn } from '@/lib/utils';

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load storage info on mount
  useState(() => {
    getStorageInfo().then(setStorageInfo);
  });

  // Handle JSON export
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await downloadJSON();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Markdown export
  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      await downloadMarkdown();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importFromFile(file);
      setImportResult(result);
      // Refresh storage info after import
      getStorageInfo().then(setStorageInfo);
    } catch (error) {
      setImportResult({
        success: false,
        imported: {
          contents: 0,
          interviews: 0,
          memos: 0,
          connections: 0,
          tags: 0,
          reflections: 0,
        },
        errors: [(error as Error).message],
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle clear all data
  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      setShowClearConfirm(false);
      // Refresh storage info
      getStorageInfo().then(setStorageInfo);
    } catch (error) {
      console.error('Clear failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      {storageInfo && (
        <section>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            저장 공간
          </h3>
          <div
            className={cn(
              'p-4 rounded-xl',
              'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-primary)]">
                {storageInfo.usedFormatted} 사용 중
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                / {storageInfo.quotaFormatted}
              </span>
            </div>
            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  storageInfo.percentUsed > 80
                    ? 'bg-[var(--accent-amber)]'
                    : 'bg-[var(--accent-cyan)]'
                )}
                style={{ width: `${storageInfo.percentUsed}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {storageInfo.percentUsed}% 사용
            </p>
          </div>
        </section>
      )}

      {/* Export Section */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" />
          데이터 내보내기
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex-col h-auto py-4 gap-2"
          >
            <FileJson className="w-6 h-6 text-[var(--accent-cyan)]" />
            <span className="text-sm">JSON 백업</span>
            <span className="text-xs text-[var(--text-muted)]">
              전체 데이터
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportMarkdown}
            disabled={isExporting}
            className="flex-col h-auto py-4 gap-2"
          >
            <FileText className="w-6 h-6 text-[var(--accent-green)]" />
            <span className="text-sm">Markdown</span>
            <span className="text-xs text-[var(--text-muted)]">
              읽기 전용
            </span>
          </Button>
        </div>
      </section>

      {/* Import Section */}
      <section>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          데이터 가져오기
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full justify-center gap-2"
        >
          {isImporting ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
              가져오는 중...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              JSON 파일 선택
            </>
          )}
        </Button>

        {/* Import Result */}
        {importResult && (
          <div
            className={cn(
              'mt-3 p-3 rounded-lg text-sm',
              importResult.success
                ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30'
                : 'bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/30'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {importResult.success ? (
                <Check className="w-4 h-4 text-[var(--accent-green)]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)]" />
              )}
              <span
                className={
                  importResult.success
                    ? 'text-[var(--accent-green)]'
                    : 'text-[var(--accent-amber)]'
                }
              >
                {importResult.success ? '가져오기 완료' : '일부 오류 발생'}
              </span>
            </div>
            <div className="text-[var(--text-secondary)] space-y-1">
              <p>콘텐츠: {importResult.imported.contents}개</p>
              <p>메모: {importResult.imported.memos}개</p>
              <p>연결: {importResult.imported.connections}개</p>
              <p>태그: {importResult.imported.tags}개</p>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-[var(--accent-amber)]">
                {importResult.errors.slice(0, 3).map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
                {importResult.errors.length > 3 && (
                  <p>...외 {importResult.errors.length - 3}개 오류</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="text-sm font-medium text-[var(--accent-magenta)] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          위험 영역
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowClearConfirm(true)}
          className="w-full justify-center gap-2 border-[var(--accent-magenta)]/30 text-[var(--accent-magenta)] hover:bg-[var(--accent-magenta)]/10"
        >
          <Trash2 className="w-4 h-4" />
          모든 데이터 삭제
        </Button>
      </section>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={
          <div className="flex items-center gap-2 text-[var(--accent-magenta)]">
            <AlertTriangle className="w-5 h-5" />
            데이터 삭제 확인
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            정말로 모든 데이터를 삭제하시겠습니까?
          </p>
          <p className="text-sm text-[var(--accent-magenta)]">
            이 작업은 되돌릴 수 없습니다. 모든 학습 기록, 메모, 연결, 회고가
            삭제됩니다.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            삭제 전에 백업을 권장합니다.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
            <Button
              onClick={handleClearData}
              disabled={isClearing}
              className="flex-1 bg-[var(--accent-magenta)] hover:bg-[var(--accent-magenta)]/90"
            >
              {isClearing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
