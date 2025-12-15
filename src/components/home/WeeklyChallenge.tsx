import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, Textarea } from '@/components/ui';
import { useChallenges } from '@/hooks';
import { cn } from '@/lib/utils';
import type { ChallengeTemplate } from '@/types';

export function WeeklyMonthlyChallenge() {
  const {
    weeklyTemplates,
    monthlyTemplates,
    isChallengeCompleted,
    completeChallenge,
    getCompletedCount,
    loading,
  } = useChallenges();

  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState('');

  if (loading) return null;

  const handleOpenModal = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleComplete = async () => {
    if (selectedTemplate && title.trim()) {
      await completeChallenge(selectedTemplate.id, {
        title,
        content,
        insights: [],
      });
      setTitle('');
      setContent('');
      setProgress('');
      setIsModalOpen(false);
    }
  };

  const weeklyCompleted = getCompletedCount('weekly');
  const monthlyCompleted = getCompletedCount('monthly');

  return (
    <>
      {/* Weekly Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>이번 주 챌린지</span>
            <span className="text-sm font-normal text-slate-500">
              {weeklyCompleted}/{weeklyTemplates.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyTemplates.map((template) => {
              const completed = isChallengeCompleted(template.id, 'weekly');
              return (
                <button
                  key={template.id}
                  onClick={() => !completed && handleOpenModal(template)}
                  disabled={completed}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                    'border-2',
                    completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-primary-200 dark:hover:border-primary-800'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                      completed ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 shadow-sm'
                    )}
                  >
                    {completed ? <Check className="w-5 h-5" /> : template.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={cn('text-sm font-medium', completed && 'line-through text-emerald-700 dark:text-emerald-300')}>
                      {template.title}
                    </p>
                  </div>
                  {!completed && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>이번 달 챌린지</span>
            <span className="text-sm font-normal text-slate-500">
              {monthlyCompleted}/{monthlyTemplates.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {monthlyTemplates.map((template) => {
              const completed = isChallengeCompleted(template.id, 'monthly');
              return (
                <button
                  key={template.id}
                  onClick={() => !completed && handleOpenModal(template)}
                  disabled={completed}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                    'border-2',
                    completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 hover:border-amber-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                      completed ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 shadow-sm'
                    )}
                  >
                    {completed ? <Check className="w-5 h-5" /> : template.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={cn('text-sm font-medium', completed && 'line-through')}>
                      {template.title}
                    </p>
                  </div>
                  {!completed && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${selectedTemplate?.icon} ${selectedTemplate?.title}`}
      >
        <div className="space-y-4">
          <Input
            label="제목 *"
            placeholder="완료한 내용의 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="내용 요약"
            placeholder="핵심 내용을 정리해주세요..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleComplete} disabled={!title.trim()}>
              완료
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
