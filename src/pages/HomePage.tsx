import { StreakCard, HabitTracker, ChallengeSection, Heatmap, WeeklyMonthlyChallenge, AICoach, TodayGuide } from '@/components/home';

export function HomePage() {
  return (
    <div className="space-y-4">
      <TodayGuide />
      <StreakCard />
      <HabitTracker />
      <ChallengeSection />
      <WeeklyMonthlyChallenge />
      <Heatmap />
      <AICoach />
    </div>
  );
}
