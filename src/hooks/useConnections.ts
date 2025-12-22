/**
 * @file useConnections.ts
 * @description 지식 연결 관리 훅
 *
 * @checkpoint CP-3.1
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - 연결 CRUD 작업
 * - 그래프 데이터 변환
 * - 패턴 분석
 * - 자동 연결 제안
 *
 * @dependencies
 * - src/lib/db.ts: Dexie 데이터베이스
 * - src/types/index.ts: Connection 타입
 */

import { useState, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Connection, Content, Memo, Tag } from '@/types';

// ============================================
// Types
// ============================================

/**
 * 연결 유형
 */
export type ConnectionType =
  | 'related'      // 관련됨
  | 'contrast'     // 대조/대척점
  | 'causes'       // 원인-결과
  | 'supports'     // 지지/보완
  | 'questions'    // 질문 제기
  | 'extends';     // 확장/발전

/**
 * 그래프 노드
 */
export interface GraphNode {
  id: string;
  type: 'content' | 'memo' | 'tag';
  label: string;
  group: number;
  size: number;
  data?: Content | Memo | Tag;
}

/**
 * 그래프 링크
 */
export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

/**
 * 그래프 데이터
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * 발견된 패턴
 */
export interface DiscoveredPattern {
  id: string;
  description: string;
  type: 'tag-cluster' | 'content-chain' | 'topic-bridge' | 'repeat-connection';
  relatedNodes: string[];
  strength: number;
  createdAt: Date;
}

/**
 * 연결 생성 입력
 */
export interface CreateConnectionInput {
  sourceId: string;
  targetId: string;
  sourceType: Connection['sourceType'];
  targetType: Connection['targetType'];
  relationship: string;
  strength?: number;
}

/**
 * useConnections 훅 반환 타입
 */
export interface UseConnectionsReturn {
  // 데이터
  connections: Connection[];
  loading: boolean;

  // 그래프 데이터
  graphData: GraphData;

  // 패턴
  patterns: DiscoveredPattern[];

  // CRUD
  addConnection: (input: CreateConnectionInput) => Promise<Connection>;
  updateConnection: (id: string, updates: Partial<Connection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;

  // 조회
  getConnectionsFor: (nodeId: string) => Connection[];
  getRelatedNodes: (nodeId: string) => GraphNode[];

  // 분석
  suggestConnections: (contentId: string) => Promise<SuggestedConnection[]>;
  analyzePatterns: () => DiscoveredPattern[];

  // 통계
  stats: ConnectionStats;
}

export interface SuggestedConnection {
  targetId: string;
  targetType: Connection['targetType'];
  targetLabel: string;
  reason: string;
  confidence: number; // 0-1
}

export interface ConnectionStats {
  totalConnections: number;
  byType: Record<string, number>;
  avgStrength: number;
  mostConnectedNode: { id: string; label: string; count: number } | null;
}

// ============================================
// Constants
// ============================================

const CONNECTION_TYPES: Record<ConnectionType, { label: string; color: string }> = {
  related: { label: '관련', color: 'cyan' },
  contrast: { label: '대조', color: 'magenta' },
  causes: { label: '원인→결과', color: 'amber' },
  supports: { label: '지지', color: 'green' },
  questions: { label: '질문', color: 'orange' },
  extends: { label: '확장', color: 'blue' },
};

// ============================================
// Hook Implementation
// ============================================

export function useConnections(): UseConnectionsReturn {
  // ----------------------------------------
  // State
  // ----------------------------------------
  const [patterns, setPatterns] = useState<DiscoveredPattern[]>([]);

  // ----------------------------------------
  // Live Queries
  // ----------------------------------------

  // 모든 연결 조회
  const connections = useLiveQuery(
    async () => db.connections.orderBy('createdAt').reverse().toArray(),
    []
  ) || [];

  // 모든 콘텐츠 조회 (그래프 노드용)
  const contents = useLiveQuery(
    async () => db.contents.toArray(),
    []
  ) || [];

  // 모든 메모 조회 (그래프 노드용)
  const memos = useLiveQuery(
    async () => db.memos.toArray(),
    []
  ) || [];

  // 모든 태그 조회 (그래프 노드용)
  const tags = useLiveQuery(
    async () => db.tags.toArray(),
    []
  ) || [];

  const loading = connections === undefined;

  // ----------------------------------------
  // Graph Data
  // ----------------------------------------

  const graphData = useMemo((): GraphData => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 콘텐츠 노드 추가
    contents.forEach((content, idx) => {
      nodes.push({
        id: content.id,
        type: 'content',
        label: content.title,
        group: 1,
        size: getNodeSize(content.id, connections),
        data: content,
      });
    });

    // 메모 노드 추가 (연결된 것만)
    const connectedMemoIds = new Set(
      connections
        .filter(c => c.sourceType === 'memo' || c.targetType === 'memo')
        .flatMap(c => [c.sourceId, c.targetId])
    );

    memos.forEach((memo) => {
      if (connectedMemoIds.has(memo.id)) {
        nodes.push({
          id: memo.id,
          type: 'memo',
          label: memo.text.slice(0, 30) + (memo.text.length > 30 ? '...' : ''),
          group: 2,
          size: getNodeSize(memo.id, connections),
          data: memo,
        });
      }
    });

    // 태그 노드 추가 (연결된 것만)
    const connectedTagIds = new Set(
      connections
        .filter(c => c.sourceType === 'tag' || c.targetType === 'tag')
        .flatMap(c => [c.sourceId, c.targetId])
    );

    tags.forEach((tag) => {
      if (connectedTagIds.has(tag.id) || tag.count >= 2) {
        nodes.push({
          id: tag.id,
          type: 'tag',
          label: `#${tag.name}`,
          group: 3,
          size: Math.min(tag.count * 5 + 10, 40),
          data: tag,
        });
      }
    });

    // 링크 추가
    connections.forEach((conn) => {
      links.push({
        source: conn.sourceId,
        target: conn.targetId,
        relationship: conn.relationship,
        strength: conn.strength,
      });
    });

    return { nodes, links };
  }, [connections, contents, memos, tags]);

