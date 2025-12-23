/**
 * @file ConnectPage.tsx
 * @description Connect 페이지 - 지식 연결 및 패턴 발견
 *
 * @checkpoint CP-3.5
 * @created 2025-12-21
 * @updated 2025-12-22
 *
 * @features
 * - 지식 그래프 시각화
 * - 연결 목록
 * - 패턴 분석
 * - 태그 클라우드
 * - 크로스 인사이트
 */

import { useState, useCallback } from 'react';
import {
  GitBranch,
  Sparkles,
  Tag as TagIcon,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import { KnowledgeGraph, ConnectionCard, PatternList, AIPatternAnalysis } from '@/components/connect';
import { useConnections, useTags } from '@/hooks';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import type { GraphNode, DiscoveredPattern } from '@/hooks/useConnections';

// ============================================
// Component
// ============================================

export function ConnectPage() {
  const { openModal } = useStore();

  // ----------------------------------------
  // Hooks
  // ----------------------------------------

  const {
    connections,
    graphData,
    patterns,
    stats,
    analyzePatterns,
    deleteConnection,
  } = useConnections();

  const { tags } = useTags();

  // ----------------------------------------
  // State
  // ----------------------------------------

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      analyzePatterns();
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzePatterns]);

  const handlePatternClick = useCallback((pattern: DiscoveredPattern) => {
    console.log('Pattern clicked:', pattern);
  }, []);

  const handleDeleteConnection = useCallback(
    async (id: string) => {
      if (window.confirm('이 연결을 삭제할까요?')) {
        await deleteConnection(id);
      }
    },
    [deleteConnection]
  );

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className="space-y-6 py-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Connect</h1>
          <p className="text-sm text-[var(--text-muted)]">
            점들을 연결하고 패턴을 발견해요
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal('addConnection')}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          연결 추가
        </Button>
      </div>

      {/* 통계 */}
      {stats.totalConnections > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="연결"
            value={stats.totalConnections}
            icon={GitBranch}
            color="cyan"
          />
          <StatCard
            label="평균 강도"
            value={stats.avgStrength.toFixed(1)}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            label="패턴"
            value={patterns.length}
            icon={Sparkles}
            color="amber"
          />
        </div>
      )}

      {/* 지식 그래프 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              지식 그래프
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'graph' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('graph')}
            >
              그래프
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              목록
            </Button>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <KnowledgeGraph
            data={graphData}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id}
            height={350}
          />
        ) : (
          <div className="space-y-2">
            {connections.length === 0 ? (
              <div
                className={cn(
                  'p-6 rounded-xl text-center',
                  'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
                )}
              >
                <EmptyState
                  icon={GitBranch}
                  title="아직 연결이 없어요"
                  description="학습을 진행하면 지식 간의 연결이 생성됩니다"
                  className="py-4"
                />
              </div>
            ) : (
              connections.slice(0, 5).map((conn) => {
                const sourceNode = graphData.nodes.find(n => n.id === conn.sourceId);
                const targetNode = graphData.nodes.find(n => n.id === conn.targetId);
                return (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    sourceLabel={sourceNode?.label || conn.sourceId}
                    targetLabel={targetNode?.label || conn.targetId}
                    onDelete={() => handleDeleteConnection(conn.id)}
                    compact
                  />
                );
              })
            )}
            {connections.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[var(--text-muted)]"
                onClick={() => openModal('allConnections')}
              >
                +{connections.length - 5}개 더보기
              </Button>
            )}
          </div>
        )}
      </section>

      {/* 발견된 패턴 */}
      <section>
        <PatternList
          patterns={patterns}
          onPatternClick={handlePatternClick}
          onAnalyzeRequest={handleAnalyze}
          loading={isAnalyzing}
        />
      </section>

      {/* AI 패턴 분석 */}
      <section>
        <AIPatternAnalysis />
      </section>

      {/* 태그 클라우드 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TagIcon className="w-5 h-5 text-[var(--accent-magenta)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            태그 클라우드
          </h2>
        </div>

        <div
          className={cn(
            'p-4 rounded-xl',
            'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
          )}
        >
          {tags.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              학습 내용에 태그를 추가해보세요
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags
                .sort((a, b) => b.count - a.count)
                .slice(0, 20)
                .map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedNode({
                        id: tag.id,
                        type: 'tag',
                        label: `#${tag.name}`,
                        group: 3,
                        size: 20,
                        data: tag,
                      });
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-all',
                      'hover:scale-105',
                      selectedNode?.id === tag.id
                        ? 'bg-[var(--accent-magenta)] text-white'
                        : 'bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)]'
                    )}
                    style={{
                      fontSize: `${Math.max(12, Math.min(18, tag.count * 2 + 10))}px`,
                    }}
                  >
                    #{tag.name}
                    <span className="ml-1.5 opacity-60">{tag.count}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* 크로스 인사이트 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[var(--accent-green)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            크로스 인사이트
          </h2>
        </div>

        <div
          className={cn(
            'p-4 rounded-xl',
            'bg-gradient-to-br from-[var(--accent-green)]/10 to-[var(--accent-cyan)]/10',
            'border border-[var(--accent-green)]/20'
          )}
        >
          {stats.mostConnectedNode ? (
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-[var(--accent-green)]/20'
                )}
              >
                <Sparkles className="w-5 h-5 text-[var(--accent-green)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  핵심 연결점 발견!
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  <strong className="text-[var(--accent-green)]">
                    "{stats.mostConnectedNode.label}"
                  </strong>
                  이(가) {stats.mostConnectedNode.count}개의 다른 지식과 연결되어 있어요.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              다양한 분야를 학습하면 AI가 예상치 못한 연결점을 발견해드려요.
              서로 다른 주제들이 어떻게 연결되는지 확인해보세요.
            </p>
          )}
        </div>
      </section>

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <section>
          <div
            className={cn(
              'p-4 rounded-xl',
              'bg-[var(--bg-secondary)] border border-[var(--accent-cyan)]/30'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                선택된 노드
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="text-[var(--text-muted)]"
              >
                닫기
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  selectedNode.type === 'content' && 'bg-[var(--accent-cyan)]/10',
                  selectedNode.type === 'memo' && 'bg-[var(--accent-amber)]/10',
                  selectedNode.type === 'tag' && 'bg-[var(--accent-magenta)]/10'
                )}
              >
                <span className="text-2xl">
                  {selectedNode.type === 'content'
                    ? '📄'
                    : selectedNode.type === 'memo'
                    ? '📝'
                    : '🏷️'}
                </span>
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {selectedNode.label}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedNode.type === 'content'
                    ? '콘텐츠'
                    : selectedNode.type === 'memo'
                    ? '메모'
                    : '태그'}
                  {' · '}
                  {connections.filter(
                    c => c.sourceId === selectedNode.id || c.targetId === selectedNode.id
                  ).length}
                  개 연결
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof GitBranch;
  color: 'cyan' | 'green' | 'amber' | 'magenta';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]',
    green: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
    amber: 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]',
    magenta: 'bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)]',
  };

  return (
    <div
      className={cn(
        'p-3 rounded-xl',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;
