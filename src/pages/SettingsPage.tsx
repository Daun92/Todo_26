import { Settings, Moon, Sun, RotateCcw, Database, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { APIKeySettings } from '@/components/settings';
import { useStore } from '@/stores/useStore';
import { db } from '@/lib/db';

export function SettingsPage() {
  const { darkMode, toggleDarkMode, resetOnboarding, diagnosticResults } = useStore();

  const handleResetData = async () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleRetakeDiagnostic = () => {
    if (confirm('진단을 다시 받으시겠습니까?')) {
      resetOnboarding();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">설정</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">앱 설정 및 데이터 관리</p>
        </div>
      </div>

      {/* AI Settings */}
      <APIKeySettings />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            화면 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">다크 모드</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">어두운 테마 사용</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-4 h-4" />
              진단 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnosticResults.map((result) => (
              <div
                key={result.category}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <span className="font-medium">{result.category}</span>
                <div className="text-right">
                  <span className="text-lg font-bold">Lv.{result.level}</span>
                  <span className="text-sm text-slate-500 ml-2">
                    ({Math.round(result.totalScore)}점)
                  </span>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetakeDiagnostic}
              className="w-full mt-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              진단 다시 받기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="w-4 h-4" />
            데이터 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            모든 데이터는 브라우저에 로컬 저장되며 외부로 전송되지 않습니다.
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              데이터 내보내기 (JSON)
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              데이터 가져오기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetData}
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              모든 데이터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4" />
            앱 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">버전</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">빌드</span>
              <span>2026.01</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
