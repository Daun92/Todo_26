import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Lightbulb, FileText, Target, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Textarea } from '@/components/ui';
import { db } from '@/lib/db';
import { cn, formatDate, generateId, getToday } from '@/lib/utils';
import { hasAPIKey } from '@/lib/claude';
import { analyzeJournal } from '@/lib/ai-services';
import type { Journal, JournalType, Goal } from '@/types';

const journalTypes: { id: JournalType; label: string; icon: typeof BookOpen; color: string }[] = [
  { id: 'free', label: '자유 메모', icon: FileText, color: 'text-slate-500' },
  { id: 'trigger', label: '자극 기록', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'reflection', label: '회고', icon: BookOpen, color: 'text-purple-500' },
  { id: 'goal-note', label: '목표 메모', icon: Target, color: 'text-primary-500' },
];

interface JournalWithAI extends Journal {
  aiAnalysis?: {
    mood: 'positive' | 'neutral' | 'challenging';
    energy: number;
    keyInsight: string;
    coachingMessage: string;
  };
}

function JournalEntry({ journal }: { journal: JournalWithAI }) {
  const typeInfo = journalTypes.find((t) => t.id === journal.type) || journalTypes[0];
  const Icon = typeInfo.icon;

  const moodColors = {
    positive: 'text-emerald-500',
    neutral: 'text-slate-500',
    challenging: 'text-amber-500',
  };

  return (
    <Card hoverable className="group">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-xl bg-slate-100 dark:bg-slate-800', typeInfo.color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(journal.date, 'M월 d일 HH:mm')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {typeInfo.label}
              </span>
              {journal.aiAnalysis && (
                <span className={cn('text-xs flex items-center gap-1', moodColors[journal.aiAnalysis.mood])}>
                  <Sparkles className="w-3 h-3" />
                  AI 분석
                </span>
              )}
            </div>
            {journal.title && (
              <h4 className="font-medium text-sm mb-1">{journal.title}</h4>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {journal.content}
            </p>
            {journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {journal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {journal.aiAnalysis?.keyInsight && (
              <div className="mt-3 p-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-lg">
                <p className="text-xs text-primary-700 dark:text-primary-300">
                  <strong>AI 인사이트:</strong> {journal.aiAnalysis.keyInsight}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function JournalPage() {
  const [journals, setJournals] = useState<JournalWithAI[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<JournalType>('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [filterType, setFilterType] = useState<JournalType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiCoachMessage, setAiCoachMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [journalData, goalData] = await Promise.all([
      db.journals.orderBy('date').reverse().toArray(),
      db.goals.toArray(),
    ]);
    setJournals(journalData as JournalWithAI[]);
    setGoals(goalData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    setAiCoachMessage(null);

    let userTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    let aiAnalysis: JournalWithAI['aiAnalysis'] | undefined;
    let linkedGoals: string[] = [];

    // AI 분석 수행 (API 키가 있는 경우)
    if (hasAPIKey() && content.trim().length > 20) {
      try {
        const analysis = await analyzeJournal(content.trim(), goals);
        aiAnalysis = {
          mood: analysis.mood,
          energy: analysis.energy,
          keyInsight: analysis.keyInsight,
          coachingMessage: analysis.coachingMessage,
        };
        // AI가 제안한 태그 병합
        userTags = [...new Set([...userTags, ...analysis.suggestedTags])];
        // 연결된 목표 찾기
        linkedGoals = goals
          .filter((g) => analysis.linkedGoals.includes(g.title))
          .map((g) => g.id);
        // 코칭 메시지 표시
        setAiCoachMessage(analysis.coachingMessage);
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }

    const journal: JournalWithAI = {
      id: generateId(),
      type: selectedType,
      title: title.trim() || undefined,
      content: content.trim(),
      tags: userTags,
      linkedGoals,
      linkedTriggers: [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiAnalysis,
    };

    await db.journals.add(journal);
    await loadData();

    setTitle('');
    setContent('');
    setTags('');
    setIsSaving(false);
    setIsModalOpen(false);
  };

  const filteredJournals = journals.filter((j) => {
    if (filterType !== 'all' && j.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        j.content.toLowerCase().includes(query) ||
        j.title?.toLowerCase().includes(query) ||
        j.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Group by date
  const groupedJournals = filteredJournals.reduce((acc, journal) => {
    const date = formatDate(journal.date, 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(journal);
    return acc;
  }, {} as Record<string, Journal[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          저널
        </h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          새 글
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as JournalType | 'all')}
          className="px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:outline-none"
        >
          <option value="all">전체</option>
          {journalTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Journal List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredJournals.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 작성된 글이 없습니다'}
          </p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            첫 번째 글 작성하기
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedJournals).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {date === getToday() ? '오늘' : formatDate(date, 'M월 d일 (EEE)')}
              </h3>
              <div className="space-y-2">
                {entries.map((journal) => (
                  <JournalEntry key={journal.id} journal={journal} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Journal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 글 작성"
      >
        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              {journalTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                      selectedType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:border-slate-300'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', type.color)} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="제목 (선택)"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="내용 *"
            placeholder="생각, 아이디어, 깨달음을 자유롭게 작성하세요..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Input
            label="태그 (쉼표로 구분)"
            placeholder="AI, 프롬프팅, 회고"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {hasAPIKey() && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3 h-3 text-primary-500" />
              AI가 저널을 분석하여 인사이트와 태그를 제안합니다
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!content.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Coach Message Toast */}
      {aiCoachMessage && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50 animate-in slide-in-from-bottom-4">
          <Card className="bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">AI 코치</p>
                  <p className="text-sm opacity-90">{aiCoachMessage}</p>
                </div>
                <button
                  onClick={() => setAiCoachMessage(null)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
