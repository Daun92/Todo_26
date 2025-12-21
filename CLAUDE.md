# CLAUDE.md - Mosaic 개발 가이드

이 문서는 Mosaic 프로젝트의 개발 가이드입니다. AI 어시스턴트나 새로운 개발자가 프로젝트를 이해하고 기여할 때 참고하세요.

> 상세 앱 정의서는 [MOSAIC.md](./MOSAIC.md)를 참고하세요.

---

## 프로젝트 개요

**Mosaic**은 개인 성장을 위한 AI 파트너 앱입니다.

### 핵심 철학
```
"넓고 얕게 탐험하며, 점들을 연결하고,
나만의 시각과 그 반대편을 동시에 이해하는 성장 파트너"
```

### 핵심 차별점
- **나만의 알고리즘**: 성장 방향 및 경로 인식
- **대척점**: 기회 및 대안 제시, 편향 인식

### 4가지 핵심 기능 (Pillars)
1. **Feed** - 학습 자료 발견 및 추천
2. **Learn** - 인터뷰 기반 학습 및 메모
3. **Connect** - 지식 연결 및 패턴 발견
4. **Reflect** - 회고 및 성장 시각화

---

## 빠른 시작

```bash
# 개발 서버 실행
npm run dev

# 타입 체크 & 빌드
npm run build

# 린트
npm run lint
```

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Vite | 7.x | 빌드 도구 |
| Tailwind CSS | 4.x | 스타일링 |
| Zustand | 5.x | 상태 관리 |
| Dexie.js | 4.x | IndexedDB (오프라인) |
| D3.js | 7.x | 지식 그래프 시각화 |
| Recharts | 3.x | 차트/통계 |
| Lucide React | - | 아이콘 |

---

## 프로젝트 구조

```
src/
├── components/
│   ├── feed/           # Feed 관련 컴포넌트
│   ├── learn/          # Learn 관련 컴포넌트
│   ├── connect/        # Connect 관련 컴포넌트
│   ├── reflect/        # Reflect 관련 컴포넌트
│   ├── layout/         # 레이아웃 (Header, BottomNav)
│   ├── modals/         # 모달 컴포넌트
│   └── ui/             # 공통 UI 컴포넌트
├── hooks/              # 커스텀 훅
├── lib/
│   ├── db.ts           # Dexie 데이터베이스
│   └── utils.ts        # 유틸리티
├── pages/              # 페이지 컴포넌트
├── stores/             # Zustand 스토어
├── types/              # TypeScript 타입
├── App.tsx
├── main.tsx
└── index.css
```

---

## 핵심 파일 설명

### `/src/types/index.ts`
모든 TypeScript 타입 정의:
- `Content`: 학습 콘텐츠 (article, note, thought)
- `InterviewSession`: 인터뷰 세션
- `Memo`: 자유 메모
- `Connection`: 지식 연결
- `Tag`: 태그
- `Reflection`: 회고

### `/src/lib/db.ts`
Dexie.js 데이터베이스:
- `MosaicDB` 클래스: 테이블 정의
- CRUD 헬퍼 함수들

### `/src/stores/useStore.ts`
Zustand 전역 상태:
- `activeTab`: 현재 탭 (feed/learn/connect/reflect)
- `darkMode`: 다크모드
- `activeModal`, `modalData`: 모달 상태

---

## 코딩 컨벤션

### 파일 명명
- 컴포넌트: `PascalCase.tsx` (예: `FeedCard.tsx`)
- 훅: `camelCase.ts` (예: `useContents.ts`)
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
  isActive && 'border-indigo-500'
)}>
```

### 경로 별칭
`@/`를 사용하여 `src/` 디렉토리 참조:
```tsx
import { Button } from '@/components/ui';
import { useStore } from '@/stores/useStore';
```

---

## 데이터베이스 스키마

### Contents
```typescript
{
  id: string;
  type: 'article' | 'note' | 'thought';
  title: string;
  url?: string;
  body?: string;
  tags: string[];
  status: 'queued' | 'learning' | 'completed';
  counterpoint?: string;
  createdAt: Date;
}
```

### InterviewSessions
```typescript
{
  id: string;
  contentId: string;
  exchanges: Exchange[];
  insights: string[];
  createdAt: Date;
}
```

### Memos
```typescript
{
  id: string;
  text: string;
  contentId?: string;
  tags: string[];
  organized: boolean;
  createdAt: Date;
}
```

---

## 개발 가이드

### 새 페이지 추가하기
1. `/src/pages/`에 페이지 컴포넌트 생성
2. `/src/pages/index.ts`에서 export
3. `/src/App.tsx`의 `AppContent`에 라우팅 추가
4. `/src/components/layout/BottomNav.tsx`에 탭 추가

### 새 UI 컴포넌트 추가하기
1. `/src/components/ui/`에 컴포넌트 생성
2. `/src/components/ui/index.ts`에서 export

### 새 모달 추가하기
1. `/src/components/modals/`에 모달 생성
2. `/src/components/modals/index.ts`에서 export
3. `/src/App.tsx`에 모달 렌더링 추가

---

## MVP 로드맵

### Phase 1: Feed (발견)
- [x] 기본 UI 구조
- [ ] 콘텐츠 CRUD 훅
- [ ] 피드 카드 컴포넌트
- [ ] 태그 시스템

### Phase 2: Learn (학습)
- [ ] 인터뷰 세션 구현
- [ ] 메모 시스템
- [ ] 학습 완료 처리

### Phase 3: Connect (연결)
- [ ] 연결 데이터 모델
- [ ] 지식 그래프 (D3.js)
- [ ] 패턴 발견 알고리즘

### Phase 4: Reflect (회고)
- [ ] 회고 리포트 생성
- [ ] 성장 타임라인
- [ ] 편향 분석

---

## 트러블슈팅

### IndexedDB 데이터 초기화
1. 브라우저 개발자 도구 열기
2. Application → Storage → IndexedDB
3. `MosaicDB` 삭제

### 빌드 에러
```bash
rm -rf node_modules package-lock.json
npm install
```

### 타입 에러
```bash
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
chore: 빌드, 설정 변경
```

예시:
```
feat: Add interview session component
fix: Content status not updating
docs: Update MOSAIC.md with new features
```

---

## 유용한 명령어

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기
npm run lint      # 린트
npx tsc --noEmit  # 타입 체크만
```
