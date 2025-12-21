import { GitBranch, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, EmptyState, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ConnectPage() {
  // TODO: Replace with real data from hooks
  const connections: unknown[] = [];
  const patterns: unknown[] = [];
  const tags: unknown[] = [];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Connect
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          점들을 연결하고 패턴을 발견해요
        </p>
      </div>

      {/* Knowledge Graph Preview */}
      <Card>
        <CardContent className="py-8">
          {connections.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="아직 연결이 없어요"
              description="학습을 진행하면 지식 간의 연결이 자동으로 발견됩니다"
            />
          ) : (
            <div className="h-64 flex items-center justify-center">
              {/* Knowledge Graph will be rendered here with D3.js */}
              <p className="text-slate-500">지식 그래프 시각화 영역</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovered Patterns */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            발견된 패턴
          </h2>
        </div>

        {patterns.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                AI가 학습 패턴을 분석하고 있어요...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Pattern cards will be rendered here */}
          </div>
        )}
      </section>

      {/* Tags Overview */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            태그 클라우드
          </h2>
        </div>

        <Card>
          <CardContent>
            {tags.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                학습 내용에 태그를 추가해보세요
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* Tag badges will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Cross-insights */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            크로스 인사이트
          </h2>
        </div>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent>
            <p className="text-sm text-green-700 dark:text-green-300">
              다양한 분야를 학습하면 AI가 예상치 못한 연결점을 발견해드려요.
              서로 다른 주제들이 어떻게 연결되는지 확인해보세요.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
