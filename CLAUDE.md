# CLAUDE.md - Catalyze 26 개발 가이드

이 문서는 Catalyze 26 프로젝트의 개발 가이드입니다. AI 어시스턴트나 새로운 개발자가 프로젝트를 이해하고 기여할 때 참고하세요.

---

## 프로젝트 개요

**Catalyze 26**은 2026년 목표 관리 및 개인 성장 추적 웹앱입니다.

### 핵심 컨셉
- 온톨로지 기반 데이터 모델 (Trigger → Insight → Action → Outcome)
- 1년 후 회고 시 인과관계 분석이 가능한 구조
- 모바일 우선 반응형 디자인
- 오프라인 퍼스트 (IndexedDB)

---

## 빠른 시작

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run build

# 린트
npm run lint
```

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Vite | 6.x | 빌드 도구 |
| Tailwind CSS | 4.x | 스타일링 |
| Zustand | 5.x | 상태 관리 |
| Dexie.js | 4.x | IndexedDB 래퍼 |
| Recharts | 2.x | 차트 |
| D3.js | 7.x | 그래프 시각화 |

---

## 프로젝트 구조

```
src/
├── components/         # 리액트 컴포넌트
│   ├── home/          # 홈 페이지 전용 컴포넌트
│   ├── layout/        # 레이아웃 컴포넌트
│   └── ui/            # 재사용 가능한 UI 컴포넌트
├── hooks/             # 커스텀 훅
├── lib/               # 유틸리티 및 DB
├── pages/             # 페이지 컴포넌트
├── stores/            # Zustand 스토어
└── types/             # TypeScript 타입
```

---

## 핵심 파일 설명

### `/src/types/index.ts`
모든 TypeScript 타입 정의. 주요 타입:
- `Goal`: 목표 (전략 버전 관리 포함)
- `HabitLog`: 일일 습관 기록
- `ChallengeTemplate`, `ChallengeLog`: 챌린지 시스템
- `Trigger`, `Insight`, `Action`, `Outcome`: 온톨로지 엔티티
- `Journal`: 저널 엔트리

### `/src/lib/db.ts`
Dexie.js 데이터베이스 설정 및 초기 데이터.
- `CatalyzeDB` 클래스: 테이블 정의
- `initializeDefaultData()`: 첫 실행 시 기본 데이터 생성

### `/src/stores/useStore.ts`
Zustand 전역 상태:
- `darkMode`: 다크모드 토글
- `activeTab`: 현재 활성 탭
- `selectedDate`: 선택된 날짜
- `activeModal`, `modalData`: 모달 상태

### `/src/hooks/`
데이터 조회 및 조작을 위한 커스텀 훅:
- `useHabits()`: 습관 CRUD
- `useChallenges()`: 챌린지 CRUD
- `useGoals()`: 목표 CRUD

---

## 코딩 컨벤션

### 파일 명명
- 컴포넌트: `PascalCase.tsx` (예: `HabitTracker.tsx`)
- 훅: `camelCase.ts` (예: `useHabits.ts`)
- 유틸리티: `camelCase.ts` (예: `utils.ts`)

### 컴포넌트 구조
```tsx
// 1. imports
import { useState } from 'react';
import { cn } from '@/lib/utils';

// 2. types (필요시)
interface Props {
  title: string;
}

// 3. component
export function ComponentName({ title }: Props) {
  // hooks
  const [state, setState] = useState();

  // handlers
  const handleClick = () => {};

  // render
  return <div>{title}</div>;
}
```

### 스타일링
- Tailwind CSS 유틸리티 클래스 사용
- 조건부 클래스는 `cn()` 유틸리티 사용
- 다크모드: `dark:` 프리픽스

```tsx
<div className={cn(
  'bg-white dark:bg-slate-900',
  isActive && 'border-primary-500'
)}>
```

### 경로 별칭
`@/`를 사용하여 `src/` 디렉토리 참조:
```tsx
import { Button } from '@/components/ui';
import { useHabits } from '@/hooks';
```

---

## 데이터베이스 스키마

### Goals
```typescript
{
  id: string;
  title: string;
  category: 'competency' | 'habit' | 'lifestyle';
  strategies: Strategy[];  // 버전 관리됨
  milestones: Milestone[];
  currentLevel: number;    // 1-10
  levelHistory: LevelLog[];
}
```

### HabitLogs
```typescript
{
  id: string;
  date: string;           // 'YYYY-MM-DD'
  habits: Record<string, boolean>;
  energy?: number;
  mood?: number;
}
```

### ChallengeLogs
```typescript
{
  id: string;
  templateId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  title?: string;
  source?: string;
  content?: string;
  insights: string[];
}
```

---

## 주요 기능 구현 가이드

### 새 습관 추가하기
1. `/src/lib/db.ts`의 `defaultHabits` 배열에 추가
2. `HabitDefinition` 타입 준수

### 새 챌린지 템플릿 추가하기
1. `/src/lib/db.ts`의 `defaultChallenges` 배열에 추가
2. `frequency`: 'daily' | 'weekly' | 'monthly'

### 새 페이지 추가하기
1. `/src/pages/`에 페이지 컴포넌트 생성
2. `/src/pages/index.ts`에서 export
3. `/src/App.tsx`의 `AppContent`에 라우팅 추가
4. `/src/components/layout/BottomNav.tsx`에 네비게이션 아이템 추가

### 새 UI 컴포넌트 추가하기
1. `/src/components/ui/`에 컴포넌트 생성
2. `/src/components/ui/index.ts`에서 export

---

## 확장 계획

### Phase 2 기능 (미구현)
- [ ] PWA 지원 (Service Worker)
- [ ] 데이터 내보내기/가져오기 (JSON)
- [ ] 클라우드 동기화 (Firebase/Supabase)
- [ ] 알림 시스템

### Phase 3 기능
- [ ] AI 기반 인사이트 분석
- [ ] 커뮤니티/공유 기능
- [ ] 고급 회고 템플릿

---

## 트러블슈팅

### IndexedDB 데이터 초기화
개발 중 데이터를 초기화하려면:
1. 브라우저 개발자 도구 열기
2. Application → Storage → IndexedDB
3. `CatalyzeDB` 삭제

### 빌드 에러
```bash
# 노드 모듈 재설치
rm -rf node_modules package-lock.json
npm install
```

### 타입 에러
```bash
# 타입 체크
npx tsc --noEmit
```

---

## 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

예시:
```
feat: Add weekly reflection modal
fix: Habit toggle not persisting
docs: Update README with setup instructions
```

---

## 유용한 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint

# 타입 체크만
npx tsc --noEmit
```

---

## 참고 자료

- [React 문서](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Dexie.js](https://dexie.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Recharts](https://recharts.org/)
- [D3.js](https://d3js.org/)
