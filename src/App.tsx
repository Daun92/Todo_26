import { useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { HomePage, GoalsPage, JournalPage, InsightsPage, GraphPage, SettingsPage } from '@/pages';
import { DiagnosticFlow } from '@/components/onboarding';
import { useStore } from '@/stores/useStore';
import { initializeDefaultData, db } from '@/lib/db';

function AppContent() {
  const { activeTab } = useStore();

  switch (activeTab) {
    case 'home':
      return <HomePage />;
    case 'goals':
      return <GoalsPage />;
    case 'journal':
      return <JournalPage />;
    case 'insights':
      return <InsightsPage />;
    case 'graph':
      return <GraphPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  const { onboardingCompleted, completeOnboarding } = useStore();

  useEffect(() => {
    initializeDefaultData();
  }, []);

  const handleOnboardingComplete = useCallback(
    async (results: { category: string; totalScore: number; answers: unknown[] }[]) => {
      // 진단 결과를 저장
      const diagnosticResults = results.map((r) => ({
        category: r.category,
        totalScore: r.totalScore,
        level: Math.max(1, Math.round((r.totalScore / (r.answers.length * 9)) * 10)),
        completedAt: new Date().toISOString(),
      }));

      // 목표의 초기 레벨을 진단 결과로 업데이트
      const goals = await db.goals.toArray();
      for (const result of diagnosticResults) {
        const matchingGoal = goals.find((g) => {
          if (result.category === 'ai-prompting' && g.title.includes('AI')) return true;
          if (result.category === 'project-lead' && g.title.includes('리드')) return true;
          if (result.category === 'planning' && g.title.includes('기획')) return true;
          return false;
        });

        if (matchingGoal) {
          await db.goals.update(matchingGoal.id, {
            currentLevel: result.level,
            levelHistory: [
              ...matchingGoal.levelHistory,
              {
                level: result.level,
                date: new Date().toISOString().split('T')[0],
                note: '초기 진단 결과',
              },
            ],
          });
        }
      }

      completeOnboarding(diagnosticResults);
    },
    [completeOnboarding]
  );

  const handleOnboardingSkip = useCallback(() => {
    completeOnboarding([]);
  }, [completeOnboarding]);

  // 온보딩이 완료되지 않은 경우 진단 화면 표시
  if (!onboardingCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <DiagnosticFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  return (
    <Layout>
      <AppContent />
    </Layout>
  );
}

export default App;
