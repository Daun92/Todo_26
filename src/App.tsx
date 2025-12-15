import { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { HomePage, GoalsPage, JournalPage, InsightsPage, GraphPage } from '@/pages';
import { useStore } from '@/stores/useStore';
import { initializeDefaultData } from '@/lib/db';

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
    default:
      return <HomePage />;
  }
}

function App() {
  useEffect(() => {
    initializeDefaultData();
  }, []);

  return (
    <Layout>
      <AppContent />
    </Layout>
  );
}

export default App;
