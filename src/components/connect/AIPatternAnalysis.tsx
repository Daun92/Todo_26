/**
 * @file AIPatternAnalysis.tsx
 * @description AI 기반 패턴 분석 및 연결 제안 컴포넌트
 *
 * @checkpoint CP-5.3
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Link2,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, EmptyState } from '@/components/ui';
import { useAI, type AIPattern, type AIConnection } from '@/lib/ai-service';
import { useContents, useMemos, useTags, useConnections } from '@/hooks';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface AIPatternAnalysisProps {
  className?: string;
  onAddConnection?: (connection: Omit<AIConnection, 'explanation'>) => void;
}

// ============================================
// Component
// ============================================

export function AIPatternAnalysis({ className, onAddConnection }: AIPatternAnalysisProps) {
  const { contents } = useContents({});
  const { memos } = useMemos();
  const { tags } = useTags();
  const { addConnection } = useConnections();

  const { isLoading, error, isConfigured, analyzePatterns, suggestConnections } = useAI();

  const [patterns, setPatterns] = useState<AIPattern[]>([]);
  const [suggestions, setSuggestions] = useState<AIConnection[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleAnalyze = async () => {
    setAnalysisComplete(false);

    const [newPatterns, newSuggestions] = await Promise.all([
      analyzePatterns(contents, memos, tags),
      suggestConnections(contents, memos),
    ]);

    setPatterns(newPatterns);
    setSuggestions(newSuggestions);
    setAnalysisComplete(true);
  };

  const handleAddSuggestion = async (suggestion: AIConnection) => {
    try {
      await addConnection({
        sourceId: suggestion.sourceId,
        targetId: suggestion.targetId,
        sourceType: 'content',
        targetType: 'content',
        relationship: suggestion.relationship,
        strength: suggestion.strength,
      });

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s =>
        s.sourceId !== suggestion.sourceId || s.targetId !== suggestion.targetId
      ));

      onAddConnection?.(suggestion);
    } catch (err) {
      console.error('Failed to add connection:', err);
    }
  };

  // ----------------------------------------
  // Render - Not Configured
  // ----------------------------------------

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                AI 설정 필요
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                설정에서 Gemini API 키를 입력하면 AI 분석을 사용할 수 있어요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  AI 패턴 분석
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contents.length}개 콘텐츠 · {memos.length}개 메모
                </p>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || contents.length === 0}
              className="gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  분석하기
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisComplete && (
        <>
          {/* Patterns */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">
                  발견된 패턴
                </h4>
                <Badge variant="secondary">{patterns.length}개</Badge>
              </div>

              {patterns.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="패턴을 찾지 못했어요"
                  description="더 많은 학습 데이터가 쌓이면 패턴을 발견할 수 있어요"
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {patterns.map((pattern, index) => (
                    <PatternCard key={index} pattern={pattern} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Suggestions */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-medium text-slate-900 dark:text-white">
                  연결 제안
                </h4>
                <Badge variant="secondary">{suggestions.length}개</Badge>
              </div>

              {suggestions.length === 0 ? (
                <EmptyState
                  icon={Link2}
                  title="제안할 연결이 없어요"
                  description="더 많은 콘텐츠를 추가하면 연결을 제안받을 수 있어요"
                  className="py-6"
                />
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      onAdd={() => handleAddSuggestion(suggestion)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial State */}
      {!analysisComplete && !isLoading && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Sparkles}
              title="AI 분석을 시작해보세요"
              description="학습 데이터에서 패턴을 찾고 의미 있는 연결을 제안받을 수 있어요"
              className="py-8"
              action={
                <Button onClick={handleAnalyze} disabled={contents.length === 0}>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  분석 시작
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

interface PatternCardProps {
  pattern: AIPattern;
}

function PatternCard({ pattern }: PatternCardProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-slate-900 dark:text-white">
              {pattern.name}
            </h5>
            <Badge variant="secondary" className="text-xs">
              {Math.round(pattern.confidence * 100)}% 신뢰도
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {pattern.description}
          </p>
        </div>
      </div>

      {pattern.insight && (
        <div className="flex items-start gap-2 mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {pattern.insight}
          </p>
        </div>
      )}

      {pattern.relatedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pattern.relatedTopics.map(topic => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: AIConnection;
  onAdd: () => void;
}

function SuggestionCard({ suggestion, onAdd }: SuggestionCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await onAdd();
    setIsAdding(false);
  };

  return (
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="text-xs">
              {suggestion.relationship}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              강도 {suggestion.strength}/10
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {suggestion.explanation}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAdd}
          disabled={isAdding}
          className="flex-shrink-0"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
