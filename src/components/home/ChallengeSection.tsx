import { useState } from 'react';
import { Check, ChevronRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, Textarea } from '@/components/ui';
import { useChallenges, useGoals } from '@/hooks';
import { cn } from '@/lib/utils';
import type { ChallengeTemplate, ChallengeFrequency } from '@/types';

interface ChallengeItemProps {
  template: ChallengeTemplate;
  completed: boolean;
  onComplete: () => void;
}

function ChallengeItem({ template, completed, onComplete }: ChallengeItemProps) {
  return (
    <button
      onClick={onComplete}
      disabled={completed}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        'border-2',
        completed
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-primary-200 dark:hover:border-primary-800'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg',
          completed
            ? 'bg-emerald-500 text-white'
            : 'bg-white dark:bg-slate-700 shadow-sm'
        )}
      >
        {completed ? <Check className="w-5 h-5" /> : template.icon}
      </div>
      <div className="flex-1 text-left">
        <p
          className={cn(
            'text-sm font-medium',
            completed && 'text-emerald-700 dark:text-emerald-300 line-through'
          )}
        >
          {template.title}
        </p>
        {template.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {template.description}
          </p>
        )}
      </div>
      {!completed && <ChevronRight className="w-4 h-4 text-slate-400" />}
    </button>
  );
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ChallengeTemplate | null;
  onSubmit: (data: {
    title: string;
    source: string;
    content: string;
    insights: string[];
    actionPlan: string;
  }) => void;
}

function CompletionModal({ isOpen, onClose, template, onSubmit }: CompletionModalProps) {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [insight, setInsight] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [actionPlan, setActionPlan] = useState('');

  const handleAddInsight = () => {
    if (insight.trim()) {
      setInsights([...insights, insight.trim()]);
      setInsight('');
    }
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      source,
      content,
      insights,
      actionPlan,
    });
    // Reset
    setTitle('');
    setSource('');
    setContent('');
    setInsights([]);
    setActionPlan('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${template?.icon} ${template?.title}`}>
      <div className="space-y-4">
        <Input
          label="제목 *"
          placeholder="오늘 리뷰한 내용의 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="출처"
          placeholder="URL 또는 출처 정보"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <Textarea
          label="핵심 내용"
          placeholder="주요 내용을 간단히 정리..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            인사이트
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="얻은 인사이트를 입력"
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInsight())}
            />
            <Button variant="secondary" onClick={handleAddInsight}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {insights.length > 0 && (
            <div className="mt-2 space-y-1">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2"
                >
                  <span className="text-primary-500">•</span>
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Textarea
          label="적용 계획"
          placeholder="이 내용을 어떻게 적용할까요?"
          rows={2}
          value={actionPlan}
          onChange={(e) => setActionPlan(e.target.value)}
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!title.trim()}>
            완료
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ChallengeSection() {
  const { dailyTemplates, isChallengeCompleted, completeChallenge, getCompletedCount, loading } = useChallenges();
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const completedCount = getCompletedCount('daily');
  const totalCount = dailyTemplates.length;

  const handleComplete = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: {
    title: string;
    source: string;
    content: string;
    insights: string[];
    actionPlan: string;
  }) => {
    if (selectedTemplate) {
      await completeChallenge(selectedTemplate.id, data);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>오늘의 챌린지</span>
            <span className="text-sm font-normal text-slate-500">
              {completedCount}/{totalCount}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyTemplates.map((template) => (
              <ChallengeItem
                key={template.id}
                template={template}
                completed={isChallengeCompleted(template.id, 'daily')}
                onComplete={() => handleComplete(template)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <CompletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
        onSubmit={handleSubmit}
      />
    </>
  );
}
