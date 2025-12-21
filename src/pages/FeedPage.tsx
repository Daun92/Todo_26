import { useState } from 'react';
import { Plus, Compass, Link, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Badge } from '@/components/ui';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function FeedPage() {
  const { openModal } = useStore();
  const [filter, setFilter] = useState<'all' | 'queued' | 'recommended'>('all');

  // TODO: Replace with real data from hooks
  const contents: unknown[] = [];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Feed
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            오늘 뭘 배워볼까요?
          </p>
        </div>
        <Button
          onClick={() => openModal('addContent')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction
          icon={Link}
          label="URL 추가"
          onClick={() => openModal('addContent', { type: 'url' })}
        />
        <QuickAction
          icon={FileText}
          label="텍스트 추가"
          onClick={() => openModal('addContent', { type: 'note' })}
        />
        <QuickAction
          icon={Lightbulb}
          label="생각 기록"
          onClick={() => openModal('addContent', { type: 'thought' })}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          전체
        </FilterButton>
        <FilterButton
          active={filter === 'queued'}
          onClick={() => setFilter('queued')}
        >
          학습 대기
        </FilterButton>
        <FilterButton
          active={filter === 'recommended'}
          onClick={() => setFilter('recommended')}
        >
          AI 추천
        </FilterButton>
      </div>

      {/* Content List */}
      {contents.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="아직 콘텐츠가 없어요"
          description="학습할 콘텐츠를 추가하거나 AI 추천을 받아보세요"
          action={
            <Button onClick={() => openModal('addContent')}>
              첫 콘텐츠 추가하기
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {/* Content cards will be rendered here */}
        </div>
      )}

      {/* AI Partner Suggestion */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              AI 파트너 제안
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              관심사를 알려주시면 맞춤 학습 자료를 추천해드릴게요.
              어떤 분야에 관심이 있으신가요?
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-indigo-600 dark:text-indigo-400"
              onClick={() => openModal('setupInterests')}
            >
              관심사 설정하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Action Component
interface QuickActionProps {
  icon: typeof Link;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl',
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        'hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm',
        'transition-all'
      )}
    >
      <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
    </button>
  );
}

// Filter Button Component
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      )}
    >
      {children}
    </button>
  );
}
