import { StreakCard, HabitTracker, ChallengeSection, Heatmap, WeeklyMonthlyChallenge, AICoach } from '@/components/home';

export function HomePage() {
  return (
    <div className="space-y-4">
      <StreakCard />
      <HabitTracker />
      <ChallengeSection />
      <WeeklyMonthlyChallenge />
      <Heatmap />
      <AICoach />
    </div>
  );
}
