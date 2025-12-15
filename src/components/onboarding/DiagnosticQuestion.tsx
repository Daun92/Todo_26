import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

export type QuestionType = 'single-choice' | 'multi-choice' | 'free-text' | 'prompt-writing';

export interface DiagnosticQuestionData {
  id: string;
  category: string;
  level: number;
  type: QuestionType;
  prompt: string;
  context?: string;
  options?: {
    id: string;
    text: string;
    score: number;
  }[];
  placeholder?: string;
}

interface Props {
  question: DiagnosticQuestionData;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string | string[], score?: number) => void;
  isEvaluating?: boolean;
}

export function DiagnosticQuestion({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  isEvaluating = false,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  const handleSingleChoice = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleMultiChoice = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    if (question.type === 'single-choice' && selectedOption) {
      const option = question.options?.find((o) => o.id === selectedOption);
      onAnswer(selectedOption, option?.score);
    } else if (question.type === 'multi-choice' && selectedOptions.length > 0) {
      const totalScore = selectedOptions.reduce((sum, id) => {
        const option = question.options?.find((o) => o.id === id);
        return sum + (option?.score || 0);
      }, 0);
      onAnswer(selectedOptions, totalScore);
    } else if ((question.type === 'free-text' || question.type === 'prompt-writing') && freeText.trim()) {
      onAnswer(freeText);
    }
  };

  const canSubmit = () => {
    if (question.type === 'single-choice') return !!selectedOption;
    if (question.type === 'multi-choice') return selectedOptions.length > 0;
    return freeText.trim().length > 0;
  };

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            LEVEL {question.level}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">{question.prompt}</h2>
        {question.context && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 mb-4">
            {question.context}
          </div>
        )}
      </div>

      {/* Options / Input */}
      <div className="space-y-3 mb-8">
        {question.type === 'single-choice' && question.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSingleChoice(option.id)}
            className={cn(
              'w-full p-4 text-left rounded-xl border-2 transition-all',
              selectedOption === option.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            <span className="text-sm">{option.text}</span>
          </button>
        ))}

        {question.type === 'multi-choice' && question.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => handleMultiChoice(option.id)}
            className={cn(
              'w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3',
              selectedOptions.includes(option.id)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                selectedOptions.includes(option.id)
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              )}
            >
              {selectedOptions.includes(option.id) && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </div>
            <span className="text-sm">{option.text}</span>
          </button>
        ))}

        {(question.type === 'free-text' || question.type === 'prompt-writing') && (
          <Textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={question.placeholder || '답변을 입력하세요...'}
            rows={question.type === 'prompt-writing' ? 8 : 4}
            className="text-sm"
          />
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit() || isEvaluating}
        className="w-full"
        size="lg"
      >
        {isEvaluating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            AI 평가 중...
          </>
        ) : (
          <>
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
