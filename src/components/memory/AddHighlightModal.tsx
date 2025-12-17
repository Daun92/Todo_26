import { useState } from 'react';
import { X, Sparkles, Trophy, Star } from 'lucide-react';
import { Modal, Button, Input, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { HighlightType, EmotionType } from '@/types';
import { EMOTION_CONFIG, HIGHLIGHT_TYPE_CONFIG } from '@/types/memory';

interface AddHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (highlight: {
    type: HighlightType;
    title: string;
    content?: string;
    emotion?: EmotionType;
    tags: string[];
  }) => void;
  date: string;
}

export function AddHighlightModal({ isOpen, onClose, onSave, date }: AddHighlightModalProps) {
  const [type, setType] = useState<HighlightType>('moment');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<EmotionType | undefined>();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type,
      title: title.trim(),
      content: content.trim() || undefined,
      emotion,
      tags,
    });
    handleClose();
  };

  const handleClose = () => {
    setType('moment');
    setTitle('');
    setContent('');
    setEmotion(undefined);
    setTags([]);
    setTagInput('');
    onClose();
  };

  const typeOptions: { value: HighlightType; icon: React.ReactNode; label: string }[] = [
    { value: 'moment', icon: <Sparkles className="w-4 h-4" />, label: '순간' },
    { value: 'milestone', icon: <Trophy className="w-4 h-4" />, label: '마일스톤' },
    { value: 'memory', icon: <Star className="w-4 h-4" />, label: '기억' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            하이라이트 추가
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              유형
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setType(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                    type === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <div className={cn(
                    'text-xl',
                    type === option.value ? 'text-primary-500' : 'text-slate-400'
                  )}>
                    {HIGHLIGHT_TYPE_CONFIG[option.value].icon}
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    type === option.value
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400'
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 특별한 순간인가요?"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="자세한 내용을 기록해보세요..."
              rows={3}
              className={cn(
                'w-full px-4 py-3 rounded-xl border transition-colors resize-none',
                'border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900',
                'text-slate-900 dark:text-white',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          </div>

          {/* Emotion */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              감정
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(EMOTION_CONFIG) as [EmotionType, typeof EMOTION_CONFIG[EmotionType]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setEmotion(emotion === key ? undefined : key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all',
                      emotion === key
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    )}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              태그
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그 입력"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleAddTag}>
                추가
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1"
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
}
