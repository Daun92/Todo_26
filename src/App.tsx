import { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { FeedPage, LearnPage, ConnectPage, ReflectPage } from '@/pages';
import { QuickMemoModal } from '@/components/modals/QuickMemoModal';
import { AddContentModal } from '@/components/modals/AddContentModal';
import { useStore } from '@/stores/useStore';
import { initializeUserProfile } from '@/lib/db';

function AppContent() {
  const { activeTab } = useStore();

  switch (activeTab) {
    case 'feed':
      return <FeedPage />;
    case 'learn':
      return <LearnPage />;
    case 'connect':
      return <ConnectPage />;
    case 'reflect':
      return <ReflectPage />;
    default:
      return <FeedPage />;
  }
}

export default function App() {
  const { quickMemoOpen, setQuickMemoOpen, activeModal, closeModal } = useStore();

  // Initialize database on mount
  useEffect(() => {
    initializeUserProfile();
  }, []);

  return (
    <Layout>
      <AppContent />

      {/* Global Modals */}
      <QuickMemoModal
        isOpen={quickMemoOpen}
        onClose={() => setQuickMemoOpen(false)}
      />

      <AddContentModal
        isOpen={activeModal === 'addContent'}
        onClose={closeModal}
      />
    </Layout>
  );
}
