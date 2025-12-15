import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, Sparkles, Loader2, TrendingUp, Lightbulb, GitBranch } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal } from '@/components/ui';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { hasAPIKey } from '@/lib/claude';
import { analyzeCausality } from '@/lib/ai-services';
import type { CausalityAnalysis } from '@/lib/ai-services';
import type { Goal, Trigger, Insight, ChallengeLog, Journal } from '@/types';

interface GraphNode {
  id: string;
  type: 'goal' | 'trigger' | 'insight' | 'challenge';
  label: string;
  icon?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

export function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Analysis state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [causalityAnalysis, setCausalityAnalysis] = useState<CausalityAnalysis | null>(null);
  const [analysisData, setAnalysisData] = useState<{
    triggers: Trigger[];
    insights: Insight[];
    goals: Goal[];
    journals: Journal[];
  }>({ triggers: [], insights: [], goals: [], journals: [] });

  // Load data and build graph
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [goals, triggers, insights, challenges, journals] = await Promise.all([
        db.goals.toArray(),
        db.triggers.toArray(),
        db.insights.toArray(),
        db.challengeLogs.where('status').equals('completed').toArray(),
        db.journals.toArray(),
      ]);

      // Store data for AI analysis
      setAnalysisData({ triggers, insights, goals, journals });

      const graphNodes: GraphNode[] = [];
      const graphLinks: GraphLink[] = [];

      // Add goal nodes
      goals.forEach((goal) => {
        graphNodes.push({
          id: goal.id,
          type: 'goal',
          label: goal.title,
          icon: goal.icon,
        });
      });

      // Add challenge nodes (sample - last 10)
      challenges.slice(-10).forEach((challenge) => {
        graphNodes.push({
          id: challenge.id,
          type: 'challenge',
          label: challenge.title || 'Challenge',
          icon: '🏆',
        });

        // Link challenges to goals
        challenge.linkedGoals.forEach((goalId) => {
          graphLinks.push({
            source: challenge.id,
            target: goalId,
            type: 'contributes_to',
          });
        });
      });

      // Add trigger nodes
      triggers.forEach((trigger) => {
        graphNodes.push({
          id: trigger.id,
          type: 'trigger',
          label: trigger.title,
          icon: getTriggerIcon(trigger.type),
        });

        // Link triggers to goals
        trigger.linkedGoals.forEach((goalId) => {
          graphLinks.push({
            source: trigger.id,
            target: goalId,
            type: 'sparks',
          });
        });
      });

      // Add insight nodes
      insights.forEach((insight) => {
        graphNodes.push({
          id: insight.id,
          type: 'insight',
          label: insight.content.slice(0, 30) + '...',
          icon: '💡',
        });

        // Link insights to triggers
        if (insight.triggerId) {
          graphLinks.push({
            source: insight.triggerId,
            target: insight.id,
            type: 'generates',
          });
        }

        // Link insights to goals
        insight.linkedGoals.forEach((goalId) => {
          graphLinks.push({
            source: insight.id,
            target: goalId,
            type: 'improves',
          });
        });
      });

      setNodes(graphNodes);
      setLinks(graphLinks);
      setLoading(false);
    };

    load();
  }, []);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    svg.selectAll('*').remove();

    // Create container for zoom
    const container = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Color scale by type
    const colorScale: Record<string, string> = {
      goal: '#0ea5e9',
      trigger: '#f59e0b',
      insight: '#8b5cf6',
      challenge: '#10b981',
    };

    // Create simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1.5);

    // Node groups
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Node circles
    node.append('circle')
      .attr('r', (d) => d.type === 'goal' ? 24 : 18)
      .attr('fill', (d) => colorScale[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Node icons/labels
    node.append('text')
      .text((d) => d.icon || d.label[0])
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => d.type === 'goal' ? '16px' : '12px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Initial zoom to fit
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  const getTriggerIcon = (type: string) => {
    const icons: Record<string, string> = {
      book: '📚',
      article: '📰',
      lecture: '🎓',
      talk: '💬',
      code: '💻',
      paper: '📄',
      event: '🎯',
      failure: '❌',
      success: '✅',
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="animate-pulse p-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-primary-500" />
          성장 그래프
        </h2>
      </div>

      {/* Graph Container */}
      <Card className="p-0 overflow-hidden">
        <div className="relative h-[60vh] bg-slate-900">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>아직 연결된 데이터가 없습니다</p>
                <p className="text-sm mt-1">챌린지를 완료하고 인사이트를 기록해보세요</p>
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}
            />
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">범례</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { type: 'goal', label: '목표', color: '#0ea5e9' },
              { type: 'challenge', label: '챌린지', color: '#10b981' },
              { type: 'trigger', label: '자극', color: '#f59e0b' },
              { type: 'insight', label: '인사이트', color: '#8b5cf6' },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Info */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{selectedNode.icon}</span>
              {selectedNode.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              유형: {selectedNode.type === 'goal' ? '목표' :
                    selectedNode.type === 'trigger' ? '자극' :
                    selectedNode.type === 'insight' ? '인사이트' : '챌린지'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Causality Analysis CTA */}
      {hasAPIKey() && (
        <Card className="bg-gradient-to-br from-primary-500 to-accent-500 text-white border-none">
          <CardContent className="py-6 text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold mb-1">AI 인과관계 분석</h3>
            <p className="text-sm text-white/80 mb-4">
              AI가 당신의 성장 데이터를 분석하여 숨겨진 패턴과 인과관계를 발견합니다
            </p>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-none"
              onClick={handleAnalyzeCausality}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  인과관계 분석
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Modal */}
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title="AI 인과관계 분석"
      >
        {causalityAnalysis && (
          <div className="space-y-4">
            {/* Narrative */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{causalityAnalysis.narrative}</p>
              </div>
            </div>

            {/* Top Triggers */}
            {causalityAnalysis.topTriggers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  가장 영향력 있는 자극
                </h4>
                <div className="space-y-2">
                  {causalityAnalysis.topTriggers.map((trigger, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{trigger.title}</span>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                          영향도 {trigger.impact}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{trigger.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Patterns */}
            {causalityAnalysis.growthPatterns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  성장 패턴
                </h4>
                <ul className="space-y-1">
                  {causalityAnalysis.growthPatterns.map((pattern, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">→</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inflection Points */}
            {causalityAnalysis.inflectionPoints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  변곡점 (급성장 시점)
                </h4>
                <div className="space-y-2">
                  {causalityAnalysis.inflectionPoints.map((point, i) => (
                    <div
                      key={i}
                      className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          {point.date}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="text-slate-500">원인:</span> {point.cause}
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500">결과:</span> {point.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correlations */}
            {causalityAnalysis.correlations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">숨겨진 상관관계</h4>
                <div className="space-y-2">
                  {causalityAnalysis.correlations.map((corr, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">
                          <span className="font-medium">{corr.factorA}</span>
                          <span className="text-slate-400 mx-2">↔</span>
                          <span className="font-medium">{corr.factorB}</span>
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                          상관도 {Math.round(corr.strength * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{corr.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={() => setIsAnalysisModalOpen(false)}>
              확인
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );

  async function handleAnalyzeCausality() {
    if (!hasAPIKey()) return;

    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);

    try {
      const analysis = await analyzeCausality(analysisData);
      setCausalityAnalysis(analysis);
    } catch (error) {
      console.error('Causality analysis failed:', error);
      setIsAnalysisModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }
}
