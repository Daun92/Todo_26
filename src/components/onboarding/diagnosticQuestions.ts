import type { DiagnosticQuestionData } from './DiagnosticQuestion';

export const aiPromptingQuestions: DiagnosticQuestionData[] = [
  {
    id: 'ai-1',
    category: 'ai-prompting',
    level: 1,
    type: 'single-choice',
    prompt: '다음 상황에서 가장 효과적인 프롬프트는?',
    context: '블로그 글 요약이 필요합니다.',
    options: [
      { id: 'a', text: '"이거 요약해줘"', score: 2 },
      { id: 'b', text: '"이 글을 요약해주세요"', score: 4 },
      { id: 'c', text: '"이 글을 3문장으로 요약해주세요"', score: 6 },
      { id: 'd', text: '"핵심 논점과 결론 중심으로 200자 내외로 요약하고, 글의 한계점도 짚어주세요"', score: 9 },
    ],
  },
  {
    id: 'ai-2',
    category: 'ai-prompting',
    level: 2,
    type: 'multi-choice',
    prompt: '이 프롬프트의 문제점을 모두 선택하세요',
    context: '"마케팅 전략 알려줘"',
    options: [
      { id: 'a', text: '구체적 맥락 부재', score: 2 },
      { id: 'b', text: '목표 불명확', score: 2 },
      { id: 'c', text: '대상 고객 미정의', score: 2 },
      { id: 'd', text: '출력 형식 미지정', score: 2 },
      { id: 'e', text: '문법 오류', score: -1 },
    ],
  },
  {
    id: 'ai-3',
    category: 'ai-prompting',
    level: 3,
    type: 'prompt-writing',
    prompt: '다음 작업을 위한 프롬프트를 작성하세요',
    context: '작업: 신입 개발자를 위한 Git 커밋 메시지 작성 가이드 문서를 만들어야 합니다.\n\n요구사항:\n• 실제 예시 포함\n• 좋은 예 vs 나쁜 예 비교\n• 팀 컨벤션 반영',
    placeholder: '프롬프트를 작성하세요...\n\n팁: 역할, 맥락, 출력 형식, 제약조건을 고려해보세요.',
  },
  {
    id: 'ai-4',
    category: 'ai-prompting',
    level: 4,
    type: 'prompt-writing',
    prompt: '기존 프롬프트를 개선하세요',
    context: '원본 프롬프트:\n"경쟁사 분석 보고서 작성해줘. B2B SaaS 회사이고 경쟁사 3곳 비교해야 해."',
    placeholder: '개선된 프롬프트를 작성하세요...\n\n개선 방향: 구조화, 구체화, 명확한 출력 형식',
  },
];

export const projectLeadQuestions: DiagnosticQuestionData[] = [
  {
    id: 'lead-1',
    category: 'project-lead',
    level: 1,
    type: 'single-choice',
    prompt: '프로젝트 마감이 3일 남은 상황입니다. 어떻게 대응하시겠습니까?',
    context: '팀원 A가 "기능 구현이 어려워서 못 하겠다"고 말합니다. 다른 팀원들은 각자 업무에 바쁩니다.',
    options: [
      { id: 'a', text: 'A의 업무를 다른 팀원에게 즉시 재배분한다', score: 4 },
      { id: 'b', text: 'A와 1:1로 구체적인 어려움을 먼저 파악한다', score: 9 },
      { id: 'c', text: '기능 스펙을 축소하여 마감을 맞춘다', score: 6 },
      { id: 'd', text: '상위 관리자에게 일정 연장을 요청한다', score: 3 },
    ],
  },
  {
    id: 'lead-2',
    category: 'project-lead',
    level: 2,
    type: 'single-choice',
    prompt: '팀 미팅에서 두 팀원이 기술적 접근 방식에 대해 강하게 대립합니다.',
    context: 'A는 새로운 기술 도입을 주장하고, B는 기존 검증된 방식을 고수합니다. 둘 다 논리적 근거가 있습니다.',
    options: [
      { id: 'a', text: '경험이 더 많은 팀원의 의견을 따른다', score: 3 },
      { id: 'b', text: '각 방식의 장단점을 표로 정리하고 판단 기준을 명확히 한다', score: 9 },
      { id: 'c', text: '다수결로 결정한다', score: 4 },
      { id: 'd', text: '두 방식을 모두 시도해본다', score: 5 },
    ],
  },
  {
    id: 'lead-3',
    category: 'project-lead',
    level: 3,
    type: 'free-text',
    prompt: '주니어 개발자가 같은 실수를 반복합니다. 어떻게 피드백하시겠습니까?',
    context: '코드 리뷰에서 같은 유형의 버그가 3번째 발견되었습니다. 팀원은 열심히 하지만 꼼꼼함이 부족해 보입니다.',
    placeholder: '어떤 방식으로 피드백을 전달할지 구체적으로 작성해주세요...',
  },
];

