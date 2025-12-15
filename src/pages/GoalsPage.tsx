import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Plus,
  Check,
  History,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, Textarea, Progress } from '@/components/ui';
import { useGoals } from '@/hooks';
import { cn, formatDate } from '@/lib/utils';
import type { Goal, Milestone } from '@/types';

function GoalCard({ goal, onUpdate }: { goal: Goal; onUpdate: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [newStrategy, setNewStrategy] = useState('');
  const [strategyReason, setStrategyReason] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [newLevel, setNewLevel] = useState(goal.currentLevel);
  const [levelNote, setLevelNote] = useState('');

  const { addStrategy, toggleMilestone, addMilestone, updateLevel } = useGoals();

  const currentStrategy = goal.strategies[goal.strategies.length - 1];
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const progressRate = goal.milestones.length > 0
    ? Math.round((completedMilestones / goal.milestones.length) * 100)
    : 0;

  const handleAddStrategy = async () => {
    if (newStrategy.trim() && strategyReason.trim()) {
      await addStrategy(goal.id, newStrategy, strategyReason);
      setNewStrategy('');
      setStrategyReason('');
      setShowStrategyModal(false);
      onUpdate();
    }
  };

  const handleAddMilestone = async () => {
    if (newMilestone.trim()) {
      await addMilestone(goal.id, newMilestone);
      setNewMilestone('');
      setShowMilestoneModal(false);
      onUpdate();
    }
  };

  const handleUpdateLevel = async () => {
    await updateLevel(goal.id, newLevel, levelNote);
    setLevelNote('');
    setShowLevelModal(false);
    onUpdate();
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    await toggleMilestone(goal.id, milestoneId);
    onUpdate();
  };

  return (
    <>
      <Card className="overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <div className="flex-1">
                <CardTitle className="text-base">{goal.title}</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  레벨 {goal.currentLevel}/10
                </p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </CardHeader>

          {!isExpanded && (
            <CardContent className="pt-0">
              <Progress value={goal.currentLevel * 10} variant="gradient" size="sm" />
            </CardContent>
          )}
        </button>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* Level Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">역량 레벨</span>
                <Button variant="ghost" size="sm" onClick={() => setShowLevelModal(true)}>
                  <Edit3 className="w-3 h-3 mr-1" />
                  평가
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={goal.currentLevel * 10} variant="gradient" className="flex-1" />
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {goal.currentLevel}
                </span>
              </div>
            </div>

            {/* Current Strategy */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  현재 전략 (v{currentStrategy?.version || 1})
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowStrategyModal(true)}>
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm">{currentStrategy?.content || '전략을 설정해주세요'}</p>

              {goal.strategies.length > 1 && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer flex items-center gap-1">
                    <History className="w-3 h-3" />
                    전략 히스토리
                  </summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                    {goal.strategies.slice(0, -1).reverse().map((s) => (
                      <div key={s.id} className="text-xs text-slate-500">
                        <span className="font-medium">v{s.version}</span>: {s.content}
                        <span className="text-slate-400 ml-1">({formatDate(s.startDate)})</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Milestones */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  마일스톤 ({completedMilestones}/{goal.milestones.length})
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowMilestoneModal(true)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <Progress value={progressRate} size="sm" variant="success" className="mb-2" />
              <div className="space-y-1">
                {goal.milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      milestone.completed && 'bg-emerald-50 dark:bg-emerald-950/30'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        milestone.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      )}
                    >
                      {milestone.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        milestone.completed && 'line-through text-slate-500'
                      )}
                    >
                      {milestone.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Strategy Modal */}
      <Modal
        isOpen={showStrategyModal}
        onClose={() => setShowStrategyModal(false)}
        title="전략 수정"
      >
        <div className="space-y-4">
          <Textarea
            label="새로운 전략"
            placeholder="목표 달성을 위한 전략을 작성하세요"
            rows={3}
            value={newStrategy}
            onChange={(e) => setNewStrategy(e.target.value)}
          />
          <Textarea
            label="변경 이유"
            placeholder="왜 이 전략으로 바꾸나요?"
            rows={2}
            value={strategyReason}
            onChange={(e) => setStrategyReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowStrategyModal(false)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleAddStrategy} disabled={!newStrategy.trim() || !strategyReason.trim()}>
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        title="마일스톤 추가"
      >
        <div className="space-y-4">
          <Input
            label="마일스톤"
            placeholder="달성할 마일스톤을 입력하세요"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowMilestoneModal(false)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleAddMilestone} disabled={!newMilestone.trim()}>
              추가
            </Button>
          </div>
        </div>
      </Modal>

      {/* Level Modal */}
      <Modal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title="역량 레벨 평가"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              현재 레벨: {newLevel}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={newLevel}
              onChange={(e) => setNewLevel(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 (입문)</span>
              <span>5 (중급)</span>
              <span>10 (전문가)</span>
            </div>
          </div>
          <Textarea
            label="평가 메모"
            placeholder="이 레벨로 평가한 이유를 기록하세요"
            rows={2}
            value={levelNote}
            onChange={(e) => setLevelNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowLevelModal(false)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleUpdateLevel}>
              저장
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function GoalsPage() {
  const { goals, loading, reload } = useGoals();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="animate-pulse space-y-3 p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mt-2" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          목표 관리
        </h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>

      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onUpdate={reload} />
      ))}
    </div>
  );
}
