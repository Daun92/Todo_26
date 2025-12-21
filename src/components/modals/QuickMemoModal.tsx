import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Modal, Button, Textarea, Badge } from '@/components/ui';
import { addMemo } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickMemoModal({ isOpen, onClose }: QuickMemoModalProps) {
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addMemo({
        id: generateId(),
        text: text.trim(),
        tags,
        organized: false,
        createdAt: new Date(),
      });
      setText('');
      setTags([]);
      onClose();
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="빠른 메모">
      <div className="space-y-4">
        {/* Text Input */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="떠오르는 생각을 자유롭게 기록하세요..."
          rows={4}
          autoFocus
        />

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 추가 (Enter)"
              className={cn(
                'flex-1 px-3 py-1.5 text-sm rounded-lg border',
                'bg-white dark:bg-slate-800',
                'border-slate-300 dark:border-slate-600',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500'
              )}
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              추가
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="primary" className="gap-1 pr-1">
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
}
