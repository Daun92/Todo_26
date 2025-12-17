import { useState } from 'react';
import { Lock, Unlock, Calendar, Clock } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { TimeCapsule } from '@/types';

interface TimeCapsuleCardProps {
  capsule: TimeCapsule;
  onOpen?: () => void;
  onWriteResponse?: () => void;
  compact?: boolean;
}

export function TimeCapsuleCard({ capsule, onOpen, onWriteResponse, compact = false }: TimeCapsuleCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const openDate = new Date(capsule.openDate);
  const isOpenable = isPast(openDate) || isToday(openDate);
  const daysUntilOpen = differenceInDays(openDate, new Date());
  const canOpen = isOpenable && !capsule.isOpened;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          capsule.isOpened
            ? 'bg-emerald-50 dark:bg-emerald-900/20'
            : isOpenable
              ? 'bg-amber-50 dark:bg-amber-900/20 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800/50'
        )}
      >
        {capsule.isOpened ? (
          <Unlock className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        ) : (
          <Lock className={cn(
            'w-5 h-5 flex-shrink-0',
            isOpenable ? 'text-amber-500' : 'text-slate-400'
          )} />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {capsule.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {capsule.isOpened
              ? `${format(new Date(capsule.openedAt!), 'M월 d일', { locale: ko })} 개봉`
              : isOpenable
                ? '열 수 있어요!'
                : `D-${daysUntilOpen}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'overflow-hidden',
      !capsule.isOpened && isOpenable && 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-950'
    )}>
      {/* Header */}
      <div className={cn(
        'px-4 py-3 flex items-center justify-between',
        capsule.isOpened
          ? 'bg-emerald-50 dark:bg-emerald-900/20'
          : isOpenable
            ? 'bg-amber-50 dark:bg-amber-900/20'
            : 'bg-slate-50 dark:bg-slate-800/50'
      )}>
        <div className="flex items-center gap-2">
          {capsule.isOpened ? (
            <Unlock className="w-5 h-5 text-emerald-500" />
          ) : (
            <Lock className={cn(
              'w-5 h-5',
              isOpenable ? 'text-amber-500' : 'text-slate-400'
            )} />
          )}
          <span className={cn(
            'text-sm font-medium',
            capsule.isOpened
              ? 'text-emerald-700 dark:text-emerald-400'
              : isOpenable
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400'
          )}>
            {capsule.isOpened
              ? '개봉됨'
              : isOpenable
                ? '열 수 있어요!'
                : `D-${daysUntilOpen}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(openDate, 'yyyy.M.d', { locale: ko })} 개봉 예정</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {capsule.title}
        </h3>

        {capsule.isOpened || isRevealed ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {capsule.content}
              </p>
            </div>

            {capsule.response && (
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                  나의 답장 - {format(new Date(capsule.response.writtenAt), 'yyyy.M.d', { locale: ko })}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {capsule.response.content}
                </p>
              </div>
            )}

            {capsule.isOpened && !capsule.response && onWriteResponse && (
              <Button
                variant="outline"
                size="sm"
                onClick={onWriteResponse}
                className="w-full"
              >
                답장 쓰기
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isOpenable
                ? '타임캡슐을 열어보세요!'
                : '이 타임캡슐은 아직 열 수 없어요.'}
            </p>
            {canOpen && onOpen && (
              <Button
                variant="primary"
                onClick={onOpen}
                className="w-full"
              >
                타임캡슐 열기
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>작성: {format(new Date(capsule.createdAt), 'yyyy년 M월 d일', { locale: ko })}</span>
        </div>
      </div>
    </Card>
  );
}
