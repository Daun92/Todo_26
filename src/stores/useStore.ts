import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Selected date for views
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // UI State
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Modal State
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set((state) => {
        const newValue = !state.darkMode;
        if (newValue) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newValue };
      }),
      setDarkMode: (value) => set(() => {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: value };
      }),

      // Navigation
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Selected date
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),

      // UI State
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      // Modal State
      activeModal: null,
      modalData: null,
      openModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),
    }),
    {
      name: 'catalyze-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
      }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('catalyze-store');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}
