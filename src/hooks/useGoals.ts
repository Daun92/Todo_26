import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Goal, Strategy, Milestone } from '@/types';
import { generateId } from '@/lib/utils';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    const data = await db.goals.toArray();
    setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.goals.add(newGoal);
    await loadGoals();
    return newGoal;
  }, [loadGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    await db.goals.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await loadGoals();
  }, [loadGoals]);

  const addStrategy = useCallback(async (goalId: string, content: string, reason: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const currentStrategy = goal.strategies[goal.strategies.length - 1];
    if (currentStrategy) {
      currentStrategy.endDate = new Date().toISOString().split('T')[0];
    }

    const newStrategy: Strategy = {
      id: generateId(),
      version: (currentStrategy?.version || 0) + 1,
      content,
      reason,
      startDate: new Date().toISOString().split('T')[0],
    };

    const updatedStrategies = [...goal.strategies];
    if (currentStrategy) {
      updatedStrategies[updatedStrategies.length - 1] = currentStrategy;
    }
    updatedStrategies.push(newStrategy);

    await updateGoal(goalId, { strategies: updatedStrategies });
  }, [goals, updateGoal]);

  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedDate: !m.completed ? new Date().toISOString().split('T')[0] : undefined,
          }
        : m
    );

    await updateGoal(goalId, { milestones: updatedMilestones });
  }, [goals, updateGoal]);

  const addMilestone = useCallback(async (goalId: string, title: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newMilestone: Milestone = {
      id: generateId(),
      title,
      completed: false,
      order: goal.milestones.length,
    };

    await updateGoal(goalId, {
      milestones: [...goal.milestones, newMilestone],
    });
  }, [goals, updateGoal]);

  const updateLevel = useCallback(async (goalId: string, level: number, note?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const today = new Date().toISOString().split('T')[0];
    const newLevelLog = { date: today, level, note };

    await updateGoal(goalId, {
      currentLevel: level,
      levelHistory: [...goal.levelHistory, newLevelLog],
    });
  }, [goals, updateGoal]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    addStrategy,
    toggleMilestone,
    addMilestone,
    updateLevel,
    reload: loadGoals,
  };
}