export const planningQuestions: DiagnosticQuestionData[] = [
  {
    id: 'plan-1',
    category: 'planning',
    level: 1,
    type: 'multi-choice',
    prompt: '이 기획서의 문제점을 모두 찾으세요',
    context: '프로젝트명: 신규 앱 개발\n목표: 좋은 앱 만들기\n일정: 빠른 시일 내\n예산: 적당히\n성공 지표: 많은 사용자',
    options: [
      { id: 'a', text: '목표가 모호함 (측정 불가)', score: 2 },
      { id: 'b', text: '구체적 일정 없음', score: 2 },
      { id: 'c', text: '정량적 예산 미제시', score: 2 },
      { id: 'd', text: '측정 가능한 KPI 없음', score: 2 },
      { id: 'e', text: '범위(Scope) 미정의', score: 2 },
    ],
  },
  {
    id: 'plan-2',
    category: 'planning',
    level: 2,
    type: 'free-text',
    prompt: '다음 요구사항을 SMART 목표로 재작성하세요',
    context: '원본: "사용자가 더 많이 앱을 쓰게 하고 싶다"\n\nSMART: Specific(구체적), Measurable(측정가능), Achievable(달성가능), Relevant(관련성), Time-bound(기한)',
    placeholder: 'S: \nM: \nA: \nR: \nT: ',
  },
  {
    id: 'plan-3',
    category: 'planning',
    level: 3,
    type: 'single-choice',
    prompt: '프로젝트 리스크 관리에서 가장 중요한 원칙은?',
    options: [
      { id: 'a', text: '모든 리스크를 사전에 제거한다', score: 3 },
      { id: 'b', text: '리스크가 발생하면 즉시 대응한다', score: 5 },
      { id: 'c', text: '영향도와 발생 확률로 우선순위를 정하고 대응 계획을 수립한다', score: 9 },
      { id: 'd', text: '리스크는 피할 수 없으므로 받아들인다', score: 2 },
    ],
  },
];

export const habitQuestions: DiagnosticQuestionData[] = [
  {
    id: 'habit-1',
    category: 'habits',
    level: 1,
    type: 'single-choice',
    prompt: '지난 일주일 기준, 하루 30분 이상 걷기를 몇 회 했나요?',
    options: [
      { id: 'a', text: '0회', score: 1 },
      { id: 'b', text: '1-2회', score: 3 },
      { id: 'c', text: '3-4회', score: 6 },
      { id: 'd', text: '5회 이상', score: 9 },
    ],
  },
  {
    id: 'habit-2',
    category: 'habits',
    level: 1,
    type: 'single-choice',
    prompt: '명상이나 호흡 연습을 얼마나 자주 하시나요?',
    options: [
      { id: 'a', text: '해본 적 없음', score: 1 },
      { id: 'b', text: '가끔 (월 1-2회)', score: 3 },
      { id: 'c', text: '주 2-3회', score: 6 },
      { id: 'd', text: '매일', score: 9 },
    ],
  },
  {
    id: 'habit-3',
    category: 'habits',
    level: 1,
    type: 'single-choice',
    prompt: '바른 자세를 의식적으로 유지하려고 노력하시나요?',
    options: [
      { id: 'a', text: '거의 신경 쓰지 않음', score: 2 },
      { id: 'b', text: '가끔 생각나면', score: 4 },
      { id: 'c', text: '자주 확인하고 교정함', score: 7 },
      { id: 'd', text: '습관화되어 자연스럽게 유지', score: 9 },
    ],
  },
];

export const allQuestions = {
  'ai-prompting': aiPromptingQuestions,
  'project-lead': projectLeadQuestions,
  'planning': planningQuestions,
  'habits': habitQuestions,
};

export const categoryInfo = {
  'ai-prompting': {
    title: 'AI 프롬프팅',
    description: 'AI와 효과적으로 소통하는 능력',
    icon: '🤖',
  },
  'project-lead': {
    title: '프로젝트 리드',
    description: '팀을 이끌고 의사결정하는 역량',
    icon: '🎖️',
  },
  'planning': {
    title: '기획/관리',
    description: '체계적으로 계획하고 관리하는 능력',
    icon: '📋',
  },
  'habits': {
    title: '생활 습관',
    description: '건강한 일상 루틴',
    icon: '🌱',
  },
};
