import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { HabitDefinition, HabitLog } from '@/types';
import { getToday, generateId } from '@/lib/utils';

export function useHabits() {
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [todayLog, setTodayLog] = useState<HabitLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    const defs = await db.habitDefinitions.where('active').equals(1).sortBy('order');
    setHabits(defs);
  }, []);

  const loadTodayLog = useCallback(async () => {
    const today = getToday();
    const log = await db.habitLogs.where('date').equals(today).first();
    setTodayLog(log || null);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadHabits(), loadTodayLog()]);
      setLoading(false);
    };
    load();
  }, [loadHabits, loadTodayLog]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const today = getToday();

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
  }, [todayLog]);

  const getCompletedCount = useCallback(() => {
    if (!todayLog) return 0;
    return Object.values(todayLog.habits).filter(Boolean).length;
  }, [todayLog]);

  const isHabitCompleted = useCallback((habitId: string) => {
    return todayLog?.habits[habitId] || false;
  }, [todayLog]);

  return {
    habits,
    todayLog,
    loading,
    toggleHabit,
    getCompletedCount,
    isHabitCompleted,
    totalHabits: habits.length,
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
