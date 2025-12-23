/**
 * @file useTags.ts
 * @description 태그 CRUD 및 검색 훅
 *
 * @checkpoint CP-1.2
 * @created 2025-12-21
 * @updated 2025-12-21
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: Tag 타입
 *
 * @usage
 * const { tags, addTag, searchTags } = useTags();
 * const suggestions = searchTags('경제');
 */

import { useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteTagWithCascade } from '@/lib/db';
import type { Tag } from '@/types';

// ============================================
// Types
// ============================================

/**
 * 태그 생성 입력 타입
 */
export interface CreateTagInput {
  name: string;
  category?: Tag['category'];
}

/**
 * useTags 훅 반환 타입
 */
export interface UseTagsReturn {
  // 데이터
  tags: Tag[];
  loading: boolean;
  error: Error | null;

  // CRUD
  addTag: (name: string, category?: Tag['category']) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  updateTagCount: (id: string, delta: number) => Promise<void>;

  // 검색 & 필터
  searchTags: (query: string) => Tag[];
  getPopularTags: (limit?: number) => Tag[];
  getTagsByCategory: (category: Tag['category']) => Tag[];

  // 유틸리티
  getTagByName: (name: string) => Tag | undefined;
  getOrCreateTag: (name: string, category?: Tag['category']) => Promise<Tag>;
  ensureTags: (names: string[]) => Promise<Tag[]>;

