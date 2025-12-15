import { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Target, Brain, Calendar, Heart } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { DiagnosticQuestion } from './DiagnosticQuestion';
import type { DiagnosticQuestionData } from './DiagnosticQuestion';
import {
  allQuestions,
  categoryInfo,
} from './diagnosticQuestions';
import {
  evaluatePrompt,
  generateDiagnosticSummary,
} from '@/lib/ai-services';
import type { DiagnosticSummary } from '@/lib/ai-services';
import { hasAPIKey } from '@/lib/claude';
import { cn } from '@/lib/utils';

type DiagnosticCategory = keyof typeof allQuestions;

interface CategoryResult {
  category: DiagnosticCategory;
  answers: { questionId: string; answer: string | string[]; score: number }[];
  totalScore: number;
  summary?: DiagnosticSummary;
}

interface Props {
  onComplete: (results: CategoryResult[]) => void;
  onSkip: () => void;
}

const categoryIcons: Record<DiagnosticCategory, React.ReactNode> = {
  'ai-prompting': <Brain className="w-5 h-5" />,
  'project-lead': <Target className="w-5 h-5" />,
  'planning': <Calendar className="w-5 h-5" />,
  'habits': <Heart className="w-5 h-5" />,
};

export function DiagnosticFlow({ onComplete, onSkip }: Props) {
  const [stage, setStage] = useState<'intro' | 'select' | 'test' | 'results'>('intro');
  const [selectedCategories, setSelectedCategories] = useState<DiagnosticCategory[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [currentCategoryAnswers, setCurrentCategoryAnswers] = useState<
    { questionId: string; answer: string | string[]; score: number }[]
  >([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const currentCategory = selectedCategories[currentCategoryIndex];
  const currentQuestions = currentCategory ? allQuestions[currentCategory] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const totalQuestionsCount = selectedCategories.reduce(
    (sum, cat) => sum + allQuestions[cat].length,
    0
  );
  const completedQuestionsCount = results.reduce(
    (sum, r) => sum + r.answers.length,
    0
  ) + currentCategoryAnswers.length;

  const handleCategoryToggle = (category: DiagnosticCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleStartTest = () => {
    if (selectedCategories.length === 0) return;
    setStage('test');
  };

  const handleAnswer = useCallback(
    async (answer: string | string[], score?: number) => {
      if (!currentQuestion) return;

      let finalScore = score ?? 0;

      // AI 평가가 필요한 경우 (프롬프트 작성 문제)
      if (
        (currentQuestion.type === 'prompt-writing' || currentQuestion.type === 'free-text') &&
        hasAPIKey() &&
        currentQuestion.category === 'ai-prompting'
      ) {
        setIsEvaluating(true);
        try {
          const evaluation = await evaluatePrompt(
            answer as string,
            currentQuestion.context || currentQuestion.prompt
          );
          finalScore = evaluation.totalScore / 10; // 100점 -> 10점 스케일
        } catch (error) {
          console.error('AI evaluation failed:', error);
          finalScore = 5; // 기본 점수
        }
        setIsEvaluating(false);
      } else if (
        (currentQuestion.type === 'free-text' || currentQuestion.type === 'prompt-writing') &&
        !hasAPIKey()
      ) {
        // API 키 없으면 중간 점수
        finalScore = 5;
      }

      const newAnswer = {
        questionId: currentQuestion.id,
        answer,
        score: finalScore,
      };

      const updatedAnswers = [...currentCategoryAnswers, newAnswer];
      setCurrentCategoryAnswers(updatedAnswers);

      // 다음 문제로 이동
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // 현재 카테고리 완료
        const categoryResult: CategoryResult = {
          category: currentCategory,
          answers: updatedAnswers,
          totalScore: updatedAnswers.reduce((sum, a) => sum + a.score, 0),
        };

        // AI 요약 생성
        if (hasAPIKey()) {
          setIsGeneratingSummary(true);
          try {
            const summary = await generateDiagnosticSummary(
              categoryInfo[currentCategory].title,
              updatedAnswers.map((a, i) => ({
                question: currentQuestions[i].prompt,
                answer: Array.isArray(a.answer) ? a.answer.join(', ') : a.answer,
                score: a.score,
              }))
            );
            categoryResult.summary = summary;
          } catch (error) {
            console.error('Summary generation failed:', error);
          }
          setIsGeneratingSummary(false);
        }

        const updatedResults = [...results, categoryResult];
        setResults(updatedResults);

        // 다음 카테고리 또는 완료
        if (currentCategoryIndex < selectedCategories.length - 1) {
          setCurrentCategoryIndex((prev) => prev + 1);
          setCurrentQuestionIndex(0);
          setCurrentCategoryAnswers([]);
        } else {
          setStage('results');
        }
      }
    },
    [currentQuestion, currentQuestionIndex, currentQuestions, currentCategory, currentCategoryIndex, selectedCategories, currentCategoryAnswers, results]
  );

  const renderIntro = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Catalyze 26</h1>
          <p className="text-slate-500 dark:text-slate-400">
            당신의 성장을 가속화하는 여정을 시작합니다
          </p>
        </div>

        <div className="space-y-3 text-left p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          <h2 className="font-semibold">진단 테스트란?</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>현재 역량 수준을 객관적으로 측정합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>AI가 당신의 답변을 분석하여 개인화된 피드백을 제공합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">•</span>
              <span>약 5-10분 소요됩니다</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={() => setStage('select')} size="lg" className="w-full">
            진단 시작하기
          </Button>
          <Button onClick={onSkip} variant="ghost" className="w-full">
            건너뛰고 앱 시작
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCategorySelect = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <button
          onClick={() => setStage('intro')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">진단할 역량 선택</h1>
          <p className="text-slate-500 dark:text-slate-400">
            측정하고 싶은 역량을 선택하세요 (복수 선택 가능)
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(allQuestions) as DiagnosticCategory[]).map((category) => {
            const info = categoryInfo[category];
            const questionCount = allQuestions[category].length;
            const isSelected = selectedCategories.includes(category);

            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    )}
                  >
                    {categoryIcons[category]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{info.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {info.description}
                    </p>
                  </div>
                  <div className="text-sm text-slate-400">
                    {questionCount}문제
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategories.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              총 {totalQuestionsCount}문제 · 예상 소요시간{' '}
              {Math.ceil(totalQuestionsCount * 1.5)}분
            </p>
          </div>
        )}

        <Button
          onClick={handleStartTest}
          disabled={selectedCategories.length === 0}
          size="lg"
          className="w-full"
        >
          {selectedCategories.length > 0
            ? `${selectedCategories.length}개 역량 진단 시작`
            : '역량을 선택하세요'}
        </Button>
      </div>
    </div>
  );

  const renderTest = () => {
    if (!currentQuestion) return null;

    const categoryTitle = categoryInfo[currentCategory]?.title;

    return (
      <div className="min-h-screen flex flex-col p-4">
        {/* Category Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex((prev) => prev - 1);
                setCurrentCategoryAnswers((prev) => prev.slice(0, -1));
              } else if (currentCategoryIndex > 0) {
                // 이전 카테고리로 돌아가기 로직 (복잡해서 일단 생략)
              }
            }}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentQuestionIndex > 0 ? '이전 문제' : '카테고리 선택'}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              {categoryIcons[currentCategory]}
            </div>
            <span className="font-medium">{categoryTitle}</span>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center">
          {isGeneratingSummary ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                AI가 결과를 분석하고 있습니다...
              </p>
            </div>
          ) : (
            <DiagnosticQuestion
              question={currentQuestion}
              currentIndex={completedQuestionsCount}
              totalQuestions={totalQuestionsCount}
              onAnswer={handleAnswer}
              isEvaluating={isEvaluating}
            />
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const maxPossibleScore = results.reduce(
      (sum, r) => sum + r.answers.length * 9,
      0
    );
    const overallPercentage = Math.round((totalScore / maxPossibleScore) * 100);

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold">진단 완료!</h1>
            <p className="text-slate-500 dark:text-slate-400">
              당신의 현재 수준을 확인해보세요
            </p>
          </div>

          {/* Overall Score */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-bold mb-2">{overallPercentage}%</div>
              <p className="text-slate-500 dark:text-slate-400">종합 점수</p>
            </CardContent>
          </Card>

          {/* Category Results */}
          <div className="space-y-4">
            {results.map((result) => {
              const info = categoryInfo[result.category];
              const maxScore = result.answers.length * 9;
              const percentage = Math.round((result.totalScore / maxScore) * 100);
              const level = Math.round(percentage / 10) || 1;

              return (
                <Card key={result.category}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          {categoryIcons[result.category]}
                        </div>
                        <span className="font-medium">{info.title}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">Lv.{level}</div>
                        <div className="text-sm text-slate-500">{percentage}%</div>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {result.summary && (
                      <div className="space-y-2 text-sm">
                        {result.summary.strengths.length > 0 && (
                          <div>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              강점:{' '}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {result.summary.strengths.join(', ')}
                            </span>
                          </div>
                        )}
                        {result.summary.improvements.length > 0 && (
                          <div>
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              개선점:{' '}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {result.summary.improvements.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={() => onComplete(results)}
            size="lg"
            className="w-full"
          >
            앱 시작하기
          </Button>
        </div>
      </div>
    );
  };

  switch (stage) {
    case 'intro':
      return renderIntro();
    case 'select':
      return renderCategorySelect();
    case 'test':
      return renderTest();
    case 'results':
      return renderResults();
    default:
      return null;
  }
}
