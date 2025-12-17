import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useHabits } from '@/hooks';
import { cn } from '@/lib/utils';
import type { HabitDefinition } from '@/types';

const EMOJI_OPTIONS = [
  '🚶', '🏃', '💪', '🧘', '📐', '🌬️', '💧', '🥗', '📚', '✍️',
  '🎯', '⏰', '🌙', '☀️', '🧠', '💊', '🦷', '🧹', '📱', '🎵',
];

interface HabitFormProps {
  habit?: HabitDefinition;
  onComplete: () => void;
  onCancel: () => void;
}

export function HabitForm({ habit, onComplete, onCancel }: HabitFormProps) {
  const { addHabit, updateHabit } = useHabits();
  const [name, setName] = useState(habit?.name || '');
  const [icon, setIcon] = useState(habit?.icon || '🎯');
  const [description, setDescription] = useState(habit?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (habit) {
        await updateHabit(habit.id, { name, icon, description });
      } else {
        await addHabit({ name, icon, description, active: true });
      }
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Icon selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          아이콘
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={cn(
                'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-200',
                icon === emoji
                  ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500 scale-110'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          습관 이름
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 걷기"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          설명 (선택)
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 하루 30분 이상 걷기"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || saving}
          className="flex-1"
        >
          {saving ? '저장 중...' : habit ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
