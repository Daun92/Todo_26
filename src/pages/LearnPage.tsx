import { BookOpen, MessageCircle, StickyNote, FolderOpen } from 'lucide-react';
import { Card, CardContent, Button, EmptyState } from '@/components/ui';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function LearnPage() {
  const { openModal } = useStore();

  // TODO: Replace with real data from hooks
  const activeSessions: unknown[] = [];
  const recentMemos: unknown[] = [];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Learn
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          배움을 내 것으로 만들어요
        </p>
      </div>

      {/* Learning Modes */}
      <div className="grid grid-cols-2 gap-3">
        <ModeCard
          icon={MessageCircle}
          title="인터뷰 모드"
          description="AI와 대화하며 학습"
          color="indigo"
          onClick={() => openModal('startInterview')}
        />
        <ModeCard
          icon={StickyNote}
          title="메모 모드"
          description="자유롭게 생각 기록"
          color="amber"
          onClick={() => openModal('quickMemo')}
        />
      </div>

      {/* Active Learning */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            진행 중인 학습
          </h2>
        </div>

        {activeSessions.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={BookOpen}
                title="진행 중인 학습이 없어요"
                description="Feed에서 콘텐츠를 선택해 학습을 시작하세요"
                className="py-8"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Active session cards will be rendered here */}
          </div>
        )}
      </section>

      {/* Recent Memos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            최근 메모
          </h2>
          <Button variant="ghost" size="sm" onClick={() => openModal('allMemos')}>
            전체 보기
          </Button>
        </div>

        {recentMemos.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={StickyNote}
                title="아직 메모가 없어요"
                description="떠오르는 생각을 자유롭게 기록해보세요"
                className="py-8"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('quickMemo')}
                  >
                    첫 메모 작성하기
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Memo cards will be rendered here */}
          </div>
        )}
      </section>

      {/* Organize Prompt */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              메모 정리 시간
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              쌓인 메모들을 AI와 함께 정리하면서
              새로운 인사이트를 발견해보세요.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-amber-600 dark:text-amber-400"
              onClick={() => openModal('organizeMemos')}
            >
              메모 정리하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mode Card Component
interface ModeCardProps {
  icon: typeof BookOpen;
  title: string;
  description: string;
  color: 'indigo' | 'amber';
  onClick: () => void;
}

function ModeCard({ icon: Icon, title, description, color, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 p-4 rounded-xl text-left',
        'border transition-all',
        color === 'indigo' && [
          'bg-indigo-50 dark:bg-indigo-900/20',
          'border-indigo-200 dark:border-indigo-800',
          'hover:border-indigo-400 dark:hover:border-indigo-600',
        ],
        color === 'amber' && [
          'bg-amber-50 dark:bg-amber-900/20',
          'border-amber-200 dark:border-amber-800',
          'hover:border-amber-400 dark:hover:border-amber-600',
        ]
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-900/50',
          color === 'amber' && 'bg-amber-100 dark:bg-amber-900/50'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5',
            color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
            color === 'amber' && 'text-amber-600 dark:text-amber-400'
          )}
        />
      </div>
      <div>
        <p
          className={cn(
            'font-medium',
            color === 'indigo' && 'text-indigo-900 dark:text-indigo-100',
            color === 'amber' && 'text-amber-900 dark:text-amber-100'
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-xs mt-0.5',
            color === 'indigo' && 'text-indigo-600 dark:text-indigo-300',
            color === 'amber' && 'text-amber-600 dark:text-amber-300'
          )}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
