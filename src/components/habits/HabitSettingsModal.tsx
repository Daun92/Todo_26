import { useState } from 'react';
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { useHabits } from '@/hooks';
import { cn } from '@/lib/utils';
import { HabitForm } from './HabitForm';
import type { HabitDefinition } from '@/types';

interface HabitSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HabitSettingsModal({ isOpen, onClose }: HabitSettingsModalProps) {
  const { allHabits, updateHabit, deleteHabit, reorderHabits } = useHabits();
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (habitId: string) => {
    setDraggedId(habitId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const oldIndex = allHabits.findIndex(h => h.id === draggedId);
    const newIndex = allHabits.findIndex(h => h.id === targetId);

    if (oldIndex !== newIndex) {
      const newOrder = [...allHabits];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      reorderHabits(newOrder.map(h => h.id));
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleToggleActive = async (habit: HabitDefinition) => {
    await updateHabit(habit.id, { active: !habit.active });
  };

  const handleDelete = async (habitId: string) => {
    if (confirm('이 습관을 삭제할까요?')) {
      await deleteHabit(habitId);
    }
  };

  if (showAddForm || editingHabit) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setShowAddForm(false);
          setEditingHabit(null);
        }}
        title={editingHabit ? '습관 수정' : '새 습관 추가'}
      >
        <HabitForm
          habit={editingHabit || undefined}
          onComplete={() => {
            setShowAddForm(false);
            setEditingHabit(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingHabit(null);
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="습관 관리">
      <div className="space-y-4">
        {/* Add button */}
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 습관 추가
        </Button>

        {/* Habit list */}
        <div className="space-y-2">
          {allHabits.map((habit) => (
            <div
              key={habit.id}
              draggable
              onDragStart={() => handleDragStart(habit.id)}
              onDragOver={(e) => handleDragOver(e, habit.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                habit.active
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60',
                draggedId === habit.id && 'opacity-50 scale-95'
              )}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-slate-400">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon */}
              <span className="text-xl">{habit.icon}</span>

              {/* Name & Description */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm',
                  habit.active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                )}>
                  {habit.name}
                </p>
                {habit.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(habit)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    habit.active
                      ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  title={habit.active ? '비활성화' : '활성화'}
                >
                  {habit.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingHabit(habit)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  title="수정"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {allHabits.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>등록된 습관이 없어요</p>
            <p className="text-sm mt-1">새 습관을 추가해보세요!</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
