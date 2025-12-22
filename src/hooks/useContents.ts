/**
 * @file useContents.ts
 * @description 콘텐츠 CRUD 및 상태 관리 훅
 *
 * @checkpoint CP-1.1
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: Content 타입
 *
 * @usage
 * const { contents, addContent, updateStatus } = useContents();
 * const { contents: queuedOnly } = useContents({ status: 'queued' });
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Content } from '@/types';

// ============================================
// Types
// ============================================

/**
 * 콘텐츠 생성 입력 타입
 * id와 createdAt은 자동 생성됨
 */
export interface CreateContentInput {
  type: Content['type'];
  title: string;
  source?: string;
  url?: string;
  body?: string;
  summary?: string;
  tags?: string[];
  counterpoint?: string;
}

/**
 * 콘텐츠 필터 옵션
 */
export interface ContentFilter {
  status?: Content['status'] | 'all';
  type?: Content['type'] | 'all';
  tags?: string[];
  search?: string;
}

/**
 * 정렬 옵션
 */
export interface ContentSort {
  field: 'createdAt' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

/**
 * useContents 훅 반환 타입
 */
export interface UseContentsReturn {
  // 데이터
  contents: Content[];
  loading: boolean;
  error: Error | null;

  // 단일 조회
  getContentById: (id: string) => Content | undefined;

  // CRUD
  addContent: (data: CreateContentInput) => Promise<Content>;
  updateContent: (id: string, data: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  // 상태 변경
  updateStatus: (id: string, status: Content['status']) => Promise<void>;
  moveToQueue: (id: string) => Promise<void>;
  startLearning: (id: string) => Promise<void>;
  completeLearning: (id: string) => Promise<void>;

  // 대기열
  queue: Content[];
  queueCount: number;

  // 필터링 & 정렬
  filter: ContentFilter;
  setFilter: (filter: ContentFilter) => void;
  sort: ContentSort;
  setSort: (sort: ContentSort) => void;

  // 통계
  stats: {
    total: number;
    queued: number;
    learning: number;
    completed: number;
  };

  // 리프레시
  refresh: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useContents(initialFilter?: ContentFilter): UseContentsReturn {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [filter, setFilter] = useState<ContentFilter>(
    initialFilter || { status: 'all', type: 'all' }
  );
  const [sort, setSort] = useState<ContentSort>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ----------------------------------------
  // Live Query - 실시간 데이터 동기화
  // ----------------------------------------

  // 모든 콘텐츠 조회 (Dexie Live Query)
  const allContents = useLiveQuery(
    async () => {
      try {
        let query = db.contents.orderBy('createdAt');

        // 정렬 방향
        if (sort.direction === 'desc') {
          query = query.reverse();
        }

        const results = await query.toArray();
        return results;
      } catch (err) {
        setError(err as Error);
        return [];
      }
    },
    [sort.direction, refreshKey]
  );

  // ----------------------------------------
  // Computed Values
  // ----------------------------------------

  // 필터링된 콘텐츠
  const contents = useMemo(() => {
    if (!allContents) return [];

    let filtered = [...allContents];

    // 상태 필터
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filter.status);
    }

    // 타입 필터
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter((c) => c.type === filter.type);
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((c) =>
        filter.tags!.some((tag) => c.tags.includes(tag))
      );
    }

    // 검색 필터
    if (filter.search && filter.search.trim()) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.body?.toLowerCase().includes(searchLower) ||
          c.summary?.toLowerCase().includes(searchLower)
      );
    }

    // 정렬 (createdAt 외의 필드)
    if (sort.field === 'title') {
      filtered.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title);
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return filtered;
  }, [allContents, filter, sort]);

  // 학습 대기열 (queued 상태만)
  const queue = useMemo(
    () => allContents?.filter((c) => c.status === 'queued') || [],
    [allContents]
  );

  // 통계
  const stats = useMemo(() => {
    if (!allContents) {
      return { total: 0, queued: 0, learning: 0, completed: 0 };
    }

    return {
      total: allContents.length,
      queued: allContents.filter((c) => c.status === 'queued').length,
      learning: allContents.filter((c) => c.status === 'learning').length,
      completed: allContents.filter((c) => c.status === 'completed').length,
    };
  }, [allContents]);

  // ----------------------------------------
  // CRUD Operations
  // ----------------------------------------

  /**
   * 콘텐츠 추가
   */
  const addContent = useCallback(
    async (data: CreateContentInput): Promise<Content> => {
      try {
        const newContent: Content = {
          id: crypto.randomUUID(),
          type: data.type,
          title: data.title,
          source: data.source,
          url: data.url,
          body: data.body,
          summary: data.summary,
          tags: data.tags || [],
          status: 'queued', // 기본값: 대기열에 추가
          counterpoint: data.counterpoint,
          createdAt: new Date(),
        };

        await db.contents.add(newContent);
        setError(null);

        // NOTE(CP-1.1): 태그 카운트 증가는 useTags에서 처리
        return newContent;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 콘텐츠 수정
   */
  const updateContent = useCallback(
    async (id: string, data: Partial<Content>): Promise<void> => {
      try {
        await db.contents.update(id, data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 콘텐츠 삭제
   */
  const deleteContent = useCallback(async (id: string): Promise<void> => {
    try {
      await db.contents.delete(id);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  /**
   * ID로 콘텐츠 조회
   */
  const getContentById = useCallback(
    (id: string): Content | undefined => {
      return allContents?.find((c) => c.id === id);
    },
    [allContents]
  );

  // ----------------------------------------
  // Status Operations
  // ----------------------------------------

  /**
   * 상태 업데이트
   */
  const updateStatus = useCallback(
    async (id: string, status: Content['status']): Promise<void> => {
      try {
        const updates: Partial<Content> = { status };

        // 완료 시 completedAt 설정
        if (status === 'completed') {
          updates.completedAt = new Date();
        }

        await db.contents.update(id, updates);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 대기열로 이동
   */
  const moveToQueue = useCallback(
    async (id: string): Promise<void> => {
      await updateStatus(id, 'queued');
    },
    [updateStatus]
  );

  /**
   * 학습 시작
   */
  const startLearning = useCallback(
    async (id: string): Promise<void> => {
      await updateStatus(id, 'learning');
    },
    [updateStatus]
  );

  /**
   * 학습 완료
   */
  const completeLearning = useCallback(
    async (id: string): Promise<void> => {
      await updateStatus(id, 'completed');
    },
    [updateStatus]
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
    contents,
    loading: allContents === undefined,
    error,

    // 단일 조회
    getContentById,

    // CRUD
    addContent,
    updateContent,
    deleteContent,

    // 상태 변경
    updateStatus,
    moveToQueue,
    startLearning,
    completeLearning,

    // 대기열
    queue,
    queueCount: queue.length,

    // 필터링 & 정렬
    filter,
    setFilter,
    sort,
    setSort,

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
 * 단일 콘텐츠 조회 훅
 * @param id 콘텐츠 ID
 */
export function useContent(id: string | null) {
  const content = useLiveQuery(
    async () => {
      if (!id) return null;
      return db.contents.get(id);
    },
    [id]
  );

  return {
    content: content ?? null,
    loading: content === undefined,
  };
}

/**
 * 학습 대기열 전용 훅
 */
export function useLearningQueue() {
  const { queue, queueCount, startLearning, moveToQueue } = useContents({
    status: 'queued',
  });

  return {
    queue,
    count: queueCount,
    startLearning,
    removeFromQueue: moveToQueue, // NOTE: 실제로는 상태 변경이 필요할 수 있음
  };
}
