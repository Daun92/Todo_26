import { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ChatPage, FeedPage, ConnectPage, ReflectPage } from '@/pages';
import { QuickMemoModal, AddContentModal, SettingsModal } from '@/components/modals';
import { useStore } from '@/stores/useStore';
import { initializeUserProfile } from '@/lib/db';

function AppContent() {
  const { activeTab } = useStore();

  switch (activeTab) {
    case 'chat':
      return <ChatPage />;
    case 'feed':
      return <FeedPage />;
    case 'graph':
      return <ConnectPage />;
    case 'growth':
      return <ReflectPage />;
    default:
      return <ChatPage />;
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

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={closeModal}
      />
    </Layout>
  );
}
