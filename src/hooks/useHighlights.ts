import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Highlight, HighlightType, EmotionType } from '@/types';
import { generateId, getToday } from '@/lib/utils';

export function useHighlights(options?: { date?: string; starred?: boolean; limit?: number }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHighlights = useCallback(async () => {
    setLoading(true);
    try {
      let query = db.highlights.orderBy('date').reverse();

      const all = await query.toArray();

      let filtered = all;

      if (options?.date) {
        filtered = filtered.filter((h) => h.date === options.date);
      }

      if (options?.starred) {
        filtered = filtered.filter((h) => h.starred);
      }

      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      setHighlights(filtered);
    } finally {
      setLoading(false);
    }
  }, [options?.date, options?.starred, options?.limit]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  const addHighlight = useCallback(
    async (data: {
      type: HighlightType;
      title: string;
      content?: string;
      emotion?: EmotionType;
      tags: string[];
      date?: string;
    }) => {
      const now = new Date().toISOString();
      const newHighlight: Highlight = {
        id: generateId(),
        type: data.type,
        title: data.title,
        content: data.content,
        date: data.date || getToday(),
        tags: data.tags,
        linkedEntities: [],
        emotion: data.emotion,
        starred: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.highlights.add(newHighlight);
      await loadHighlights();
      return newHighlight;
    },
    [loadHighlights]
  );

  const updateHighlight = useCallback(
    async (id: string, updates: Partial<Highlight>) => {
      await db.highlights.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      await loadHighlights();
    },
    [loadHighlights]
  );

  const toggleStar = useCallback(
    async (id: string) => {
      const highlight = await db.highlights.get(id);
      if (highlight) {
        await db.highlights.update(id, {
          starred: !highlight.starred,
          updatedAt: new Date().toISOString(),
        });
        await loadHighlights();
      }
    },
    [loadHighlights]
  );

  const deleteHighlight = useCallback(
    async (id: string) => {
      await db.highlights.delete(id);
      await loadHighlights();
    },
    [loadHighlights]
  );

  return {
    highlights,
    loading,
    addHighlight,
    updateHighlight,
    toggleStar,
    deleteHighlight,
    refresh: loadHighlights,
  };
}

export function useRecentHighlights(limit: number = 5) {
  return useHighlights({ limit });
}

export function useStarredHighlights() {
  return useHighlights({ starred: true });
}