  // ----------------------------------------
  // CRUD Operations
  // ----------------------------------------

  const addConnection = useCallback(
    async (input: CreateConnectionInput): Promise<Connection> => {
      // 중복 체크
      const existing = await db.connections
        .where('sourceId')
        .equals(input.sourceId)
        .and(c => c.targetId === input.targetId)
        .first();

      if (existing) {
        // 기존 연결 강도 증가
        await db.connections.update(existing.id, {
          strength: Math.min(existing.strength + 1, 10),
        });
        return { ...existing, strength: Math.min(existing.strength + 1, 10) };
      }

      const newConnection: Connection = {
        id: crypto.randomUUID(),
        sourceId: input.sourceId,
        targetId: input.targetId,
        sourceType: input.sourceType,
        targetType: input.targetType,
        relationship: input.relationship,
        strength: input.strength || 5,
        createdAt: new Date(),
      };

      await db.connections.add(newConnection);
      return newConnection;
    },
    []
  );

  const updateConnection = useCallback(
    async (id: string, updates: Partial<Connection>): Promise<void> => {
      await db.connections.update(id, updates);
    },
    []
  );

  const deleteConnection = useCallback(
    async (id: string): Promise<void> => {
      await db.connections.delete(id);
    },
    []
  );

  // ----------------------------------------
  // Query Operations
  // ----------------------------------------

  const getConnectionsFor = useCallback(
    (nodeId: string): Connection[] => {
      return connections.filter(
        c => c.sourceId === nodeId || c.targetId === nodeId
      );
    },
    [connections]
  );

  const getRelatedNodes = useCallback(
    (nodeId: string): GraphNode[] => {
      const relatedIds = new Set<string>();

      connections.forEach(c => {
        if (c.sourceId === nodeId) relatedIds.add(c.targetId);
        if (c.targetId === nodeId) relatedIds.add(c.sourceId);
      });

      return graphData.nodes.filter(n => relatedIds.has(n.id));
    },
    [connections, graphData.nodes]
  );

  // ----------------------------------------
  // Analysis Operations
  // ----------------------------------------

  const suggestConnections = useCallback(
    async (contentId: string): Promise<SuggestedConnection[]> => {
      const suggestions: SuggestedConnection[] = [];
      const content = await db.contents.get(contentId);

      if (!content) return suggestions;

      // 같은 태그를 가진 콘텐츠 찾기
      for (const tag of content.tags) {
        const relatedContents = await db.contents
          .filter(c => c.id !== contentId && c.tags.includes(tag))
          .toArray();

        for (const related of relatedContents) {
          // 이미 연결되어 있는지 확인
          const existingConn = connections.find(
            c =>
              (c.sourceId === contentId && c.targetId === related.id) ||
              (c.sourceId === related.id && c.targetId === contentId)
          );

          if (!existingConn) {
            suggestions.push({
              targetId: related.id,
              targetType: 'content',
              targetLabel: related.title,
              reason: `'${tag}' 태그 공유`,
              confidence: 0.7,
            });
          }
        }
      }

      // 대척점이 있는 콘텐츠와 연결 제안
      if (content.counterpoint) {
        const contrastContent = contents.find(
          c => c.id !== contentId && c.counterpoint && c.tags.some(t => content.tags.includes(t))
        );

        if (contrastContent) {
          suggestions.push({
            targetId: contrastContent.id,
            targetType: 'content',
            targetLabel: contrastContent.title,
            reason: '대척점 관점 비교',
            confidence: 0.8,
          });
        }
      }

      // 중복 제거 및 상위 5개만 반환
      const uniqueSuggestions = suggestions.reduce((acc, curr) => {
        if (!acc.find(s => s.targetId === curr.targetId)) {
          acc.push(curr);
        }
        return acc;
      }, [] as SuggestedConnection[]);

      return uniqueSuggestions.slice(0, 5);
    },
    [connections, contents]
  );

