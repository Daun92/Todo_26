import { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ChatPage, FeedPage, ConnectPage, ReflectPage } from '@/pages';
import {
  QuickMemoModal,
  AddContentModal,
  SettingsModal,
  ContentDetailModal,
} from '@/components/modals';
import { useStore } from '@/stores/useStore';
import { useContents } from '@/hooks';
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
  const {
    quickMemoOpen,
    setQuickMemoOpen,
    activeModal,
    modalData,
    closeModal,
    currentContentId,
    setCurrentContentId,
    setActiveTab,
  } = useStore();

  const { startLearning, deleteContent } = useContents();

  // Initialize database on mount
  useEffect(() => {
    initializeUserProfile();
  }, []);

  // Handler for starting learning from modal
  const handleStartLearning = async (id: string) => {
    await startLearning(id);
    setCurrentContentId(id);
    setActiveTab('chat');
    closeModal();
  };

  // Handler for editing content
  const handleEditContent = () => {
    // Switch to addContent modal with edit data
    // modalData should contain the content to edit
  };

  // Handler for deleting content
  const handleDeleteContent = async (id: string) => {
    await deleteContent(id);
    closeModal();
  };

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

      <ContentDetailModal
        isOpen={activeModal === 'contentDetail'}
        onClose={closeModal}
        contentId={(modalData as { contentId?: string })?.contentId || currentContentId}
        onStartLearning={handleStartLearning}
        onDelete={handleDeleteContent}
      />
    </Layout>
  );
}
