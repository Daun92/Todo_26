/**
 * @file KnowledgeGraph.tsx
 * @description D3.js 기반 지식 그래프 시각화 컴포넌트
 *
 * @checkpoint CP-3.2
 * @created 2025-12-22
 * @updated 2025-12-22
 *
 * @features
 * - Force-directed 그래프 레이아웃
 * - 노드 드래그 인터랙션
 * - 줌/팬 지원
 * - 노드 유형별 스타일링
 * - 연결 강도 시각화
 *
 * @dependencies
 * - d3: 그래프 시각화
 * - src/hooks/useConnections.ts: 그래프 데이터
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { GraphData, GraphNode, GraphLink } from '@/hooks/useConnections';

// ============================================
// Types
// ============================================

interface KnowledgeGraphProps {
  /** 그래프 데이터 */
  data: GraphData;
  /** 노드 클릭 핸들러 */
  onNodeClick?: (node: GraphNode) => void;
  /** 링크 클릭 핸들러 */
  onLinkClick?: (link: GraphLink) => void;
  /** 선택된 노드 ID */
  selectedNodeId?: string | null;
  /** 높이 */
  height?: number;
  /** 클래스명 */
  className?: string;
}

// D3 시뮬레이션용 확장 타입
interface SimNode extends GraphNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends Omit<GraphLink, 'source' | 'target'> {
  source: SimNode | string;
  target: SimNode | string;
}

// ============================================
// Constants
// ============================================

const NODE_COLORS: Record<string, string> = {
  content: 'var(--accent-cyan)',
  memo: 'var(--accent-amber)',
  tag: 'var(--accent-magenta)',
};

const GROUP_COLORS = [
  'var(--accent-cyan)',
  'var(--accent-amber)',
  'var(--accent-magenta)',
  'var(--accent-green)',
];

// ============================================
// Component
// ============================================

export function KnowledgeGraph({
  data,
  onNodeClick,
  onLinkClick,
  selectedNodeId,
  height = 400,
  className,
}: KnowledgeGraphProps) {
  // ----------------------------------------
  // Refs
  // ----------------------------------------
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  // ----------------------------------------
  // State
  // ----------------------------------------
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // ----------------------------------------
  // Resize Observer
  // ----------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  // ----------------------------------------
  // D3 Graph Rendering
  // ----------------------------------------
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width } = dimensions;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create container group for zoom/pan
    const container = svg.append('g').attr('class', 'graph-container');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Prepare data copies for simulation
    const nodes: SimNode[] = data.nodes.map(d => ({ ...d }));
    const links: SimLink[] = data.links.map(d => ({ ...d }));

    // Create force simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links)
        .id(d => d.id)
        .distance(d => 100 - (d.strength || 5) * 5)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => (d.size || 20) + 10));

    simulationRef.current = simulation;

    // Create arrow marker for directed links
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', 'var(--border-default)');

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--border-default)')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength || 1))
      .attr('marker-end', 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onLinkClick?.(d as GraphLink);
      });

    // Create link labels
    const linkLabel = container.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-muted)')
      .attr('text-anchor', 'middle')
      .text(d => d.relationship);

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d as GraphNode);
      });

    // Node circles
    node.append('circle')
      .attr('r', d => d.size / 2)
      .attr('fill', d => NODE_COLORS[d.type] || GROUP_COLORS[d.group % GROUP_COLORS.length])
      .attr('fill-opacity', 0.8)
      .attr('stroke', d => d.id === selectedNodeId ? 'white' : 'none')
      .attr('stroke-width', d => d.id === selectedNodeId ? 3 : 0);

    // Node labels
    node.append('text')
      .text(d => d.label)
      .attr('font-size', d => Math.max(10, d.size / 3))
      .attr('fill', 'var(--text-primary)')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size / 2 + 14)
      .style('pointer-events', 'none');

    // Node type indicator
    node.append('text')
      .text(d => d.type === 'content' ? '📄' : d.type === 'memo' ? '📝' : '🏷️')
      .attr('font-size', d => Math.max(8, d.size / 4))
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .style('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x || 0)
        .attr('y1', d => (d.source as SimNode).y || 0)
        .attr('x2', d => (d.target as SimNode).x || 0)
        .attr('y2', d => (d.target as SimNode).y || 0);

      linkLabel
        .attr('x', d => (((d.source as SimNode).x || 0) + ((d.target as SimNode).x || 0)) / 2)
        .attr('y', d => (((d.source as SimNode).y || 0) + ((d.target as SimNode).y || 0)) / 2);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, selectedNodeId, onNodeClick, onLinkClick]);

  // ----------------------------------------
  // Controls
  // ----------------------------------------
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.3
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.7
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  }, []);

  const handleRefresh = useCallback(() => {
    simulationRef.current?.alpha(1).restart();
  }, []);

  // ----------------------------------------
  // Empty State
  // ----------------------------------------
  if (data.nodes.length === 0) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center rounded-xl',
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-[var(--text-muted)]">
            아직 연결된 지식이 없어요
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            학습을 진행하면 지식 그래프가 생성됩니다
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]',
        className
      )}
    >
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="w-8 h-8 p-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="w-8 h-8 p-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="w-8 h-8 p-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="w-8 h-8 p-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.content }}
          />
          <span className="text-xs text-[var(--text-muted)]">콘텐츠</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.memo }}
          />
          <span className="text-xs text-[var(--text-muted)]">메모</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.tag }}
          />
          <span className="text-xs text-[var(--text-muted)]">태그</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-3 left-3 z-10">
        <div className="px-2 py-1 rounded bg-[var(--bg-primary)]/80 backdrop-blur-sm">
          <span className="text-xs text-[var(--text-muted)]">
            {data.nodes.length}개 노드 · {data.links.length}개 연결
          </span>
        </div>
      </div>

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={height}
        style={{ display: 'block' }}
      />
    </div>
  );
}

// ============================================
// Drag Behavior
// ============================================

function drag(simulation: d3.Simulation<SimNode, SimLink>) {
  function dragstarted(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag<SVGGElement, SimNode>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
