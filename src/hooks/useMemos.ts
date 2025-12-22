/**
 * @file useMemos.ts
 * @description 메모 CRUD 및 관리 훅
 *
 * @checkpoint CP-2.2
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: Memo 타입
 *
 * @usage
 * const { memos, addMemo, getUnorganized } = useMemos();
 */

import { useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Memo } from '@/types';

// ============================================
// Types
// ============================================

/**
 * 메모 생성 입력 타입
 */
export interface CreateMemoInput {
  text: string;
  contentId?: string;
  sessionId?: string;
  tags?: string[];
}

/**
 * 메모 필터 옵션
 */
export interface MemoFilter {
  organized?: boolean | 'all';
  contentId?: string;
  sessionId?: string;
  tags?: string[];
  search?: string;
}

/**
 * useMemos 훅 반환 타입
 */
export interface UseMemosReturn {
  // 데이터
  memos: Memo[];
  loading: boolean;
  error: Error | null;

  // CRUD
  addMemo: (input: CreateMemoInput) => Promise<Memo>;
  updateMemo: (id: string, updates: Partial<Memo>) => Promise<void>;
  deleteMemo: (id: string) => Promise<void>;

  // 정리 상태
  markAsOrganized: (id: string) => Promise<void>;
  markAsUnorganized: (id: string) => Promise<void>;

  // 필터링
  filter: MemoFilter;
  setFilter: (filter: MemoFilter) => void;

  // 유틸리티
  unorganizedMemos: Memo[];
  unorganizedCount: number;
  recentMemos: Memo[];

  // 통계
  stats: {
    total: number;
    organized: number;
    unorganized: number;
  };

  // 리프레시
  refresh: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useMemos(initialFilter?: MemoFilter): UseMemosReturn {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [filter, setFilter] = useState<MemoFilter>(
    initialFilter || { organized: 'all' }
  );
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ----------------------------------------
  // Live Query - 실시간 데이터 동기화
  // ----------------------------------------

  const allMemos = useLiveQuery(
    async () => {
      try {
        return await db.memos.orderBy('createdAt').reverse().toArray();
      } catch (err) {
        setError(err as Error);
        return [];
      }
    },
    [refreshKey]
  );

  // ----------------------------------------
  // Computed Values
  // ----------------------------------------

  // 필터링된 메모
  const memos = useMemo(() => {
    if (!allMemos) return [];

    let filtered = [...allMemos];

    // 정리 상태 필터
    if (filter.organized !== 'all' && filter.organized !== undefined) {
      filtered = filtered.filter((m) => m.organized === filter.organized);
    }

    // 콘텐츠 필터
    if (filter.contentId) {
      filtered = filtered.filter((m) => m.contentId === filter.contentId);
    }

    // 세션 필터
    if (filter.sessionId) {
      filtered = filtered.filter((m) => m.sessionId === filter.sessionId);
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((m) =>
        filter.tags!.some((tag) => m.tags.includes(tag))
      );
    }

    // 검색 필터
    if (filter.search && filter.search.trim()) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter((m) =>
        m.text.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allMemos, filter]);

  // 정리 안 된 메모
  const unorganizedMemos = useMemo(
    () => allMemos?.filter((m) => !m.organized) || [],
    [allMemos]
  );

  // 최근 메모 (5개)
  const recentMemos = useMemo(
    () => allMemos?.slice(0, 5) || [],
    [allMemos]
  );

  // 통계
  const stats = useMemo(() => {
    if (!allMemos) {
      return { total: 0, organized: 0, unorganized: 0 };
    }

    const organized = allMemos.filter((m) => m.organized).length;
    return {
      total: allMemos.length,
      organized,
      unorganized: allMemos.length - organized,
    };
  }, [allMemos]);

  // ----------------------------------------
  // CRUD Operations
  // ----------------------------------------

  /**
   * 메모 추가
   */
  const addMemo = useCallback(
    async (input: CreateMemoInput): Promise<Memo> => {
      try {
        const newMemo: Memo = {
          id: crypto.randomUUID(),
          text: input.text,
          contentId: input.contentId,
          sessionId: input.sessionId,
          tags: input.tags || [],
          organized: false,
          createdAt: new Date(),
        };

        await db.memos.add(newMemo);
        setError(null);

        return newMemo;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 메모 수정
   */
  const updateMemo = useCallback(
    async (id: string, updates: Partial<Memo>): Promise<void> => {
      try {
        await db.memos.update(id, updates);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 메모 삭제
   */
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      await db.memos.delete(id);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // ----------------------------------------
  // Organization Status
  // ----------------------------------------

  /**
   * 정리 완료로 표시
   */
  const markAsOrganized = useCallback(
    async (id: string): Promise<void> => {
      await updateMemo(id, { organized: true });
    },
    [updateMemo]
  );

  /**
   * 미정리로 표시
   */
  const markAsUnorganized = useCallback(
    async (id: string): Promise<void> => {
      await updateMemo(id, { organized: false });
    },
    [updateMemo]
  );

  // ----------------------------------------
  // Refresh
  // ----------------------------------------

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    // 데이터
    memos,
    loading: allMemos === undefined,
    error,

    // CRUD
    addMemo,
    updateMemo,
    deleteMemo,

    // 정리 상태
    markAsOrganized,
    markAsUnorganized,

    // 필터링
    filter,
    setFilter,

    // 유틸리티
    unorganizedMemos,
    unorganizedCount: unorganizedMemos.length,
    recentMemos,

    // 통계
    stats,

    // 리프레시
    refresh,
  };
}

// ============================================
// Utility Hooks
// ============================================

/**
 * 특정 콘텐츠의 메모 조회 훅
 */
export function useMemosByContent(contentId: string | null) {
  const memos = useLiveQuery(
    async () => {
      if (!contentId) return [];
      return db.memos
        .where('contentId')
        .equals(contentId)
        .reverse()
        .sortBy('createdAt');
    },
    [contentId]
  );

  return {
    memos: memos || [],
    loading: memos === undefined,
    count: memos?.length || 0,
  };
}

/**
 * 특정 세션의 메모 조회 훅
 */
export function useMemosBySession(sessionId: string | null) {
  const memos = useLiveQuery(
    async () => {
      if (!sessionId) return [];
      return db.memos
        .where('sessionId')
        .equals(sessionId)
        .reverse()
        .sortBy('createdAt');
    },
    [sessionId]
  );

  return {
    memos: memos || [],
    loading: memos === undefined,
    count: memos?.length || 0,
  };
}

/**
 * 정리 안 된 메모만 조회하는 훅
 */
export function useUnorganizedMemos() {
  const { memos, loading, stats, markAsOrganized } = useMemos({
    organized: false,
  });

  return {
    memos,
    loading,
    count: stats.unorganized,
    markAsOrganized,
  };
}
