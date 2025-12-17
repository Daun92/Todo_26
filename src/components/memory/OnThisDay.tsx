import { CalendarDays, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { OnThisDayData } from '@/types';

interface OnThisDayProps {
  data: OnThisDayData[];
  onViewMore?: (year: number) => void;
  className?: string;
}

export function OnThisDay({ data, onViewMore, className }: OnThisDayProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="w-4 h-4 text-primary-500" />
          이 날의 기억
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((yearData) => (
          <div
            key={yearData.year}
            className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {yearData.year}년
              </span>
              {onViewMore && (
                <button
                  onClick={() => onViewMore(yearData.year)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500 transition-colors"
                >
                  자세히
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {/* Highlights */}
              {yearData.highlights.length > 0 && (
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {yearData.highlights[0].title}
                    </p>
                    {yearData.highlights.length > 1 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        외 {yearData.highlights.length - 1}개의 하이라이트
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Habit completion */}
              {yearData.habitLog && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">✅</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    습관 {yearData.habitLog.completedCount}/{yearData.habitLog.totalCount} 완료
                  </p>
                </div>
              )}

              {/* Journals */}
              {yearData.journals.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-sm">📝</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {yearData.journals[0].content.slice(0, 60)}...
                  </p>
                </div>
              )}

              {/* Milestones */}
              {yearData.milestones.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-sm">🏁</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {yearData.milestones[0].goalTitle} - {yearData.milestones[0].milestoneTitle}
                  </p>
                </div>
              )}

              {/* Streak info */}
              {yearData.streakInfo?.wasStreakDay && yearData.streakInfo.streak > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔥</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {yearData.streakInfo.streak}일 연속 기록 중이었어요
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <EmptyState
            icon="📅"
            title="아직 기록이 없어요"
            description="내년 이맘때 추억을 볼 수 있도록 오늘을 기록해보세요"
          />
        )}
      </CardContent>
    </Card>
  );
}
