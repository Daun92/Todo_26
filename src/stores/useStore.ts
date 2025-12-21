import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabType } from '@/types';

// ============================================
// App Store
// ============================================

interface AppStore {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Current Session
  currentContentId: string | null;
  setCurrentContentId: (id: string | null) => void;

  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;

  // Modal
  activeModal: string | null;
  modalData: unknown;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;

  // Quick Memo
  quickMemoOpen: boolean;
  setQuickMemoOpen: (open: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Navigation
      activeTab: 'chat',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Theme
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          // Apply to document
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        }),

      // Current Session
      currentContentId: null,
      setCurrentContentId: (id) => set({ currentContentId: id }),

      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),

      // Modal
      activeModal: null,
      modalData: null,
      openModal: (modal, data = null) =>
        set({ activeModal: modal, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Quick Memo
      quickMemoOpen: false,
      setQuickMemoOpen: (open) => set({ quickMemoOpen: open }),
    }),
    {
      name: 'mosaic-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        activeTab: state.activeTab,
      }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('mosaic-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.darkMode) {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignore parse errors
    }
  }
}
