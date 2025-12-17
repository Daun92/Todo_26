import type { Achievement } from '@/types';

export const achievements: Achievement[] = [
  // Streak badges
  {
    id: 'streak-7',
    category: 'streak',
    name: '일주일 챔피언',
    description: '7일 연속 습관 달성',
    icon: '🔥',
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak-30',
    category: 'streak',
    name: '습관 마스터',
    description: '30일 연속 습관 달성',
    icon: '🏆',
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'streak-100',
    category: 'streak',
    name: '전설의 시작',
    description: '100일 연속 습관 달성',
    icon: '👑',
    condition: { type: 'streak', value: 100 },
  },
  {
    id: 'streak-365',
    category: 'streak',
    name: '1년의 기적',
    description: '365일 연속 습관 달성',
    icon: '🌟',
    condition: { type: 'streak', value: 365 },
  },

  // Milestone badges
  {
    id: 'first-habit',
    category: 'milestone',
    name: '첫 걸음',
    description: '첫 번째 습관 완료',
    icon: '🌱',
    condition: { type: 'total', value: 1 },
  },
  {
    id: 'perfect-day',
    category: 'milestone',
    name: '완벽한 하루',
    description: '하루 모든 습관 완료',
    icon: '✨',
    condition: { type: 'rate', value: 100, period: 'day' },
  },
  {
    id: 'total-100',
    category: 'milestone',
    name: '백번의 노력',
    description: '총 100회 습관 완료',
    icon: '💯',
    condition: { type: 'total', value: 100 },
  },
  {
    id: 'total-500',
    category: 'milestone',
    name: '꾸준함의 증명',
    description: '총 500회 습관 완료',
    icon: '🎖️',
    condition: { type: 'total', value: 500 },
  },

  // Special badges
  {
    id: 'weekend-warrior',
    category: 'special',
    name: '주말 전사',
    description: '주말 4주 연속 습관 완료',
    icon: '⚔️',
    condition: { type: 'special', value: 4 },
  },
  {
    id: 'comeback',
    category: 'special',
    name: '불사조',
    description: '스트릭 끊김 후 7일 연속 달성',
    icon: '🦅',
    condition: { type: 'special', value: 7 },
  },
];

export const encouragements = {
  morning: [
    '좋은 아침이에요! 오늘도 작은 습관부터 시작해봐요 ☀️',
    '새로운 하루, 새로운 기회! 첫 습관을 체크해보세요 🌱',
    '오늘도 좋은 하루가 될 거예요! 화이팅 💪',
  ],
  halfComplete: [
    '벌써 절반이나! 이 기세로 오늘도 완주해봐요 💪',
    '반이나 끝났어요! 남은 것도 금방이에요 🎯',
    '잘하고 있어요! 조금만 더 힘내봐요 ✨',
  ],
  almostDone: [
    '마지막 하나! 오늘의 완벽한 하루를 만들어봐요 ✨',
    '거의 다 왔어요! 피니시 라인이 눈앞이에요 🏃',
    '대단해요! 마무리만 남았어요 🌟',
  ],
  allComplete: [
    '오늘의 모든 습관을 완료했어요! 정말 대단해요 🎉',
    '완벽한 하루를 만들었어요! 축하해요 🏆',
    '모든 습관 달성! 내일도 이 기세로! 💫',
  ],
  streakWarning: [
    '🔥 스트릭이 위험해요! 오늘 습관을 완료해주세요',
    '연속 기록 유지까지 습관 하나만 더! 🎖️',
  ],
  comeback: [
    '다시 돌아오셨네요! 언제든 새로 시작할 수 있어요 🌈',
    '오랜만이에요! 오늘부터 다시 함께해요 💪',
  ],
  evening: [
    '오늘도 고생했어요! 아직 완료하지 않은 습관이 있어요 🌙',
    '하루가 끝나기 전에 습관을 체크해보세요 ⭐',
  ],
};

export function getEncouragement(
  completedCount: number,
  totalCount: number,
  currentHour: number = new Date().getHours()
): string {
  const rate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (rate >= 100) {
    return encouragements.allComplete[Math.floor(Math.random() * encouragements.allComplete.length)];
  }

  if (currentHour >= 6 && currentHour < 12 && completedCount === 0) {
    return encouragements.morning[Math.floor(Math.random() * encouragements.morning.length)];
  }

  if (rate >= 80) {
    return encouragements.almostDone[Math.floor(Math.random() * encouragements.almostDone.length)];
  }

  if (rate >= 50) {
    return encouragements.halfComplete[Math.floor(Math.random() * encouragements.halfComplete.length)];
  }

  if (currentHour >= 20) {
    return encouragements.evening[Math.floor(Math.random() * encouragements.evening.length)];
  }

  return encouragements.morning[Math.floor(Math.random() * encouragements.morning.length)];
}
