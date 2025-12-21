import { useState } from 'react';
import { Link, FileText, Lightbulb, Plus, X } from 'lucide-react';
import { Modal, Button, Input, Textarea, Badge } from '@/components/ui';
import { addContent } from '@/lib/db';
import { generateId, extractDomain } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContentType = 'url' | 'note' | 'thought';

export function AddContentModal({ isOpen, onClose }: AddContentModalProps) {
  const [type, setType] = useState<ContentType>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setType('url');
    setTitle('');
    setUrl('');
    setBody('');
    setTags([]);
    setTagInput('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (type === 'url' && !url.trim()) return;
    if ((type === 'note' || type === 'thought') && !body.trim()) return;

    setIsSubmitting(true);
    try {
      const content: Content = {
        id: generateId(),
        type: type === 'thought' ? 'thought' : type === 'url' ? 'article' : 'note',
        title: title.trim() || (type === 'url' ? extractDomain(url) : '무제'),
        url: type === 'url' ? url.trim() : undefined,
        source: type === 'url' ? extractDomain(url) : undefined,
        body: body.trim() || undefined,
        tags,
        status: 'queued',
        createdAt: new Date(),
      };

      await addContent(content);
      handleClose();
    } catch (error) {
      console.error('Failed to add content:', error);
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

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="콘텐츠 추가">
      <div className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-2">
          <TypeButton
            icon={Link}
            label="URL"
            active={type === 'url'}
            onClick={() => setType('url')}
          />
          <TypeButton
            icon={FileText}
            label="텍스트"
            active={type === 'note'}
            onClick={() => setType('note')}
          />
          <TypeButton
            icon={Lightbulb}
            label="생각"
            active={type === 'thought'}
            onClick={() => setType('thought')}
          />
        </div>

        {/* URL Input */}
        {type === 'url' && (
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            label="URL"
            autoFocus
          />
        )}

        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'thought' ? '생각의 제목 (선택)' : '제목'}
          label="제목"
          autoFocus={type !== 'url'}
        />

        {/* Body */}
        {(type === 'note' || type === 'thought') && (
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              type === 'thought'
                ? '떠오른 생각을 자유롭게 적어주세요...'
                : '내용을 입력하세요...'
            }
            label="내용"
            rows={4}
          />
        )}

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            태그
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 Enter"
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
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (type === 'url' && !url.trim()) ||
              ((type === 'note' || type === 'thought') && !body.trim())
            }
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            추가
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Type Button Component
interface TypeButtonProps {
  icon: typeof Link;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TypeButton({ icon: Icon, label, active, onClick }: TypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
        active
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5',
          active
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400'
        )}
      />
      <span
        className={cn(
          'text-xs font-medium',
          active
            ? 'text-indigo-700 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400'
        )}
      >
        {label}
      </span>
    </button>
  );
}
