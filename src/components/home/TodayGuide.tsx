import { useState, useEffect } from 'react';
import { Compass, ChevronRight, Sparkles, Target, Flame, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { db } from '@/lib/db';
import { cn, getToday, formatDate } from '@/lib/utils';
import { useStore } from '@/stores/useStore';
import type { Goal, HabitLog, ChallengeLog, ChallengeTemplate } from '@/types';

interface Suggestion {
  id: string;
  type: 'habit' | 'challenge' | 'goal' | 'reflection' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    tab?: string;
  };
  icon: React.ReactNode;
}

export function TodayGuide() {
  const { setActiveTab, diagnosticResults } = useStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // 오늘 날짜 기반 인사말
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };

  // 오늘의 포커스 메시지
  const getFocusMessage = (goals: Goal[]) => {
    const lowestLevelGoal = goals.reduce((min, g) =>
      g.currentLevel < min.currentLevel ? g : min
    , goals[0]);

    if (lowestLevelGoal) {
      return `오늘은 "${lowestLevelGoal.title}" 역량 향상에 집중해보세요`;
    }
    return '오늘도 한 걸음씩 성장해봐요';
  };

  useEffect(() => {
    const analyzeTodayStatus = async () => {
      setLoading(true);

      const today = getToday();
      const [goals, habitLog, challengeLogs, templates] = await Promise.all([
        db.goals.toArray(),
        db.habitLogs.where('date').equals(today).first(),
        db.challengeLogs.where('date').equals(today).toArray(),
        db.challengeTemplates.where('active').equals(1).toArray(),
      ]);

      const newSuggestions: Suggestion[] = [];

      // 1. 진단 결과 기반 제안 (처음 사용자)
      if (diagnosticResults.length === 0) {
        newSuggestions.push({
          id: 'diagnostic',
          type: 'tip',
          priority: 'high',
          title: '역량 진단을 받아보세요',
          description: '현재 수준을 파악하면 더 효과적인 목표 설정이 가능해요',
          action: { label: '진단 시작', tab: 'settings' },
          icon: <Target className="w-5 h-5 text-primary-500" />,
        });
      }

      // 2. 습관 체크 현황
      const habitDefs = await db.habitDefinitions.where('active').equals(1).toArray();
      const completedHabits = habitLog ? Object.values(habitLog.habits).filter(Boolean).length : 0;
      const totalHabits = habitDefs.length;

      if (completedHabits === 0) {
        newSuggestions.push({
          id: 'habits-start',
          type: 'habit',
          priority: 'high',
          title: '오늘의 습관을 시작하세요',
          description: `${totalHabits}개의 습관이 기다리고 있어요. 작은 것부터 시작해보세요.`,
          action: { label: '습관 체크', tab: 'home' },
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        });
      } else if (completedHabits < totalHabits) {
        newSuggestions.push({
          id: 'habits-continue',
          type: 'habit',
          priority: 'medium',
          title: `${totalHabits - completedHabits}개 습관이 남았어요`,
          description: `${completedHabits}/${totalHabits} 완료! 조금만 더 힘내세요.`,
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        });
      }

      // 3. 챌린지 현황
      const dailyTemplates = templates.filter(t => t.frequency === 'daily');
      const completedChallenges = challengeLogs.filter(l => l.status === 'completed');
      const pendingChallenges = dailyTemplates.filter(t =>
        !completedChallenges.some(c => c.templateId === t.id)
      );

      if (pendingChallenges.length > 0) {
        const nextChallenge = pendingChallenges[0];
        newSuggestions.push({
          id: 'challenge-next',
          type: 'challenge',
          priority: completedChallenges.length === 0 ? 'high' : 'medium',
          title: `다음 챌린지: ${nextChallenge.title}`,
          description: nextChallenge.description || '오늘의 챌린지를 완료하고 성장하세요',
          action: { label: '챌린지 보기', tab: 'home' },
          icon: <Flame className="w-5 h-5 text-orange-500" />,
        });
      }

      // 4. 목표 진행 상황 기반 제안
      const lowestGoal = goals.reduce((min, g) =>
        g.currentLevel < min.currentLevel ? g : min
      , goals[0]);

      if (lowestGoal && lowestGoal.currentLevel < 5) {
        newSuggestions.push({
          id: 'goal-focus',
          type: 'goal',
          priority: 'medium',
          title: `${lowestGoal.title} 레벨업 기회`,
          description: `현재 Lv.${lowestGoal.currentLevel} - 오늘 관련 챌린지에 집중해보세요`,
          action: { label: '목표 확인', tab: 'goals' },
          icon: <Target className="w-5 h-5 text-primary-500" />,
        });
      }

      // 5. 시간대별 제안
      const hour = new Date().getHours();
      if (hour >= 20 && completedHabits < totalHabits) {
        newSuggestions.push({
          id: 'evening-reminder',
          type: 'tip',
          priority: 'high',
          title: '하루를 마무리하기 전에',
          description: '아직 완료하지 않은 습관이 있어요. 자기 전 간단히 체크해보세요.',
          icon: <Clock className="w-5 h-5 text-purple-500" />,
        });
      }

      // 6. 저널 작성 제안 (저녁)
      if (hour >= 18) {
        const todayJournals = await db.journals.where('date').above(today).toArray();
        if (todayJournals.length === 0) {
          newSuggestions.push({
            id: 'journal-write',
            type: 'reflection',
            priority: 'low',
            title: '오늘 하루를 기록해보세요',
            description: '간단한 메모도 좋아요. 나중에 회고할 때 큰 도움이 됩니다.',
            action: { label: '저널 작성', tab: 'journal' },
            icon: <Sparkles className="w-5 h-5 text-amber-500" />,
          });
        }
      }

      // 우선순위 정렬
      newSuggestions.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      });

      setSuggestions(newSuggestions.slice(0, 3)); // 최대 3개만 표시
      setLoading(false);
    };

    analyzeTodayStatus();
  }, [diagnosticResults]);

  if (dismissed || loading) return null;

  if (suggestions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-none">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">잘하고 있어요!</p>
              <p className="text-sm text-white/80">오늘의 할 일을 모두 완료했습니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            <span className="font-medium">오늘의 가이드</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/60 hover:text-white text-xs"
          >
            닫기
          </button>
        </div>
        <p className="text-sm text-white/80 mt-1">
          {getGreeting()}! {getFocusMessage([])}
        </p>
      </div>

      {/* Suggestions */}
      <CardContent className="p-0">
        <div className="divide-y dark:divide-slate-800">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                'flex items-center gap-3 p-3 transition-colors',
                suggestion.action && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
              )}
              onClick={() => {
                if (suggestion.action?.tab) {
                  setActiveTab(suggestion.action.tab);
                }
              }}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                suggestion.priority === 'high'
                  ? 'bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30'
                  : 'bg-slate-100 dark:bg-slate-800'
              )}>
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{suggestion.title}</p>
                  {suggestion.priority === 'high' && (
                    <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                      추천
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {suggestion.description}
                </p>
              </div>
              {suggestion.action && (
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
