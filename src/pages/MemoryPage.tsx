import { useState } from 'react';
import { Plus, Sparkles, Lock, Clock, Star, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, DatePicker } from '@/components/ui';
import { HighlightCard, OnThisDay, TimeCapsuleCard, AddHighlightModal } from '@/components/memory';
import { useHighlights, useTimeCapsules, useOnThisDay } from '@/hooks';
import { cn } from '@/lib/utils';
import { getToday } from '@/lib/utils';
import type { HighlightType, EmotionType } from '@/types';

type TabType = 'highlights' | 'timecapsule' | 'onthisday';

export function MemoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('highlights');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { highlights, loading: highlightsLoading, addHighlight, toggleStar } = useHighlights();
  const { openableCapsules, pendingCapsules, openedCapsules, loading: capsulesLoading, openCapsule } = useTimeCapsules();
  const { data: onThisDayData, loading: onThisDayLoading } = useOnThisDay();

  const tabs = [
    { id: 'highlights' as const, label: '하이라이트', icon: Sparkles, count: highlights.length },
    { id: 'timecapsule' as const, label: '타임캡슐', icon: Lock, count: openableCapsules.length || undefined },
    { id: 'onthisday' as const, label: '이 날', icon: Clock, count: onThisDayData.length || undefined },
  ];

  const handleAddHighlight = async (data: {
    type: HighlightType;
    title: string;
    content?: string;
    emotion?: EmotionType;
    tags: string[];
  }) => {
    await addHighlight({
      ...data,
      date: selectedDate.toISOString().split('T')[0],
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">기억</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            소중한 순간들을 기록하고 돌아보세요
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          기록
        </Button>
      </div>

      {/* Date Picker (for context) */}
      <div className="flex items-center justify-between">
        <DatePicker value={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    'text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'highlights' && (
        <HighlightsTab
          highlights={highlights}
          loading={highlightsLoading}
          onToggleStar={toggleStar}
          onAddNew={() => setIsAddModalOpen(true)}
        />
      )}

      {activeTab === 'timecapsule' && (
        <TimeCapsuleTab
          openable={openableCapsules}
          pending={pendingCapsules}
          opened={openedCapsules}
          loading={capsulesLoading}
          onOpen={openCapsule}
        />
      )}

      {activeTab === 'onthisday' && (
        <OnThisDayTab
          data={onThisDayData}
          loading={onThisDayLoading}
        />
      )}

      {/* Add Highlight Modal */}
      <AddHighlightModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddHighlight}
        date={selectedDate.toISOString().split('T')[0]}
      />
    </div>
  );
}

// Sub-components for tabs

interface HighlightsTabProps {
  highlights: ReturnType<typeof useHighlights>['highlights'];
  loading: boolean;
  onToggleStar: (id: string) => void;
  onAddNew: () => void;
}

function HighlightsTab({ highlights, loading, onToggleStar, onAddNew }: HighlightsTabProps) {
  const starredHighlights = highlights.filter((h) => h.starred);
  const recentHighlights = highlights.filter((h) => !h.starred).slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="아직 하이라이트가 없어요"
          description="특별한 순간, 성장의 마일스톤, 소중한 기억을 기록해보세요"
          action={
            <Button variant="primary" onClick={onAddNew}>
              첫 하이라이트 추가
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Starred Highlights */}
      {starredHighlights.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            중요 하이라이트
          </h3>
          <div className="space-y-3">
            {starredHighlights.map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                onStar={() => onToggleStar(highlight.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Highlights */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          최근 하이라이트
        </h3>
        <div className="space-y-3">
          {recentHighlights.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              onStar={() => onToggleStar(highlight.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface TimeCapsuleTabProps {
  openable: ReturnType<typeof useTimeCapsules>['openableCapsules'];
  pending: ReturnType<typeof useTimeCapsules>['pendingCapsules'];
  opened: ReturnType<typeof useTimeCapsules>['openedCapsules'];
  loading: boolean;
  onOpen: (id: string) => void;
}

function TimeCapsuleTab({ openable, pending, opened, loading, onOpen }: TimeCapsuleTabProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const hasAnyCapsules = openable.length > 0 || pending.length > 0 || opened.length > 0;

  if (!hasAnyCapsules) {
    return (
      <Card>
        <EmptyState
          icon={<Lock className="w-8 h-8" />}
          title="타임캡슐이 없어요"
          description="미래의 나에게 보내는 편지를 작성해보세요"
          action={
            <Button variant="primary">
              타임캡슐 만들기
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Openable */}
      {openable.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3">
            <Lock className="w-4 h-4" />
            열 수 있어요! ({openable.length})
          </h3>
          <div className="space-y-3">
            {openable.map((capsule) => (
              <TimeCapsuleCard
                key={capsule.id}
                capsule={capsule}
                onOpen={() => onOpen(capsule.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            기다리는 중 ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((capsule) => (
              <TimeCapsuleCard key={capsule.id} capsule={capsule} compact />
            ))}
          </div>
        </section>
      )}

      {/* Opened */}
      {opened.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            개봉한 캡슐 ({opened.length})
          </h3>
          <div className="space-y-3">
            {opened.slice(0, 5).map((capsule) => (
              <TimeCapsuleCard key={capsule.id} capsule={capsule} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface OnThisDayTabProps {
  data: ReturnType<typeof useOnThisDay>['data'];
  loading: boolean;
}

function OnThisDayTab({ data, loading }: OnThisDayTabProps) {
  if (loading) {
    return (
      <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="이 날의 기록이 없어요"
          description="1년 후, 오늘을 돌아볼 수 있도록 기록을 시작해보세요"
          action={
            <p className="text-xs text-slate-400">
              앱을 사용할수록 추억이 쌓여요
            </p>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-none">
        <CardContent className="py-4">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-primary-600 dark:text-primary-400">{data.length}년</span>의 기록이 있어요
          </p>
        </CardContent>
      </Card>

      <OnThisDay data={data} />
    </div>
  );
}
