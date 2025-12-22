/**
 * @file AISummaryCard.tsx
 * @description AI 기반 콘텐츠 요약 및 대척점 생성 컴포넌트
 *
 * @checkpoint CP-5.5
 * @created 2025-12-22
 */

import { useState } from 'react';
import {
  Sparkles,
  FileText,
  Scale,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { useAI, type AISummary, type AICounterpoint } from '@/lib/ai-service';
import type { Content } from '@/types';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface AISummaryCardProps {
  content: Content;
  onUpdateContent?: (updates: Partial<Content>) => void;
  className?: string;
  compact?: boolean;
}

// ============================================
// Component
// ============================================

export function AISummaryCard({
  content,
  onUpdateContent,
  className,
  compact = false,
}: AISummaryCardProps) {
  const { isLoading, error, isConfigured, summarize, generateCounterpoint } = useAI();

  const [summary, setSummary] = useState<AISummary | null>(null);
  const [counterpoint, setCounterpoint] = useState<AICounterpoint | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'counterpoint'>('summary');
  const [showDetails, setShowDetails] = useState(false);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleGenerateSummary = async () => {
    const result = await summarize(content);
    if (result) {
      setSummary(result);
      onUpdateContent?.({ summary: result.summary });
    }
  };

  const handleGenerateCounterpoint = async () => {
    const result = await generateCounterpoint(content);
    if (result) {
      setCounterpoint(result);
      onUpdateContent?.({ counterpoint: result.counterpoint });
    }
  };

  const handleGenerateBoth = async () => {
    await Promise.all([handleGenerateSummary(), handleGenerateCounterpoint()]);
  };

  // ----------------------------------------
  // Render - Not Configured
  // ----------------------------------------

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardContent className={compact ? 'py-3' : ''}>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              AI 기능을 사용하려면 설정에서 API 키를 입력하세요
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ----------------------------------------
  // Render - Compact Mode
  // ----------------------------------------

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="gap-1"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <FileText className="w-3 h-3" />
          )}
          요약
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleGenerateCounterpoint}
          disabled={isLoading}
          className="gap-1"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Scale className="w-3 h-3" />
          )}
          대척점
        </Button>
      </div>
    );
  }

  // ----------------------------------------
  // Render - Full Mode
  // ----------------------------------------

  return (
    <Card className={className}>
      <CardContent>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">
                AI 분석
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {content.title}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateBoth}
            disabled={isLoading}
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
                전체 분석
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={activeTab === 'summary' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('summary')}
            className="gap-1.5"
          >
            <FileText className="w-4 h-4" />
            요약
            {summary && <CheckCircle className="w-3 h-3 text-green-500" />}
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'counterpoint' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('counterpoint')}
            className="gap-1.5"
          >
            <Scale className="w-4 h-4" />
            대척점
            {counterpoint && <CheckCircle className="w-3 h-3 text-green-500" />}
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            {summary ? (
              <>
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {summary.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>예상 읽기 시간: {summary.estimatedReadTime}분</span>
                </div>

                {summary.keyPoints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 mb-2"
                    >
                      {showDetails ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      핵심 포인트 {summary.keyPoints.length}개
                    </button>
                    {showDetails && (
                      <ul className="space-y-1.5 pl-4">
                        {summary.keyPoints.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  AI가 콘텐츠를 요약해드려요
                </p>
                <Button onClick={handleGenerateSummary} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  )}
                  요약 생성
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'counterpoint' && (
          <div className="space-y-3">
            {counterpoint ? (
              <>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      대척점
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {counterpoint.counterpoint}
                  </p>
                </div>

                {counterpoint.alternativePerspectives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      대안적 관점
                    </p>
                    <div className="space-y-2">
                      {counterpoint.alternativePerspectives.map((perspective, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                        >
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {perspective}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {counterpoint.questions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      생각해볼 질문들
                    </p>
                    <div className="space-y-1.5">
                      {counterpoint.questions.map((question, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <span className="text-purple-500 font-medium">Q.</span>
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  다른 관점과 대안적 시각을 제안해드려요
                </p>
                <Button onClick={handleGenerateCounterpoint} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  )}
                  대척점 생성
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Quick Action Buttons (Inline version)
// ============================================

interface AIQuickActionsProps {
  content: Content;
  onUpdateContent?: (updates: Partial<Content>) => void;
  className?: string;
}

export function AIQuickActions({ content, onUpdateContent, className }: AIQuickActionsProps) {
  const { isLoading, isConfigured, summarize, generateCounterpoint } = useAI();
  const [generating, setGenerating] = useState<'summary' | 'counterpoint' | null>(null);

  if (!isConfigured) return null;

  const handleSummary = async () => {
    setGenerating('summary');
    try {
      const result = await summarize(content);
      if (result) {
        onUpdateContent?.({ summary: result.summary });
      }
    } finally {
      setGenerating(null);
    }
  };

  const handleCounterpoint = async () => {
    setGenerating('counterpoint');
    try {
      const result = await generateCounterpoint(content);
      if (result) {
        onUpdateContent?.({ counterpoint: result.counterpoint });
      }
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {!content.summary && (
        <button
          onClick={handleSummary}
          disabled={isLoading}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
            'disabled:opacity-50'
          )}
          title="AI 요약 생성"
        >
          {generating === 'summary' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </button>
      )}
      {!content.counterpoint && (
        <button
          onClick={handleCounterpoint}
          disabled={isLoading}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30',
            'disabled:opacity-50'
          )}
          title="AI 대척점 생성"
        >
          {generating === 'counterpoint' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Scale className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
