import { Star, MoreVertical, Calendar, Tag } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Highlight } from '@/types';
import { EMOTION_CONFIG, HIGHLIGHT_TYPE_CONFIG } from '@/types/memory';

interface HighlightCardProps {
  highlight: Highlight;
  onStar?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function HighlightCard({ highlight, onStar, onEdit, onDelete, compact = false }: HighlightCardProps) {
  const typeConfig = HIGHLIGHT_TYPE_CONFIG[highlight.type];
  const emotionConfig = highlight.emotion ? EMOTION_CONFIG[highlight.emotion] : null;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50',
          'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
        )}
      >
        <span className="text-xl flex-shrink-0">{typeConfig.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {highlight.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {format(new Date(highlight.date), 'M월 d일', { locale: ko })}
          </p>
        </div>
        {highlight.starred && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeConfig.icon}</span>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              typeConfig.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              typeConfig.color === 'emerald' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              typeConfig.color === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            )}
          >
            {typeConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onStar && (
            <button
              onClick={onStar}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Star
                className={cn(
                  'w-4 h-4',
                  highlight.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                )}
              />
            </button>
          )}
          {(onEdit || onDelete) && (
            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          {highlight.title}
        </h3>
        {highlight.content && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
            {highlight.content}
          </p>
        )}

        {/* Emotion */}
        {emotionConfig && (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-medium',
              emotionConfig.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              emotionConfig.color === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              emotionConfig.color === 'emerald' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              emotionConfig.color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              emotionConfig.color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            )}
          >
            <span>{emotionConfig.emoji}</span>
            <span>{emotionConfig.label}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(highlight.date), 'yyyy년 M월 d일', { locale: ko })}</span>
          </div>
          {highlight.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Tag className="w-3.5 h-3.5" />
              <span>{highlight.tags.slice(0, 2).join(', ')}</span>
              {highlight.tags.length > 2 && <span>+{highlight.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
