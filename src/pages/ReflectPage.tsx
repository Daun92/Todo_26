import { BarChart3, Calendar, TrendingUp, Award, Scale } from 'lucide-react';
import { Card, CardContent, Button, EmptyState, Badge } from '@/components/ui';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

export function ReflectPage() {
  const { openModal } = useStore();

  // TODO: Replace with real data from hooks
  const reflections: unknown[] = [];
  const hasEnoughData = false;

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reflect
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            성장을 돌아보고 실감해요
          </p>
        </div>
        <Button
          onClick={() => openModal('newReflection')}
          disabled={!hasEnoughData}
        >
          회고 시작
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Calendar}
          label="학습 일수"
          value="0"
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="완료한 학습"
          value="0"
          color="green"
        />
        <StatCard
          icon={Award}
          label="발견한 연결"
          value="0"
          color="amber"
        />
        <StatCard
          icon={Scale}
          label="균형 점수"
          value="-"
          color="purple"
        />
      </div>

      {/* Algorithm & Counterpoint */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          나의 알고리즘
        </h2>

        <Card>
          <CardContent className="space-y-4">
            {/* My Algorithm */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  성장 방향
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 pl-4">
                학습 데이터가 쌓이면 당신만의 성장 패턴을 분석해드려요
              </p>
            </div>

            {/* Counterpoint */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  대척점 (기회 & 대안)
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 pl-4">
                편향을 인식하고 균형 잡힌 시각을 기르도록 도와드려요
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Reflections */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          회고 기록
        </h2>

        {reflections.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={BarChart3}
                title="아직 회고 기록이 없어요"
                description="학습을 진행하면 월간/분기 회고를 진행할 수 있어요"
                className="py-8"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Reflection cards will be rendered here */}
          </div>
        )}
      </section>

      {/* Growth Story Teaser */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                성장 스토리
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                충분한 학습 데이터가 쌓이면 AI가 당신의 성장 여정을
                스토리로 만들어드려요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: typeof BarChart3;
  label: string;
  value: string;
  color: 'indigo' | 'green' | 'amber' | 'purple';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-900/50',
              color === 'green' && 'bg-green-100 dark:bg-green-900/50',
              color === 'amber' && 'bg-amber-100 dark:bg-amber-900/50',
              color === 'purple' && 'bg-purple-100 dark:bg-purple-900/50'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                color === 'green' && 'text-green-600 dark:text-green-400',
                color === 'amber' && 'text-amber-600 dark:text-amber-400',
                color === 'purple' && 'text-purple-600 dark:text-purple-400'
              )}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
