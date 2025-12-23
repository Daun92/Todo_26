/**
 * @file useToast.ts
 * @description Toast 알림 상태 관리
 *
 * @checkpoint CP-6.4
 * @created 2025-12-23
 *
 * @usage
 * const { addToast, removeToast } = useToast();
 * addToast({ type: 'success', title: '저장 완료' });
 */

import { create } from 'zustand';

// ============================================
// Types
// ============================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number; // ms, 0 = no auto dismiss
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// ============================================
// Store
// ============================================

export const useToast = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// ============================================
// Helper Functions
// ============================================

export function toast(options: Omit<Toast, 'id'>) {
  return useToast.getState().addToast(options);
}

export const toastSuccess = (title: string, description?: string) =>
  toast({ type: 'success', title, description });

export const toastError = (title: string, description?: string) =>
  toast({ type: 'error', title, description });

export const toastWarning = (title: string, description?: string) =>
  toast({ type: 'warning', title, description });

export const toastInfo = (title: string, description?: string) =>
  toast({ type: 'info', title, description });
