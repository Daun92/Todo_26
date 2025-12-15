import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiagnosticResult {
  category: string;
  totalScore: number;
  level: number;
  completedAt: string;
}

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

  // Onboarding State
  onboardingCompleted: boolean;
  diagnosticResults: DiagnosticResult[];
  completeOnboarding: (results?: DiagnosticResult[]) => void;
  resetOnboarding: () => void;
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

      // Onboarding State
      onboardingCompleted: false,
      diagnosticResults: [],
      completeOnboarding: (results) => set({
        onboardingCompleted: true,
        diagnosticResults: results || [],
      }),
      resetOnboarding: () => set({
        onboardingCompleted: false,
        diagnosticResults: [],
      }),
    }),
    {
      name: 'catalyze-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        onboardingCompleted: state.onboardingCompleted,
        diagnosticResults: state.diagnosticResults,
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
