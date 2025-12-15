import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { ChallengeTemplate, ChallengeLog, ChallengeFrequency } from '@/types';
import { getToday, getWeekRange, getMonthRange, generateId } from '@/lib/utils';

export function useChallenges() {
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [todayLogs, setTodayLogs] = useState<ChallengeLog[]>([]);
  const [weekLogs, setWeekLogs] = useState<ChallengeLog[]>([]);
  const [monthLogs, setMonthLogs] = useState<ChallengeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    const temps = await db.challengeTemplates.where('active').equals(1).sortBy('order');
    setTemplates(temps);
    return temps;
  }, []);

  const loadLogs = useCallback(async () => {
    const today = getToday();
    const { start: weekStart, end: weekEnd } = getWeekRange();
    const { start: monthStart, end: monthEnd } = getMonthRange();

    const [daily, weekly, monthly] = await Promise.all([
      db.challengeLogs.where('date').equals(today).toArray(),
      db.challengeLogs.where('date').between(weekStart, weekEnd, true, true).toArray(),
      db.challengeLogs.where('date').between(monthStart, monthEnd, true, true).toArray(),
    ]);

    setTodayLogs(daily);
    setWeekLogs(weekly);
    setMonthLogs(monthly);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTemplates(), loadLogs()]);
      setLoading(false);
    };
    load();
  }, [loadTemplates, loadLogs]);

  const getTemplatesByFrequency = useCallback((frequency: ChallengeFrequency) => {
    return templates.filter((t) => t.frequency === frequency);
  }, [templates]);

  const getLogsForTemplate = useCallback((templateId: string, frequency: ChallengeFrequency) => {
    switch (frequency) {
      case 'daily':
        return todayLogs.filter((l) => l.templateId === templateId);
      case 'weekly':
        return weekLogs.filter((l) => l.templateId === templateId);
      case 'monthly':
        return monthLogs.filter((l) => l.templateId === templateId);
      default:
        return [];
    }
  }, [todayLogs, weekLogs, monthLogs]);

  const isChallengeCompleted = useCallback((templateId: string, frequency: ChallengeFrequency) => {
    const logs = getLogsForTemplate(templateId, frequency);
    return logs.some((l) => l.status === 'completed');
  }, [getLogsForTemplate]);

  const completeChallenge = useCallback(async (
    templateId: string,
    data: {
      title?: string;
      source?: string;
      content?: string;
      insights?: string[];
      linkedGoals?: string[];
      actionPlan?: string;
    }
  ) => {
    const today = getToday();
    const log: ChallengeLog = {
      id: generateId(),
      templateId,
      date: today,
      status: 'completed',
      title: data.title,
      source: data.source,
      content: data.content,
      insights: data.insights || [],
      linkedGoals: data.linkedGoals || [],
      actionPlan: data.actionPlan,
      completedAt: new Date().toISOString(),
    };

    await db.challengeLogs.add(log);
    await loadLogs();
    return log;
  }, [loadLogs]);

  const getCompletedCount = useCallback((frequency: ChallengeFrequency) => {
    const temps = getTemplatesByFrequency(frequency);
    return temps.filter((t) => isChallengeCompleted(t.id, frequency)).length;
  }, [getTemplatesByFrequency, isChallengeCompleted]);

  return {
    templates,
    loading,
    getTemplatesByFrequency,
    getLogsForTemplate,
    isChallengeCompleted,
    completeChallenge,
    getCompletedCount,
    dailyTemplates: getTemplatesByFrequency('daily'),
    weeklyTemplates: getTemplatesByFrequency('weekly'),
    monthlyTemplates: getTemplatesByFrequency('monthly'),
  };
}