  const analyzePatterns = useCallback((): DiscoveredPattern[] => {
    const discoveredPatterns: DiscoveredPattern[] = [];

    // 태그 클러스터 분석
    const tagConnectionCounts = new Map<string, number>();
    connections.forEach(c => {
      if (c.sourceType === 'tag') {
        tagConnectionCounts.set(c.sourceId, (tagConnectionCounts.get(c.sourceId) || 0) + 1);
      }
      if (c.targetType === 'tag') {
        tagConnectionCounts.set(c.targetId, (tagConnectionCounts.get(c.targetId) || 0) + 1);
      }
    });

    tagConnectionCounts.forEach((count, tagId) => {
      if (count >= 3) {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
          discoveredPatterns.push({
            id: `pattern-${tagId}`,
            description: `'${tag.name}' 태그가 ${count}개의 콘텐츠를 연결합니다`,
            type: 'tag-cluster',
            relatedNodes: [tagId],
            strength: Math.min(count / 10, 1),
            createdAt: new Date(),
          });
        }
      }
    });

    // 반복 연결 패턴 분석
    const relationshipCounts = new Map<string, number>();
    connections.forEach(c => {
      relationshipCounts.set(c.relationship, (relationshipCounts.get(c.relationship) || 0) + 1);
    });

    relationshipCounts.forEach((count, relationship) => {
      if (count >= 3) {
        discoveredPatterns.push({
          id: `pattern-rel-${relationship}`,
          description: `'${relationship}' 연결이 ${count}번 반복됩니다`,
          type: 'repeat-connection',
          relatedNodes: connections
            .filter(c => c.relationship === relationship)
            .flatMap(c => [c.sourceId, c.targetId]),
          strength: Math.min(count / 10, 1),
          createdAt: new Date(),
        });
      }
    });

    setPatterns(discoveredPatterns);
    return discoveredPatterns;
  }, [connections, tags]);

  // ----------------------------------------
  // Statistics
  // ----------------------------------------

  const stats = useMemo((): ConnectionStats => {
    if (connections.length === 0) {
      return {
        totalConnections: 0,
        byType: {},
        avgStrength: 0,
        mostConnectedNode: null,
      };
    }

    // 유형별 카운트
    const byType: Record<string, number> = {};
    connections.forEach(c => {
      byType[c.relationship] = (byType[c.relationship] || 0) + 1;
    });

    // 평균 강도
    const avgStrength =
      connections.reduce((sum, c) => sum + c.strength, 0) / connections.length;

    // 가장 많이 연결된 노드
    const nodeCounts = new Map<string, number>();
    connections.forEach(c => {
      nodeCounts.set(c.sourceId, (nodeCounts.get(c.sourceId) || 0) + 1);
      nodeCounts.set(c.targetId, (nodeCounts.get(c.targetId) || 0) + 1);
    });

    let mostConnectedNode: ConnectionStats['mostConnectedNode'] = null;
    let maxCount = 0;

    nodeCounts.forEach((count, nodeId) => {
      if (count > maxCount) {
        maxCount = count;
        const node = graphData.nodes.find(n => n.id === nodeId);
        mostConnectedNode = {
          id: nodeId,
          label: node?.label || nodeId,
          count,
        };
      }
    });

    return {
      totalConnections: connections.length,
      byType,
      avgStrength,
      mostConnectedNode,
    };
  }, [connections, graphData.nodes]);

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    // 데이터
    connections,
    loading,

    // 그래프 데이터
    graphData,

    // 패턴
    patterns,

    // CRUD
    addConnection,
    updateConnection,
    deleteConnection,

    // 조회
    getConnectionsFor,
    getRelatedNodes,

    // 분석
    suggestConnections,
    analyzePatterns,

    // 통계
    stats,
  };
}

// ============================================
// Utility Functions
// ============================================

function getNodeSize(nodeId: string, connections: Connection[]): number {
  const count = connections.filter(
    c => c.sourceId === nodeId || c.targetId === nodeId
  ).length;
  return Math.min(count * 5 + 15, 50);
}

// ============================================
// Export Constants
// ============================================

export { CONNECTION_TYPES };