  // 리프레시
  refresh: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useTags(): UseTagsReturn {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ----------------------------------------
  // Live Query - 실시간 데이터 동기화
  // ----------------------------------------

  const tags = useLiveQuery(
    async () => {
      try {
        // count 기준 내림차순 정렬 (인기순)
        return await db.tags.orderBy('count').reverse().toArray();
      } catch (err) {
        setError(err as Error);
        return [];
      }
    },
    [refreshKey]
  );

  // ----------------------------------------
  // CRUD Operations
  // ----------------------------------------

  /**
   * 태그 추가
   * 이미 존재하는 태그명이면 기존 태그 반환
   */
  const addTag = useCallback(
    async (
      name: string,
      category: Tag['category'] = 'custom'
    ): Promise<Tag> => {
      try {
        // 정규화: 소문자, 공백 제거
        const normalizedName = name.trim().toLowerCase();

        if (!normalizedName) {
          throw new Error('태그 이름은 비워둘 수 없습니다.');
        }

        // 기존 태그 확인
        const existing = await db.tags.where('name').equals(normalizedName).first();

        if (existing) {
          return existing;
        }

        // 새 태그 생성
        const newTag: Tag = {
          id: crypto.randomUUID(),
          name: normalizedName,
          category,
          count: 0,
          createdAt: new Date(),
        };

        await db.tags.add(newTag);
        setError(null);

        return newTag;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  /**
   * 태그 삭제 (연쇄 처리 포함)
   * - 연관된 콘텐츠에서 태그 제거
   * - 연관된 메모에서 태그 제거
   * - 연관된 연결 삭제
   */
  const deleteTag = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteTagWithCascade(id);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  /**
   * 태그 사용 카운트 업데이트
   * @param id 태그 ID
   * @param delta 변경량 (+1 또는 -1)
   */
  const updateTagCount = useCallback(
    async (id: string, delta: number): Promise<void> => {
      try {
        const tag = await db.tags.get(id);
        if (tag) {
          const newCount = Math.max(0, tag.count + delta);
          await db.tags.update(id, { count: newCount });
        }
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  // ----------------------------------------
  // Search & Filter
  // ----------------------------------------

  /**
   * 태그 검색 (자동완성용)
   */
  const searchTags = useCallback(
    (query: string): Tag[] => {
      if (!tags || !query.trim()) {
        return tags || [];
      }

      const queryLower = query.toLowerCase().trim();

      return tags.filter((tag) => tag.name.includes(queryLower));
    },
    [tags]
  );

  /**
   * 인기 태그 조회
   */
  const getPopularTags = useCallback(
    (limit: number = 10): Tag[] => {
      if (!tags) return [];

      // 이미 count 기준 정렬되어 있음
      return tags.slice(0, limit);
    },
    [tags]
  );

  /**
   * 카테고리별 태그 조회
   */
  const getTagsByCategory = useCallback(
    (category: Tag['category']): Tag[] => {
      if (!tags) return [];

      return tags.filter((tag) => tag.category === category);
    },
    [tags]
  );

  // ----------------------------------------
  // Utility Functions
  // ----------------------------------------

  /**
   * 이름으로 태그 조회
   */
  const getTagByName = useCallback(
    (name: string): Tag | undefined => {
      if (!tags) return undefined;

      const normalizedName = name.trim().toLowerCase();
      return tags.find((tag) => tag.name === normalizedName);
    },
    [tags]
  );

  /**
   * 태그 조회 또는 생성
   * 존재하면 기존 태그 반환, 없으면 생성
   */
  const getOrCreateTag = useCallback(
    async (name: string, category: Tag['category'] = 'custom'): Promise<Tag> => {
      const existing = getTagByName(name);
      if (existing) {
        return existing;
      }
      return addTag(name, category);
    },
    [getTagByName, addTag]
  );

  /**
   * 여러 태그를 한 번에 확인/생성
   * @param names 태그 이름 배열
   * @returns 생성된/기존 태그 배열
   */
  const ensureTags = useCallback(
    async (names: string[]): Promise<Tag[]> => {
      const results: Tag[] = [];

      for (const name of names) {
        if (name.trim()) {
          const tag = await getOrCreateTag(name);
          results.push(tag);
        }
      }

      return results;
    },
    [getOrCreateTag]
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
    tags: tags || [],
    loading: tags === undefined,
    error,

    // CRUD
    addTag,
    deleteTag,
    updateTagCount,

    // 검색 & 필터
    searchTags,
    getPopularTags,
    getTagsByCategory,

    // 유틸리티
    getTagByName,
    getOrCreateTag,
    ensureTags,

    // 리프레시
    refresh,
  };
}

// ============================================
// Preset Tags
// ============================================

/**
 * 기본 제공 태그 목록
 * 앱 초기화 시 사용
 */
export const PRESET_TAGS: Array<{ name: string; category: Tag['category'] }> = [
  // 주제 (topic)
  { name: '경제', category: 'topic' },
  { name: '투자', category: 'topic' },
  { name: '부동산', category: 'topic' },
  { name: 'IT', category: 'topic' },
  { name: '기술', category: 'topic' },
  { name: '심리학', category: 'topic' },
  { name: '철학', category: 'topic' },
  { name: '사회', category: 'topic' },
  { name: '정치', category: 'topic' },
  { name: '건강', category: 'topic' },
  { name: '명상', category: 'topic' },
  { name: '호흡', category: 'topic' },

  // 감정 (emotion)
  { name: '흥미로움', category: 'emotion' },
  { name: '공감', category: 'emotion' },
  { name: '의문', category: 'emotion' },
  { name: '영감', category: 'emotion' },

  // 행동 (action)
  { name: '적용하기', category: 'action' },
  { name: '더알아보기', category: 'action' },
  { name: '공유하기', category: 'action' },
];

/**
 * 기본 태그 초기화 함수
 * 앱 최초 실행 시 호출
 */
export async function initializePresetTags(): Promise<void> {
  const existingCount = await db.tags.count();

  // 이미 태그가 있으면 스킵
  if (existingCount > 0) {
    return;
  }

  // 기본 태그 추가
  const tagsToAdd: Tag[] = PRESET_TAGS.map((preset) => ({
    id: crypto.randomUUID(),
    name: preset.name,
    category: preset.category,
    count: 0,
    createdAt: new Date(),
  }));

  await db.tags.bulkAdd(tagsToAdd);
}
