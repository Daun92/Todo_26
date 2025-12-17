import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { OnThisDayData } from '@/types';
import { getToday } from '@/lib/utils';
import { format, subYears } from 'date-fns';

export function useOnThisDay(targetDate?: string) {
  const [data, setData] = useState<OnThisDayData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOnThisDay = useCallback(async () => {
    setLoading(true);
    try {
      const date = targetDate || getToday();
      const monthDay = date.slice(5); // MM-DD part
      const currentYear = parseInt(date.slice(0, 4));

      const results: OnThisDayData[] = [];

      // Look back up to 10 years
      for (let yearsBack = 1; yearsBack <= 10; yearsBack++) {
        const year = currentYear - yearsBack;
        const historicDate = `${year}-${monthDay}`;

        // Get highlights for this date
        const highlights = await db.highlights
          .where('date')
          .equals(historicDate)
          .toArray();

        // Get habit log for this date
        const habitLog = await db.habitLogs
          .where('date')
          .equals(historicDate)
          .first();

        // Get journals for this date
        const journals = await db.journals
          .where('date')
          .equals(historicDate)
          .toArray();

        // Get milestones completed on this date (from goals)
        const goals = await db.goals.toArray();
        const milestones: OnThisDayData['milestones'] = [];

        // Note: Since milestones don't have completedAt in the current schema,
        // we'll skip milestone detection for now. This can be enhanced later.

        // Only add if there's any data for this date
        if (
          highlights.length > 0 ||
          habitLog ||
          journals.length > 0 ||
          milestones.length > 0
        ) {
          let habitInfo: OnThisDayData['habitLog'] | undefined;
          if (habitLog) {
            const activeHabits = await db.habitDefinitions
              .where('active')
              .equals(1)
              .count();
            habitInfo = {
              completedCount: Object.values(habitLog.habits).filter(Boolean).length,
              totalCount: activeHabits,
            };
          }

          results.push({
            year,
            date: historicDate,
            highlights,
            habitLog: habitInfo,
            journals: journals.map((j) => ({
              id: j.id,
              title: j.title,
              content: j.content,
              type: j.type,
            })),
            milestones,
          });
        }
      }

      setData(results);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    loadOnThisDay();
  }, [loadOnThisDay]);

  return {
    data,
    loading,
    refresh: loadOnThisDay,
  };
}
