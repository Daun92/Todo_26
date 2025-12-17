import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/db';
import type { TimeCapsule } from '@/types';
import { generateId } from '@/lib/utils';
import { isPast, isToday } from 'date-fns';

export function useTimeCapsules() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCapsules = useCallback(async () => {
    setLoading(true);
    try {
      const all = await db.timeCapsules.orderBy('openDate').toArray();
      setCapsules(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  const openableCapsules = useMemo(() => {
    return capsules.filter((c) => {
      const openDate = new Date(c.openDate);
      return (isPast(openDate) || isToday(openDate)) && !c.isOpened;
    });
  }, [capsules]);

  const pendingCapsules = useMemo(() => {
    return capsules.filter((c) => {
      const openDate = new Date(c.openDate);
      return !isPast(openDate) && !isToday(openDate);
    });
  }, [capsules]);

  const openedCapsules = useMemo(() => {
    return capsules.filter((c) => c.isOpened);
  }, [capsules]);

  const addCapsule = useCallback(
    async (data: {
      title: string;
      content: string;
      openDate: string;
      linkedGoals?: string[];
      tags?: string[];
    }) => {
      const now = new Date().toISOString();
      const newCapsule: TimeCapsule = {
        id: generateId(),
        title: data.title,
        content: data.content,
        createdAt: now,
        openDate: data.openDate,
        isOpened: false,
        linkedGoals: data.linkedGoals,
        tags: data.tags || [],
      };

      await db.timeCapsules.add(newCapsule);
      await loadCapsules();
      return newCapsule;
    },
    [loadCapsules]
  );

  const openCapsule = useCallback(
    async (id: string) => {
      const capsule = await db.timeCapsules.get(id);
      if (capsule) {
        const openDate = new Date(capsule.openDate);
        if (isPast(openDate) || isToday(openDate)) {
          await db.timeCapsules.update(id, {
            isOpened: true,
            openedAt: new Date().toISOString(),
          });
          await loadCapsules();
          return true;
        }
      }
      return false;
    },
    [loadCapsules]
  );

  const writeResponse = useCallback(
    async (id: string, content: string) => {
      const capsule = await db.timeCapsules.get(id);
      if (capsule && capsule.isOpened) {
        await db.timeCapsules.update(id, {
          response: {
            content,
            writtenAt: new Date().toISOString(),
          },
        });
        await loadCapsules();
        return true;
      }
      return false;
    },
    [loadCapsules]
  );

  const deleteCapsule = useCallback(
    async (id: string) => {
      await db.timeCapsules.delete(id);
      await loadCapsules();
    },
    [loadCapsules]
  );

  return {
    capsules,
    openableCapsules,
    pendingCapsules,
    openedCapsules,
    loading,
    addCapsule,
    openCapsule,
    writeResponse,
    deleteCapsule,
    refresh: loadCapsules,
  };
}
