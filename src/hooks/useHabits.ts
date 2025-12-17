import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { HabitDefinition, HabitLog } from '@/types';
import { getToday, generateId } from '@/lib/utils';

export function useHabits() {
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [allHabits, setAllHabits] = useState<HabitDefinition[]>([]);
  const [todayLog, setTodayLog] = useState<HabitLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    const defs = await db.habitDefinitions.where('active').equals(1).sortBy('order');
    setHabits(defs);
  }, []);

  const loadAllHabits = useCallback(async () => {
    const defs = await db.habitDefinitions.orderBy('order').toArray();
    setAllHabits(defs);
  }, []);

  const loadTodayLog = useCallback(async () => {
    const today = getToday();
    const log = await db.habitLogs.where('date').equals(today).first();
    setTodayLog(log || null);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadHabits(), loadAllHabits(), loadTodayLog()]);
      setLoading(false);
    };
    load();
  }, [loadHabits, loadAllHabits, loadTodayLog]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const today = getToday();
    const wasCompleted = todayLog?.habits[habitId] || false;

    if (todayLog) {
      const newHabits = {
        ...todayLog.habits,
        [habitId]: !todayLog.habits[habitId],
      };
      await db.habitLogs.update(todayLog.id, { habits: newHabits });
      setTodayLog({ ...todayLog, habits: newHabits });
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        date: today,
        habits: { [habitId]: true },
      };
      await db.habitLogs.add(newLog);
      setTodayLog(newLog);
    }

    return !wasCompleted; // Returns whether the habit is now completed
  }, [todayLog]);

  const getCompletedCount = useCallback(() => {
    if (!todayLog) return 0;
    return Object.values(todayLog.habits).filter(Boolean).length;
  }, [todayLog]);

  const isHabitCompleted = useCallback((habitId: string) => {
    return todayLog?.habits[habitId] || false;
  }, [todayLog]);

  // CRUD Operations
  const addHabit = useCallback(async (habit: Omit<HabitDefinition, 'id' | 'order'>) => {
    const maxOrder = allHabits.length > 0
      ? Math.max(...allHabits.map(h => h.order)) + 1
      : 0;

    const newHabit: HabitDefinition = {
      ...habit,
      id: generateId(),
      order: maxOrder,
    };

    await db.habitDefinitions.add(newHabit);
    await Promise.all([loadHabits(), loadAllHabits()]);
    return newHabit;
  }, [allHabits, loadHabits, loadAllHabits]);

  const updateHabit = useCallback(async (id: string, updates: Partial<HabitDefinition>) => {
    await db.habitDefinitions.update(id, updates);
    await Promise.all([loadHabits(), loadAllHabits()]);
  }, [loadHabits, loadAllHabits]);

  const deleteHabit = useCallback(async (id: string) => {
    await db.habitDefinitions.delete(id);
    await Promise.all([loadHabits(), loadAllHabits()]);
  }, [loadHabits, loadAllHabits]);

  const reorderHabits = useCallback(async (orderedIds: string[]) => {
    await db.transaction('rw', db.habitDefinitions, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.habitDefinitions.update(orderedIds[i], { order: i });
      }
    });
    await Promise.all([loadHabits(), loadAllHabits()]);
  }, [loadHabits, loadAllHabits]);

  // Condition tracking (energy/mood)
  const updateTodayCondition = useCallback(async (updates: { energy?: number; mood?: number; note?: string }) => {
    const today = getToday();

    if (todayLog) {
      await db.habitLogs.update(todayLog.id, updates);
      setTodayLog({ ...todayLog, ...updates });
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        date: today,
        habits: {},
        ...updates,
      };
      await db.habitLogs.add(newLog);
      setTodayLog(newLog);
    }
  }, [todayLog]);

  return {
    habits,
    allHabits,
    todayLog,
    loading,
    toggleHabit,
    getCompletedCount,
    isHabitCompleted,
    totalHabits: habits.length,
    // CRUD
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    // Condition
    updateTodayCondition,
    refresh: () => Promise.all([loadHabits(), loadAllHabits(), loadTodayLog()]),
  };
}

export function useHabitHistory(days: number = 365) {
  const [history, setHistory] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startStr = startDate.toISOString().split('T')[0];

      const logs = await db.habitLogs
        .where('date')
        .aboveOrEqual(startStr)
        .toArray();

      setHistory(logs);
      setLoading(false);
    };
    load();
  }, [days]);

  return { history, loading };
}
