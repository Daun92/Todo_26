import { useState } from 'react';
import { Zap, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';
import { useHabits } from '@/hooks';
import { cn } from '@/lib/utils';

const MOOD_EMOJIS = [
  { value: 1, emoji: '😔', label: '힘들어요' },
  { value: 2, emoji: '😐', label: '그저 그래요' },
  { value: 3, emoji: '😊', label: '괜찮아요' },
  { value: 4, emoji: '😄', label: '좋아요' },
  { value: 5, emoji: '🤩', label: '최고예요' },
];

export function ConditionTracker() {
  const { todayLog, updateTodayCondition } = useHabits();
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(todayLog?.note || '');

  const currentEnergy = todayLog?.energy;
  const currentMood = todayLog?.mood;

  const handleEnergyChange = (value: number) => {
    updateTodayCondition({ energy: value });
  };

  const handleMoodChange = (value: number) => {
    updateTodayCondition({ mood: value });
  };

  const handleNoteBlur = () => {
    if (note !== todayLog?.note) {
      updateTodayCondition({ note });
    }
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center gap-2 text-base">
          <span>오늘 컨디션</span>
          {currentMood && (
            <span className="text-lg">{MOOD_EMOJIS.find(m => m.value === currentMood)?.emoji}</span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {currentEnergy && (
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: currentEnergy }).map((_, i) => (
                <Zap key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Energy */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              에너지
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleEnergyChange(value)}
                  className={cn(
                    'flex-1 py-2 rounded-xl transition-all duration-200 text-sm font-medium',
                    currentEnergy === value
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              <span>낮음</span>
              <span>높음</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              기분
            </label>
            <div className="flex gap-2">
              {MOOD_EMOJIS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => handleMoodChange(value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200',
                    currentMood === value
                      ? 'bg-gradient-to-br from-primary-400 to-accent-500 text-white shadow-lg shadow-primary-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                  title={label}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              오늘의 한마디 (선택)
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="오늘 하루는 어땠나요?"
              className="text-sm"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
